using IM_backend.Authorization;
using IM_backend.Extensions;
using IM_backend.Filters;
using IM_backend.Interfaces;
using IM_backend.Middlewares;
using IM_backend.Repositories;
using IM_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
var originsToUse = allowedOrigins?.Where(o => !string.IsNullOrWhiteSpace(o)).ToArray();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ActivityLogActionFilter>();
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "IM Backend API", Version = "v1" });

    // Define Bearer Token security scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token directly below (without 'Bearer ' prefix).\n\nExample: eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddHttpContextAccessor();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "https://qa.collegechamp.in") // Add all frontend dev/prod URLs
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials() // Enable credentials
            .WithExposedHeaders("X-Captcha-Id");
    });
});

var redisConnectionString = builder.Configuration.GetConnectionString("RedisCache");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    try
    {
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.InstanceName = "captcha:";
        });
    }
    catch (Exception)
    {
        builder.Services.AddDistributedMemoryCache();
    }
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Register services
builder.Services.AddScoped<ICaptchaService, CaptchaService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<IPasswordResetRepository, PasswordResetRepository>();
builder.Services.AddHttpClient();
builder.Services.AddApplicationServices();
// Register Permission Service
builder.Services.AddScoped<IPermissionService, PermissionService>();
// Register Activity Log Service
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
// Register JWT Helper Service
builder.Services.AddSingleton<IJwtService, JwtService>();

var jwtSecret = builder.Configuration["Jwt:SecretKey"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var dbConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    var env = builder.Environment.EnvironmentName;
    throw new InvalidOperationException(
        $"[STARTUP ERROR] 'Jwt:SecretKey' is NULL or empty! Current Environment: '{env}'."
    );
}

if (string.IsNullOrWhiteSpace(dbConnectionString))
{
    var env = builder.Environment.EnvironmentName;
    throw new InvalidOperationException(
        $"[STARTUP ERROR] 'ConnectionStrings:DefaultConnection' is NULL or empty in environment '{env}'!"
    );
}

// Configure Standard JWT Authentication using Bearer Headers
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)
        ),
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Authorization with Permission Policy Provider
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

var app = builder.Build();
string uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/Uploads"
});
var logger = app.Services.GetRequiredService<ILogger<Program>>();
var envName = app.Environment.EnvironmentName;
var secretKey = app.Configuration["Jwt:SecretKey"];
var dbConn = app.Configuration.GetConnectionString("DefaultConnection");

logger.LogInformation("==================================================");
logger.LogInformation("Active Hosting Environment : {Env}", envName);
logger.LogInformation("JWT Secret Key Status      : {Status}",
    string.IsNullOrEmpty(secretKey) ? "❌ NULL/EMPTY" : "✅ LOADED (" + secretKey.Substring(0, 5) + "...)");
logger.LogInformation("Database Connection Status : {Status}",
    string.IsNullOrEmpty(dbConn) ? "❌ NULL/EMPTY" : "✅ LOADED");
logger.LogInformation("==================================================");

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment() || envName == "QA")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ReactPolicy");

app.MapGet("/health", (IHostEnvironment env) =>
    Results.Ok($"API is up and running in {env.EnvironmentName} mode!"));

app.MapGet("/debug-config", (IConfiguration config, IHostEnvironment env) =>
{
    return Results.Ok(new
    {
        Environment = env.EnvironmentName,
        JwtSecretLoaded = !string.IsNullOrEmpty(config["Jwt:SecretKey"]),
        JwtIssuer = config["Jwt:Issuer"],
        JwtAudience = config["Jwt:Audience"],
        HasDbConnectionString = !string.IsNullOrEmpty(config.GetConnectionString("DefaultConnection"))
    });
});
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles(new StaticFileOptions
{
    RequestPath = "/institute-magica"
});

app.MapFallbackToFile("index.html");
app.Run();