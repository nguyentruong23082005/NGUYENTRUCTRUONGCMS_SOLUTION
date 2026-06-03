using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Security.Claims;
using Microsoft.OpenApi.Models;
using System.Reflection;
using CMS.Data;
using CMS.Backend.Services.Api;
using CMS.Backend.Middleware;
using CMS.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký ApplicationDbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddMemoryCache();
builder.Services.Configure<CMS.Backend.Models.StockSettings>(builder.Configuration.GetSection("StockSettings"));
builder.Services.Configure<OrderPolicy>(builder.Configuration.GetSection("OrderPolicy"));

// Đăng ký dịch vụ WebAPI Services (Buổi 6)
builder.Services.AddScoped<IProductApiService, ProductApiService>();
builder.Services.AddScoped<IPostApiService, PostApiService>();
builder.Services.AddScoped<ICategoryApiService, CategoryApiService>();
builder.Services.AddScoped<IBannerApiService, BannerApiService>();
builder.Services.AddScoped<IStoreApiService, StoreApiService>();
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
    options.AddPolicy("ReactDevelopmentCors", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .WithMethods("GET", "POST", "PUT", "DELETE"); // GET là chính trong Phase 6
    });
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
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "PhucLongPremiumSecretKeyForReactJSFrontEnd2026SuperSecureKey32Chars"))
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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Đăng ký API Middleware chỉ áp dụng cho route bắt đầu bằng /api (Buổi 6)
app.UseWhen(
    ctx => ctx.Request.Path.StartsWithSegments("/api"),
    apiApp => apiApp.UseMiddleware<ApiExceptionHandlingMiddleware>()
);

app.UseCors("ReactDevelopmentCors");

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

app.Run();
