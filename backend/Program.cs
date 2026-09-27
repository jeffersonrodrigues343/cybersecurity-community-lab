using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Cybersecurity Community Lab API (C# .NET 8 + SQLite/Supabase)", Version = "v1" });
});

// Configure SQLite Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=cyberlab.db";
builder.Services.AddDbContext<CyberLabDbContext>(options =>
    options.UseSqlite(connectionString));

// Enable CORS for React Frontend and Vercel
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// HttpClient for optional Supabase synchronization
builder.Services.AddHttpClient("SupabaseClient", (sp, client) =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var supabaseUrl = config["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");
    var supabaseKey = config["Supabase:AnonKey"] ?? Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY");

    if (!string.IsNullOrEmpty(supabaseUrl))
    {
        client.BaseAddress = new Uri(supabaseUrl);
    }
    if (!string.IsNullOrEmpty(supabaseKey))
    {
        client.DefaultRequestHeaders.Add("apikey", supabaseKey);
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");
    }
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CyberLab API v1");
    c.RoutePrefix = "swagger";
});

// Ensure SQLite Database is initialized and seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CyberLabDbContext>();
    db.Database.EnsureCreated();

    if (!db.Feedbacks.Any())
    {
        db.Feedbacks.AddRange(
            new FeedbackEntity
            {
                Id = Guid.NewGuid().ToString(),
                Author = "Lucas M. Silva (Comunidade de TI)",
                Text = "Achei a dinâmica dos desafios incrível para quem está começando. Consegui entender na prática como os criminosos montam links falsos.",
                Rating = 5,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new FeedbackEntity
            {
                Id = Guid.NewGuid().ToString(),
                Author = "Mariana R. (Estudante Ensino Médio)",
                Text = "O simulador de entropia me mostrou que minha senha do e-mail era muito fraca. Já alterei e ativei o 2FA!",
                Rating = 5,
                CreatedAt = DateTime.UtcNow.AddMinutes(-45)
            }
        );
        db.SaveChanges();
    }
}

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// 1. Healthcheck
app.MapGet("/api/health", async (CyberLabDbContext db, IConfiguration config) =>
{
    var supabaseConfigured = !string.IsNullOrEmpty(config["Supabase:Url"]) ||
                             !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("SUPABASE_URL"));

    var totalFeedbacks = await db.Feedbacks.CountAsync();
    var totalFlagsValidated = await db.FlagLogs.CountAsync(f => f.Success);

    return Results.Ok(new
    {
        status = "Healthy",
        platform = "Cybersecurity Community Lab - Backend C# (.NET 8)",
        project = "Projeto de Extensão I - ADS (Anhanguera)",
        database = "SQLite (cyberlab.db) + Supabase Ready",
        metrics = new
        {
            feedbacksStored = totalFeedbacks,
            flagsValidated = totalFlagsValidated
        },
        supabaseActive = supabaseConfigured,
        timestamp = DateTime.UtcNow
    });
})
.WithName("HealthCheck")
.WithOpenApi();

