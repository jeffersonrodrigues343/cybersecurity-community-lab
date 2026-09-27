using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Cybersecurity Community Lab API (C# .NET 8)", Version = "v1" });
});

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

// HttpClient for Supabase API calls
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

// In-Memory Storage Fallback (Ensures zero-crash and immediate operation even before Supabase credentials)
var memoryFeedbacks = new List<CommunityFeedback>
{
    new(
        Id: Guid.NewGuid().ToString(),
        Author: "Lucas M. Silva (Comunidade de TI)",
        Text: "Achei a dinâmica dos desafios incrível para quem está começando. Consegui entender na prática como os criminosos montam links falsos.",
        Rating: 5,
        CreatedAt: DateTime.UtcNow.AddHours(-2)
    ),
    new(
        Id: Guid.NewGuid().ToString(),
        Author: "Mariana R. (Estudante Ensino Médio)",
        Text: "O simulador de entropia me mostrou que minha senha do e-mail era muito fraca. Já alterei e ativei o 2FA!",
        Rating: 5,
        CreatedAt: DateTime.UtcNow.AddMinutes(-45)
    )
};

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// 1. Healthcheck
app.MapGet("/api/health", (IConfiguration config) =>
{
    var supabaseConfigured = !string.IsNullOrEmpty(config["Supabase:Url"]) ||
                             !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("SUPABASE_URL"));

    return Results.Ok(new
    {
        status = "Healthy",
        platform = "Cybersecurity Community Lab - Backend C# (.NET 8)",
        project = "Projeto de Extensão I - ADS",
        supabaseActive = supabaseConfigured,
        timestamp = DateTime.UtcNow
    });
})
.WithName("HealthCheck")
.WithOpenApi();

// 2. Validate CTF Flag
app.MapPost("/api/flags/validate", ([FromBody] FlagValidationRequest request) =>
{
    const string VALID_FLAG = "HACKLEARN{seguranca_web_iniciante_2024}";
    var cleanFlag = request.Flag?.Trim();

    if (string.Equals(cleanFlag, VALID_FLAG, StringComparison.Ordinal))
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

// 3. Get Community Testimonials (Supabase + Memory)
app.MapGet("/api/feedback", async (IHttpClientFactory httpFactory, IConfiguration config) =>
{
    var supabaseUrl = config["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL");

    if (!string.IsNullOrEmpty(supabaseUrl))
    {
        try
        {
            var client = httpFactory.CreateClient("SupabaseClient");
            var response = await client.GetAsync("/rest/v1/feedbacks?select=*&order=created_at.desc");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var items = JsonSerializer.Deserialize<List<CommunityFeedback>>(content);
                if (items != null && items.Count > 0)
                {
                    return Results.Ok(items);
                }
            }
        }
        catch
        {
            // Fallback gracefully to memoryFeedbacks on any connection interruption
        }
    }

    return Results.Ok(memoryFeedbacks.OrderByDescending(f => f.CreatedAt));
})
.WithName("GetFeedbacks")
.WithOpenApi();

// 4. Submit Community Testimonial (Inserts to Supabase or Memory)
app.MapPost("/api/feedback", async ([FromBody] FeedbackSubmission submission, IHttpClientFactory httpFactory, IConfiguration config) =>
{
    if (string.IsNullOrWhiteSpace(submission.Text) || submission.Text.Length < 3)
    {
        return Results.BadRequest(new { message = "O depoimento deve ter no mínimo 3 caracteres." });
    }

    var newEntry = new CommunityFeedback(
        Id: Guid.NewGuid().ToString(),
        Author: string.IsNullOrWhiteSpace(submission.Author) ? "Participante da Comunidade" : submission.Author.Trim(),
        Text: submission.Text.Trim(),
        Rating: Math.Clamp(submission.Rating, 1, 5),
        CreatedAt: DateTime.UtcNow
    );

    // Save in memory
    memoryFeedbacks.Insert(0, newEntry);

    // If Supabase is configured, push asynchronously
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
            // Logged in memory fallback
        }
    }

    return Results.Created($"/api/feedback/{newEntry.Id}", new
    {
        message = "Depoimento registrado com sucesso! Obrigado pela contribuição social.",
        feedback = newEntry
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

app.Run();

// -------------------------------------------------------------
// RECORDS / DTOs
// -------------------------------------------------------------
public record FlagValidationRequest(string? Flag, string? TaskId);
public record FlagValidationResponse(bool Success, string Message, int XpEarned);

public record CommunityFeedback(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("author")] string Author,
    [property: JsonPropertyName("text")] string Text,
    [property: JsonPropertyName("rating")] int Rating,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

public record FeedbackSubmission(string? Author, string Text, int Rating = 5);

public record EntropyRequest(string? Password);
public record EntropyResponse(int Score, string Strength, string EstimatedTimeToCrack, string Recommendations);
