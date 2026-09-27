using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// desativa o header server do kestrel pra evitar fingerprinting e limita tamanho maximo do corpo da requisicao
builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.Limits.MaxRequestBodySize = 256 * 1024; // maximo 256kb por request
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "HackLearn API", Version = "v1" });
});

// banco sqlite local
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=cyberlab.db";
builder.Services.AddDbContext<CyberLabDbContext>(options => options.UseSqlite(connectionString));

// cors seguro para o front local e deploy na vercel
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            try
            {
                var uri = new Uri(origin);
                return uri.Host == "localhost" || uri.Host == "127.0.0.1" || uri.Host.EndsWith("vercel.app");
            }
            catch
            {
                return false;
            }
        })
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// cliente http pro supabase (se as chaves estiverem no appsettings ou variavel de ambiente)
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

// tratamento global de excecoes pra nunca vazar stack trace
app.UseExceptionHandler(handlerApp =>
{
    handlerApp.Run(async ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsync("{\"error\":\"Ocorreu um erro interno. Tente novamente mais tarde.\"}");
    });
});

// middleware de headers de seguranca padrao owasp
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    await next();
});

app.UseCors("AllowFrontend");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HackLearn v1");
    c.RoutePrefix = "swagger";
});

// inicializa as tabelas do sqlite e popula se tiver vazio
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

// controle de rate limit em memoria pra evitar ataques de brute force e spam
var rateLimits = new ConcurrentDictionary<string, (int attempts, DateTime resetTime)>();

// healthcheck da api
app.MapGet("/api/health", async (CyberLabDbContext db, IConfiguration config) =>
{
    var supabaseUrl = config["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");
    var totalFeedbacks = await db.Feedbacks.CountAsync();
    var totalFlags = await db.FlagLogs.CountAsync(f => f.Success);

    return Results.Ok(new
    {
        status = "ok",
        app = "HackLearn API (.NET 8)",
        db = "SQLite local + Supabase sync",
        feedbacks = totalFeedbacks,
        flagsCaptured = totalFlags,
        supabaseConfigured = !string.IsNullOrEmpty(supabaseUrl),
        time = DateTime.UtcNow
    });
});

// valida a flag enviada pelo usuario com protecao contra forca bruta
app.MapPost("/api/flags/validate", async ([FromBody] FlagValidationRequest request, HttpContext ctx, CyberLabDbContext db, IConfiguration config) =>
{
    var clientIp = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var now = DateTime.UtcNow;

    // checa tentativas do ip nos ultimos 60 segundos (max 15 tentativas)
    var limitKey = $"flags_{clientIp}";
    var limit = rateLimits.GetOrAdd(limitKey, _ => (0, now.AddMinutes(1)));
    if (now > limit.resetTime)
    {
        rateLimits[limitKey] = (1, now.AddMinutes(1));
    }
    else
    {
        if (limit.attempts >= 15)
        {
            return Results.StatusCode(429); // Too Many Requests
        }
        rateLimits[limitKey] = (limit.attempts + 1, limit.resetTime);
    }

    // valida tamanho do payload
    var cleanFlag = (request.Flag ?? "").Trim();
    if (cleanFlag.Length > 100)
    {
        return Results.BadRequest(new { success = false, message = "Flag muito longa (tamanho suspeito)." });
    }

    var validFlag = config["Ctf:ValidFlag"] ?? "HACKLEARN{seguranca_web_iniciante_2024}";
    var isCorrect = string.Equals(cleanFlag, validFlag, StringComparison.Ordinal);

    // registra a tentativa no banco
    db.FlagLogs.Add(new FlagLogEntity
    {
        Flag = cleanFlag.Length > 80 ? cleanFlag[..80] : cleanFlag,
        TaskId = (request.TaskId ?? "task3-webctf")[..Math.Min((request.TaskId ?? "").Length, 30)],
        Success = isCorrect,
        Timestamp = DateTime.UtcNow
    });
    await db.SaveChangesAsync();

    if (isCorrect)
    {
        return Results.Ok(new FlagValidationResponse(
            Success: true,
            Message: "Parabéns! Flag correta, desafio concluído!",
            XpEarned: 100
        ));
    }

    return Results.BadRequest(new FlagValidationResponse(
        Success: false,
        Message: "Flag incorreta. Verifique o código-fonte inspecionado.",
        XpEarned: 0
    ));
});

// lista os depoimentos
app.MapGet("/api/feedback", async (CyberLabDbContext db) =>
{
    var list = await db.Feedbacks
        .OrderByDescending(f => f.CreatedAt)
        .Take(50) // limite de seguranca
        .Select(f => new CommunityFeedbackDto(f.Id, f.Author, f.Text, f.Rating, f.CreatedAt))
        .ToListAsync();

    return Results.Ok(list);
});

