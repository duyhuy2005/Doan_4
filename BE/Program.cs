using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CarRental.Api.Data;
using CarRental.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình DbContext kết nối SQL Server cục bộ
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost,1433;Database=QuanLyChoThueOto;User Id=carrental_user;Password=CarRental@2026!;TrustServerCertificate=True;MultipleActiveResultSets=True;";

builder.Services.AddDbContext<CarRentalDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// 2. Đăng ký Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IBookingLifecycleService, BookingLifecycleService>();
builder.Services.AddHostedService<ExpiredBookingSweepBackgroundService>();

// 3. Cấu hình Controllers và chuẩn hóa JSON CamelCase
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// 4. Cấu hình CORS cho Frontend ReactJS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 5. Cấu hình JWT Bearer Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "car_rental_super_secret_jwt_key_2026_xyz987_must_be_32_bytes_or_more!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CarRentalApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CarRentalClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

// 6. Cấu hình Swagger với Bearer Auth
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AutoRental Management System Web API",
        Version = "v1",
        Description = "C# .NET 8.0 ASP.NET Core RESTful API kết nối Microsoft SQL Server 2019"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT token theo format: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
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

var app = builder.Build();

// 7. Middlewares Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AutoRental API v1");
    });
}

app.UseCors("AllowAllOrigins");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health Check Root
app.MapGet("/", () => Results.Redirect("/api/health"));

Console.WriteLine("==================================================================");
Console.WriteLine("🚀 AutoRental C# .NET 8.0 Web API đang khởi chạy tại http://localhost:5000");
Console.WriteLine("📡 Swagger API Documentation tại: http://localhost:5000/swagger");
Console.WriteLine("🗄️ Database: Microsoft SQL Server (QuanLyChoThueOto)");
Console.WriteLine("==================================================================");

app.Run();
