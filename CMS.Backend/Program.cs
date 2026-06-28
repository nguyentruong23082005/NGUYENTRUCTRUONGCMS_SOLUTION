using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.OpenApi.Models;
using System.Reflection;
using CMS.Data;
using CMS.Backend.Services.Api;
using CMS.Backend.Middleware;
using CMS.Backend.Models;

using CMS.Backend.ModelBinders;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be configured outside source control and contain at least 32 characters.");
}

// Đăng ký ApplicationDbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllersWithViews(options =>
{
    options.ModelBinderProviders.Insert(0, new InvariantDoubleModelBinderProvider());
});
builder.Services.AddMemoryCache();
builder.Services.Configure<CMS.Backend.Models.StockSettings>(builder.Configuration.GetSection("StockSettings"));
builder.Services.Configure<OrderPolicy>(builder.Configuration.GetSection("OrderPolicy"));
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));

// Đăng ký dịch vụ Email
builder.Services.AddScoped<IEmailService, EmailService>();

// Đăng ký dịch vụ WebAPI Services (Buổi 6)
builder.Services.AddScoped<IProductApiService, ProductApiService>();
builder.Services.AddScoped<IPostApiService, PostApiService>();
builder.Services.AddScoped<ICategoryApiService, CategoryApiService>();
builder.Services.AddScoped<IBannerApiService, BannerApiService>();
builder.Services.AddScoped<IStoreApiService, StoreApiService>();
builder.Services.AddScoped<ICustomerApiService, CustomerApiService>();
builder.Services.AddScoped<ICustomerAddressApiService, CustomerAddressApiService>();
builder.Services.AddScoped<IVoucherApiService, VoucherApiService>();
builder.Services.AddScoped<IReviewApiService, ReviewApiService>();
builder.Services.AddScoped<IOrderApiService, OrderApiService>();
builder.Services.AddScoped<IStockLockStrategy>(sp =>
{
    var db = sp.GetRequiredService<ApplicationDbContext>();
    if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")
    {
        return new InMemoryStockLockStrategy(db);
    }
    return new SqlServerStockLockStrategy(db);
});

// Cấu hình CORS cho ReactJS Frontend (Buổi 6)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:5174",
                  "http://127.0.0.1:5173",
                  "http://127.0.0.1:5174",
                  "https://localhost:5173",
                  "https://localhost:5174",
                  "https://127.0.0.1:5173",
                  "https://127.0.0.1:5174")
              .AllowAnyHeader()
              .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS");
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("AuthPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(15)
            }));
});

// Cấu hình Swagger kèm XML Comments (Buổi 6)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "CMS WebAPI", Version = "v1" });
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

    // Cấu hình Swagger JWT
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token JWT của bạn (chỉ dán token, không cần gõ chữ Bearer)",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
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
            System.Array.Empty<string>()
        }
    });
});

// Khai báo dịch vụ xác thực Cookie & JWT Bearer song song
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.LoginPath = "/Account/Login";           // Đường dẫn nếu chưa đăng nhập
    options.AccessDeniedPath = "/Account/AccessDenied"; // Đường dẫn nếu không có quyền
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
})
.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var cache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
            var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
            var customerIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tokenVersionClaim = context.Principal?.FindFirst("token_version")?.Value;

            if (string.IsNullOrEmpty(customerIdClaim) || string.IsNullOrEmpty(tokenVersionClaim) ||
                !int.TryParse(customerIdClaim, out int customerId) || !int.TryParse(tokenVersionClaim, out int tokenVersion))
            {
                context.Fail("Unauthorized");
                return;
            }

            string cacheKey = $"token-version-{customerId}";
            if (!cache.TryGetValue(cacheKey, out int currentDbVersion))
            {
                var customer = await db.Customers.FindAsync(customerId);
                if (customer == null || customer.IsDeleted)
                {
                    context.Fail("User not found or deleted");
                    return;
                }
                currentDbVersion = customer.TokenVersion;
                cache.Set(cacheKey, currentDbVersion, TimeSpan.FromSeconds(30));
            }

            if (currentDbVersion != tokenVersion)
            {
                context.Fail("Token has been revoked");
            }
        }
    };
});

GoogleCredential? credential = null;
var keyPath = builder.Configuration["Firebase:ServiceAccountKeyPath"];

if (!string.IsNullOrEmpty(keyPath) && File.Exists(keyPath))
{
    // Local / Dev: đọc từ file JSON
    credential = GoogleCredential.FromFile(keyPath);
}
else
{
    // Staging / Production: đọc từ biến môi trường dạng chuỗi JSON
    var json = Environment.GetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!string.IsNullOrEmpty(json))
    {
        credential = GoogleCredential.FromJson(json);
    }
}

if (credential != null)
{
    if (FirebaseApp.DefaultInstance == null)
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = credential
        });
    }
}
else
{
    Console.WriteLine("Warning: Firebase credentials are not configured. Social login will fail.");
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.Use(async (context, next) =>
{
    context.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");
    context.Response.Headers.TryAdd("X-Frame-Options", "DENY");
    context.Response.Headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.TryAdd("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    context.Response.Headers.TryAdd(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.ckeditor.com https://unpkg.com; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://unpkg.com; " +
        "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; " +
        "img-src 'self' data: http: https:; " +
        "connect-src 'self' http://localhost:5173 http://localhost:5174 http://127.0.0.1:5173 http://127.0.0.1:5174 https://localhost:5173 https://localhost:5174 https://127.0.0.1:5173 https://127.0.0.1:5174 https://nominatim.openstreetmap.org; " +
        "frame-ancestors 'none';");
    await next();
});
app.UseStaticFiles();

app.UseRouting();
app.UseRateLimiter();

// Đăng ký API Middleware chỉ áp dụng cho route bắt đầu bằng /api (Buổi 6)
app.UseWhen(
    ctx => ctx.Request.Path.StartsWithSegments("/api"),
    apiApp => apiApp.UseMiddleware<ApiExceptionHandlingMiddleware>()
);

app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication(); // BƯỚC A: Xác nhận "Anh là ai?" (Kiểm tra thẻ bài)
app.UseAuthorization();  // BƯỚC B: Xác nhận "Anh được làm gì?" (Kiểm tra quyền)

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapControllers();

app.Run();