// 2. Validate CTF Flag (Records in Database)
app.MapPost("/api/flags/validate", async ([FromBody] FlagValidationRequest request, CyberLabDbContext db) =>
{
    const string VALID_FLAG = "HACKLEARN{seguranca_web_iniciante_2024}";
    var cleanFlag = request.Flag?.Trim() ?? string.Empty;
    var isSuccess = string.Equals(cleanFlag, VALID_FLAG, StringComparison.Ordinal);

    // Save attempt in SQLite
    db.FlagLogs.Add(new FlagLogEntity
    {
        Flag = cleanFlag.Length > 200 ? cleanFlag.Substring(0, 200) : cleanFlag,
        TaskId = request.TaskId ?? "task3-webctf",
        Success = isSuccess,
        Timestamp = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    if (isSuccess)
    {
        return Results.Ok(new FlagValidationResponse(
            Success: true,
            Message: "FLAG VALIDADA COM SUCESSO! Você inspecionou o código com perfeição.",
            XpEarned: 100
        ));
    }

    return Results.BadRequest(new FlagValidationResponse(
        Success: false,
        Message: "Flag incorreta. Verifique o comentário HTML ou execute 'cat flag.txt' no terminal.",
        XpEarned: 0
    ));
})
.WithName("ValidateFlag")
.WithOpenApi();

// 3. Get Community Testimonials (from SQLite Database)
app.MapGet("/api/feedback", async (CyberLabDbContext db) =>
{
    var list = await db.Feedbacks
        .OrderByDescending(f => f.CreatedAt)
        .Select(f => new CommunityFeedbackDto(
            f.Id,
            f.Author,
            f.Text,
            f.Rating,
            f.CreatedAt
        ))
        .ToListAsync();

    return Results.Ok(list);
})
.WithName("GetFeedbacks")
.WithOpenApi();

// 4. Submit Community Testimonial (Inserts to SQLite and syncs to Supabase if configured)
app.MapPost("/api/feedback", async ([FromBody] FeedbackSubmission submission, CyberLabDbContext db, IHttpClientFactory httpFactory, IConfiguration config) =>
{
    if (string.IsNullOrWhiteSpace(submission.Text) || submission.Text.Length < 3)
    {
        return Results.BadRequest(new { message = "O depoimento deve ter no mínimo 3 caracteres." });
    }

    var newEntry = new FeedbackEntity
    {
        Id = Guid.NewGuid().ToString(),
        Author = string.IsNullOrWhiteSpace(submission.Author) ? "Participante da Comunidade" : submission.Author.Trim(),
        Text = submission.Text.Trim(),
        Rating = Math.Clamp(submission.Rating, 1, 5),
        CreatedAt = DateTime.UtcNow
    };

    // Save to SQLite
    db.Feedbacks.Add(newEntry);
    await db.SaveChangesAsync();

    // Mirror to Supabase if credentials are provided
    var supabaseUrl = config["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");
    if (!string.IsNullOrEmpty(supabaseUrl))
    {
        try
        {
            var client = httpFactory.CreateClient("SupabaseClient");
            var payload = new StringContent(
                JsonSerializer.Serialize(new
                {
                    id = newEntry.Id,
                    author = newEntry.Author,
                    text = newEntry.Text,
                    rating = newEntry.Rating,
                    created_at = newEntry.CreatedAt.ToString("o")
                }),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            await client.PostAsync("/rest/v1/feedbacks", payload);
        }
        catch
        {
            // SQLite already has the data safely stored
        }
    }

    var responseDto = new CommunityFeedbackDto(
        newEntry.Id,
        newEntry.Author,
        newEntry.Text,
        newEntry.Rating,
        newEntry.CreatedAt
    );

    return Results.Created($"/api/feedback/{newEntry.Id}", new
    {
        message = "Depoimento registrado com sucesso no banco de dados!",
        feedback = responseDto
    });
})
.WithName("SubmitFeedback")
.WithOpenApi();

// 5. Server-side Password Entropy Calculation
app.MapPost("/api/crypto/entropy", ([FromBody] EntropyRequest request) =>
{
    var pwd = request.Password ?? string.Empty;
    var length = pwd.Length;
    var score = 0;

    if (length >= 8) score += 25;
    if (length >= 12) score += 25;
    if (pwd.Any(char.IsUpper)) score += 15;
    if (pwd.Any(char.IsDigit)) score += 15;
    if (pwd.Any(c => !char.IsLetterOrDigit(c))) score += 20;

    string strength;
    string timeToCrack;
    string recommendations;

    if (score < 40)
    {
        strength = "Muito Fraca";
        timeToCrack = "< 1 segundo (Vulnerável a ataques de dicionário e rainbow tables)";
        recommendations = "Adicione ao menos 12 caracteres misturando maiúsculas, números e símbolos.";
    }
    else if (score < 75)
    {
        strength = "Média";
        timeToCrack = "Alguns dias a meses";
        recommendations = "Aumente o comprimento para mais de 14 caracteres para resistir a ataques de força bruta com GPUs.";
    }
    else
    {
        strength = "Forte";
        timeToCrack = "Milhares a milhões de anos";
        recommendations = "Excelente resistência criptográfica compatível com padrões NIST SP 800-63B.";
    }

    return Results.Ok(new EntropyResponse(score, strength, timeToCrack, recommendations));
})
.WithName("AnalyzeEntropy")
.WithOpenApi();

// 6. General Statistics Endpoint
app.MapGet("/api/stats", async (CyberLabDbContext db) =>
{
    var totalFeedbacks = await db.Feedbacks.CountAsync();
    var flagLogs = await db.FlagLogs.ToListAsync();
    var successfulFlags = flagLogs.Count(f => f.Success);
    var totalAttempts = flagLogs.Count;

    return Results.Ok(new
    {
        feedbacks = totalFeedbacks,
        flagsCaptured = successfulFlags,
        flagAttempts = totalAttempts,
        storageEngine = "SQLite (Microsoft.EntityFrameworkCore.Sqlite)",
        databaseFile = "cyberlab.db",
        uptime = DateTime.UtcNow
    });
})
.WithName("GetStats")
.WithOpenApi();

app.Run();

// -------------------------------------------------------------
// ENTITY FRAMEWORK CORE MODELS & DBCONTEXT
// -------------------------------------------------------------
public class FeedbackEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Author { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FlagLogEntity
{
    public int Id { get; set; }
    public string Flag { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class CyberLabDbContext : DbContext
{
    public CyberLabDbContext(DbContextOptions<CyberLabDbContext> options) : base(options) { }

    public DbSet<FeedbackEntity> Feedbacks => Set<FeedbackEntity>();
    public DbSet<FlagLogEntity> FlagLogs => Set<FlagLogEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<FeedbackEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Author).HasMaxLength(150);
            entity.Property(e => e.Text).HasMaxLength(2000);
        });

        modelBuilder.Entity<FlagLogEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Flag).HasMaxLength(255);
            entity.Property(e => e.TaskId).HasMaxLength(100);
        });
    }
}

// -------------------------------------------------------------
// RECORDS / DTOs
// -------------------------------------------------------------
public record FlagValidationRequest(string? Flag, string? TaskId);
public record FlagValidationResponse(bool Success, string Message, int XpEarned);

public record CommunityFeedbackDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("author")] string Author,
    [property: JsonPropertyName("text")] string Text,
    [property: JsonPropertyName("rating")] int Rating,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

public record FeedbackSubmission(string? Author, string Text, int Rating = 5);

public record EntropyRequest(string? Password);
public record EntropyResponse(int Score, string Strength, string EstimatedTimeToCrack, string Recommendations);
