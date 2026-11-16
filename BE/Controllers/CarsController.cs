using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;
using CarRental.Api.Models;
using CarRental.Api.Services;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/cars")]
public class CarsController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public CarsController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCars(
        [FromQuery] int? brandId,
        [FromQuery] int? categoryId,
        [FromQuery] int? seats,
        [FromQuery] string? transmission,
        [FromQuery] string? fuelType,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var query = _context.Xes
            .Include(x => x.MauXe)
                .ThenInclude(m => m!.HangXe)
            .Include(x => x.MauXe)
                .ThenInclude(m => m!.LoaiXe)
            .Include(x => x.HinhAnhXes)
            .Where(x => !x.DaXoa)
            .AsQueryable();

        if (brandId.HasValue)
            query = query.Where(x => x.MauXe!.HangXeId == brandId.Value);

        if (categoryId.HasValue)
            query = query.Where(x => x.MauXe!.LoaiXeId == categoryId.Value);

        if (seats.HasValue)
            query = query.Where(x => x.MauXe!.SoCho >= seats.Value);

        if (!string.IsNullOrEmpty(transmission))
        {
            var rawTrans = transmission.ToUpper() == "MANUAL" ? "SO_SAN" : "TU_DONG";
            query = query.Where(x => x.MauXe!.HopSo == rawTrans);
        }

        if (!string.IsNullOrEmpty(fuelType))
        {
            var rawFuel = fuelType.ToUpper() switch
            {
                "DIESEL" => "DIESEL",
                "ELECTRIC" => "DIEN",
                "HYBRID" => "HYBRID",
                _ => "XANG"
            };
            query = query.Where(x => x.MauXe!.NhienLieu == rawFuel);
        }

        if (minPrice.HasValue)
            query = query.Where(x => x.GiaThueNgay >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(x => x.GiaThueNgay <= maxPrice.Value);

        if (!string.IsNullOrEmpty(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.MauXe!.TenMauXe.ToLower().Contains(s) || x.BienSo.ToLower().Contains(s));
        }

        var cars = await query.ToListAsync();

        var result = cars.Select(x =>
        {
            var rawImg = x.HinhAnhXes.OrderByDescending(i => i.LaAnhChinh).ThenBy(i => i.ThuTu).FirstOrDefault()?.DuongDanAnh;
            var thumb = CarImageHelper.ResolveThumbnail(x.MauXe?.TenMauXe, rawImg);

            return new CarDto
            {
                Id = x.XeId,
                CarName = x.MauXe?.TenMauXe ?? "Xe ô tô",
                LicensePlate = x.BienSo,
                DailyPrice = x.GiaThueNgay,
                DepositRequired = x.TienDatCocMacDinh,
                Seats = x.MauXe?.SoCho ?? 5,
                Transmission = CarImageHelper.MapTransmission(x.MauXe?.HopSo),
                FuelType = CarImageHelper.MapFuelType(x.MauXe?.NhienLieu),
                FuelConsumption = "7.0 L/100km",
                MileageLimitPerDay = 300,
                ExtraMileageCharge = 5000,
                CurrentMileage = x.SoKmHienTai,
                ThumbnailUrl = thumb,
                Description = x.MoTa ?? $"Xe {x.MauXe?.TenMauXe} chất lượng cao, vận hành êm ái.",
                Status = CarImageHelper.MapCarStatus(x.TrangThai),
                IsFeatured = true,
                BrandId = x.MauXe?.HangXeId ?? 1,
                CategoryId = x.MauXe?.LoaiXeId ?? 1,
                Brand = x.MauXe?.HangXe != null ? new BrandDto
                {
                    Id = x.MauXe.HangXe.HangXeId,
                    Name = x.MauXe.HangXe.TenHangXe,
                    Country = x.MauXe.HangXe.QuocGia,
                    LogoUrl = x.MauXe.HangXe.Logo
                } : null,
                Category = x.MauXe?.LoaiXe != null ? new CategoryDto
                {
                    Id = x.MauXe.LoaiXe.LoaiXeId,
                    Name = x.MauXe.LoaiXe.TenLoaiXe,
                    Slug = x.MauXe.LoaiXe.MaLoaiXe
                } : null,
                Features = new List<FeatureDto>
                {
                    new FeatureDto { Id = 1, Name = "Bản đồ GPS", Icon = "MapPin" },
                    new FeatureDto { Id = 2, Name = "Camera lùi / 360", Icon = "Camera" },
                    new FeatureDto { Id = 3, Name = "Apple CarPlay & Android Auto", Icon = "Smartphone" },
                    new FeatureDto { Id = 4, Name = "Cảm biến va chạm", Icon = "Shield" }
                }
            };
        }).ToList();

        if (!string.IsNullOrEmpty(status))
        {
            result = result.Where(c => c.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return Ok(ApiResponse<List<CarDto>>.Ok(result, "Lấy danh sách xe thành công"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCarById(int id)
    {
        var x = await _context.Xes
            .Include(x => x.MauXe)
                .ThenInclude(m => m!.HangXe)
            .Include(x => x.MauXe)
                .ThenInclude(m => m!.LoaiXe)
            .Include(x => x.HinhAnhXes)
            .FirstOrDefaultAsync(x => x.XeId == id && !x.DaXoa);

        if (x == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy thông tin xe yêu cầu"));
        }

        var rawImg = x.HinhAnhXes.OrderByDescending(i => i.LaAnhChinh).ThenBy(i => i.ThuTu).FirstOrDefault()?.DuongDanAnh;
        var thumb = CarImageHelper.ResolveThumbnail(x.MauXe?.TenMauXe, rawImg);

        var carDto = new CarDto
        {
            Id = x.XeId,
            CarName = x.MauXe?.TenMauXe ?? "Xe ô tô",
            LicensePlate = x.BienSo,
            DailyPrice = x.GiaThueNgay,
            DepositRequired = x.TienDatCocMacDinh,
            Seats = x.MauXe?.SoCho ?? 5,
            Transmission = CarImageHelper.MapTransmission(x.MauXe?.HopSo),
            FuelType = CarImageHelper.MapFuelType(x.MauXe?.NhienLieu),
            FuelConsumption = "7.0 L/100km",
            MileageLimitPerDay = 300,
            ExtraMileageCharge = 5000,
            CurrentMileage = x.SoKmHienTai,
            ThumbnailUrl = thumb,
            Description = x.MoTa ?? $"Xe {x.MauXe?.TenMauXe} chất lượng cao, nội thất sang trọng, vận hành bền bỉ.",
            Status = CarImageHelper.MapCarStatus(x.TrangThai),
            IsFeatured = true,
            BrandId = x.MauXe?.HangXeId ?? 1,
            CategoryId = x.MauXe?.LoaiXeId ?? 1,
            Brand = x.MauXe?.HangXe != null ? new BrandDto
            {
                Id = x.MauXe.HangXe.HangXeId,
                Name = x.MauXe.HangXe.TenHangXe,
                Country = x.MauXe.HangXe.QuocGia,
                LogoUrl = x.MauXe.HangXe.Logo
            } : null,
            Category = x.MauXe?.LoaiXe != null ? new CategoryDto
            {
                Id = x.MauXe.LoaiXe.LoaiXeId,
                Name = x.MauXe.LoaiXe.TenLoaiXe,
                Slug = x.MauXe.LoaiXe.MaLoaiXe
            } : null,
            Features = new List<FeatureDto>
            {
                new FeatureDto { Id = 1, Name = "Bản đồ dẫn đường GPS", Icon = "MapPin" },
                new FeatureDto { Id = 2, Name = "Camera 360 toàn cảnh", Icon = "Camera" },
                new FeatureDto { Id = 3, Name = "Apple CarPlay & Android Auto", Icon = "Smartphone" },
                new FeatureDto { Id = 4, Name = "Cửa sổ trời Panorama", Icon = "Sun" },
                new FeatureDto { Id = 5, Name = "Ghế da chỉnh điện", Icon = "Wind" },
                new FeatureDto { Id = 6, Name = "Cảm biến va chạm trước sau", Icon = "Shield" }
            },
            Images = new List<string>
            {
                thumb,
                "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"
            }
        };

        return Ok(ApiResponse<CarDto>.Ok(carDto, "Lấy chi tiết xe thành công"));
    }

    [HttpGet("{id}/availability")]
    public async Task<IActionResult> CheckAvailability(int id, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var hasConflict = await _context.DonThues
            .AnyAsync(d => d.XeId == id && 
                           d.TrangThai != "DA_HUY" && 
                           d.TrangThai != "TU_CHOI" &&
                           (startDate < d.ThoiGianTraDuKien && endDate > d.ThoiGianNhan));

        return Ok(ApiResponse<object>.Ok(new { isAvailable = !hasConflict }, "Kiểm tra tính khả dụng xe thành công"));
    }
}