// cadastra novo depoimento com sanitizacao html e rate limit anti-spam
app.MapPost("/api/feedback", async ([FromBody] FeedbackSubmission submission, HttpContext ctx, CyberLabDbContext db, IHttpClientFactory httpFactory, IConfiguration config) =>
{
    var clientIp = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var now = DateTime.UtcNow;

    // limita o envio a no maximo 5 depoimentos por minuto por ip
    var feedbackKey = $"feedback_{clientIp}";
    var limit = rateLimits.GetOrAdd(feedbackKey, _ => (0, now.AddMinutes(1)));
    if (now > limit.resetTime)
    {
        rateLimits[feedbackKey] = (1, now.AddMinutes(1));
    }
    else
    {
        if (limit.attempts >= 5)
        {
            return Results.StatusCode(429); // Too Many Requests
        }
        rateLimits[feedbackKey] = (limit.attempts + 1, limit.resetTime);
    }

    if (string.IsNullOrWhiteSpace(submission.Text) || submission.Text.Trim().Length < 3)
    {
        return Results.BadRequest(new { message = "O depoimento deve ter no mínimo 3 caracteres." });
    }

    if (submission.Text.Length > 500)
    {
        return Results.BadRequest(new { message = "O depoimento não pode ter mais de 500 caracteres." });
    }

    // sanitiza campos pra evitar xss injetado no banco
    var cleanAuthor = WebUtility.HtmlEncode((submission.Author ?? "Participante da Comunidade").Trim());
    if (cleanAuthor.Length > 80) cleanAuthor = cleanAuthor[..80];

    var cleanText = WebUtility.HtmlEncode(submission.Text.Trim());
    var rating = Math.Clamp(submission.Rating, 1, 5);

    var entry = new FeedbackEntity
    {
        Id = Guid.NewGuid().ToString(),
        Author = cleanAuthor,
        Text = cleanText,
        Rating = rating,
        CreatedAt = DateTime.UtcNow
    };

    db.Feedbacks.Add(entry);
    await db.SaveChangesAsync();

    // se tiver supabase configurado, manda uma copia pra la tb
    var supabaseUrl = config["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");
    if (!string.IsNullOrEmpty(supabaseUrl))
    {
        try
        {
            var client = httpFactory.CreateClient("SupabaseClient");
            var json = JsonSerializer.Serialize(new
            {
                id = entry.Id,
                author = entry.Author,
                text = entry.Text,
                rating = entry.Rating,
                created_at = entry.CreatedAt.ToString("o")
            });
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            await client.PostAsync("/rest/v1/feedbacks", content);
        }
        catch
        {
            // se o supabase falhar, o sqlite ja garantiu a gravacao
        }
    }

    return Results.Created($"/api/feedback/{entry.Id}", new
    {
        message = "Depoimento salvo com sucesso!",
        feedback = new CommunityFeedbackDto(entry.Id, entry.Author, entry.Text, entry.Rating, entry.CreatedAt)
    });
});

// calcula entropia e forca da senha no backend
app.MapPost("/api/crypto/entropy", ([FromBody] EntropyRequest request) =>
{
    var pwd = request.Password ?? "";

    // trava senhas muito longas pra evitar ataque de dos
    if (pwd.Length > 128)
    {
        return Results.BadRequest(new { message = "Senha muito longa para análise (limite de 128 caracteres)." });
    }

    var length = pwd.Length;
    var score = 0;

    if (length >= 8) score += 25;
    if (length >= 12) score += 25;
    if (pwd.Any(char.IsUpper)) score += 15;
    if (pwd.Any(char.IsDigit)) score += 15;
    if (pwd.Any(c => !char.IsLetterOrDigit(c))) score += 20;

    string strength;
    string timeToCrack;
    string tips;

    if (score < 40)
    {
        strength = "Muito Fraca";
        timeToCrack = "< 1 segundo (Vulnerável a ataques de força bruta)";
        tips = "Adicione mais caracteres, misturando maiúsculas, números e símbolos.";
    }
    else if (score < 75)
    {
        strength = "Média";
        timeToCrack = "Alguns dias a meses";
        tips = "Aumente o tamanho para mais de 12 caracteres para maior segurança.";
    }
    else
    {
        strength = "Forte";
        timeToCrack = "Anos ou séculos";
        tips = "Excelente senha, resistente a dicionários e ataques de força bruta.";
    }

    return Results.Ok(new EntropyResponse(score, strength, timeToCrack, tips));
});

// estatisticas simples do projeto
app.MapGet("/api/stats", async (CyberLabDbContext db) =>
{
    var feedbacksCount = await db.Feedbacks.CountAsync();
    var flagsCount = await db.FlagLogs.CountAsync(f => f.Success);
    var attemptsCount = await db.FlagLogs.CountAsync();

    return Results.Ok(new
    {
        feedbacks = feedbacksCount,
        flagsCaptured = flagsCount,
        flagAttempts = attemptsCount,
        storage = "SQLite + Supabase",
        uptime = DateTime.UtcNow
    });
});

app.Run();

// modelos do entity framework
public class FeedbackEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Author { get; set; } = "";
    public string Text { get; set; } = "";
    public int Rating { get; set; } = 5;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FlagLogEntity
{
    public int Id { get; set; }
    public string Flag { get; set; } = "";
    public string TaskId { get; set; } = "";
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
        modelBuilder.Entity<FeedbackEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Author).HasMaxLength(100);
            e.Property(x => x.Text).HasMaxLength(600);
        });

        modelBuilder.Entity<FlagLogEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Flag).HasMaxLength(120);
            e.Property(x => x.TaskId).HasMaxLength(50);
        });
    }
}

// dtos
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
