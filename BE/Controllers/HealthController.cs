using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public HealthController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        bool dbConnected = false;
        string dbName = "QuanLyChoThueOto";
        int carCount = 0;

        try
        {
            carCount = await _context.Xes.CountAsync(x => !x.DaXoa);
            dbConnected = true;
        }
        catch
        {
            dbConnected = false;
        }

        var result = new
        {
            status = "ONLINE",
            service = "AutoRental C# .NET Web API",
            framework = ".NET 8.0 / ASP.NET Core",
            version = "1.0.0",
            timestamp = DateTime.UtcNow,
            database = new
            {
                connected = dbConnected,
                engine = "Microsoft SQL Server 2019",
                database = dbName,
                server = "ACER\\MS1SQLSERVER",
                activeCars = carCount
            }
        };

        return Ok(result);
    }
}
