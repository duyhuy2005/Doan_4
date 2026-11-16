using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/catalog")]
public class CatalogController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public CatalogController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet("brands")]
    public async Task<IActionResult> GetBrands()
    {
        var brands = await _context.HangXes
            .Where(h => !h.DaXoa)
            .Select(h => new BrandDto
            {
                Id = h.HangXeId,
                Name = h.TenHangXe ?? "Hãng xe",
                Country = h.QuocGia,
                LogoUrl = h.Logo
            })
            .ToListAsync();

        return Ok(ApiResponse<List<BrandDto>>.Ok(brands, "Lấy danh sách thương hiệu thành công"));
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.LoaiXes
            .Select(l => new CategoryDto
            {
                Id = l.LoaiXeId,
                Name = l.TenLoaiXe ?? "Phân khúc",
                Slug = l.MaLoaiXe ?? "sedan",
                Description = l.MoTa
            })
            .ToListAsync();

        return Ok(ApiResponse<List<CategoryDto>>.Ok(categories, "Lấy danh mục phân khúc thành công"));
    }

    [HttpGet("branches")]
    public async Task<IActionResult> GetBranches()
    {
        var branches = await _context.ChiNhanhs
            .Select(c => new BranchDto
            {
                Id = c.ChiNhanhId,
                Name = c.TenChiNhanh ?? "Chi nhánh AutoRental",
                Address = c.DiaChi ?? "Hà Nội",
                Phone = c.SoDienThoai ?? "0243 123 4567",
                Email = c.Email ?? "contact@autorental.vn",
                City = c.TinhThanh ?? "Hà Nội"
            })
            .ToListAsync();

        return Ok(ApiResponse<List<BranchDto>>.Ok(branches, "Lấy danh sách chi nhánh thành công"));
    }

    [HttpGet("features")]
    public IActionResult GetFeatures()
    {
        var features = new List<FeatureDto>
        {
            new FeatureDto { Id = 1, Name = "Bản đồ dẫn đường GPS", Icon = "MapPin" },
            new FeatureDto { Id = 2, Name = "Camera 360 toàn cảnh", Icon = "Camera" },
            new FeatureDto { Id = 3, Name = "Apple CarPlay & Android Auto", Icon = "Smartphone" },
            new FeatureDto { Id = 4, Name = "Cửa sổ trời toàn cảnh Panorama", Icon = "Sun" },
            new FeatureDto { Id = 5, Name = "Ghế sưởi và làm mát đa điểm", Icon = "Wind" },
            new FeatureDto { Id = 6, Name = "Cảm biến va chạm trước sau", Icon = "Shield" },
            new FeatureDto { Id = 7, Name = "Hỗ trợ giữ làn tự động (ADAS)", Icon = "Compass" }
        };

        return Ok(ApiResponse<List<FeatureDto>>.Ok(features, "Lấy danh sách tiện nghi thành công"));
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var services = await _context.DichVus
            .Where(d => d.TrangThai == "HOAT_DONG")
            .Select(d => new ServiceDto
            {
                Id = d.DichVuId,
                Name = d.TenDichVu ?? "Dịch vụ",
                Price = d.DonGia,
                ChargeType = d.DonViTinh ?? "PER_TRIP",
                Description = d.MoTa
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ServiceDto>>.Ok(services, "Lấy danh sách dịch vụ thành công"));
    }

    [HttpGet("promotions")]
    public async Task<IActionResult> GetPromotions()
    {
        var promos = await _context.MaGiamGias
            .Select(m => new PromotionDto
            {
                Id = m.MaGiamGiaId,
                Code = m.MaCode ?? "PROMO",
                Title = m.TenMa ?? "Ưu đãi",
                DiscountPercentage = (int)m.GiaTriGiam,
                DiscountAmountMax = m.GiamToiDa,
                MinOrderValue = m.DonToiThieu,
                IsActive = m.TrangThai == "HOAT_DONG"
            })
            .ToListAsync();

        return Ok(ApiResponse<List<PromotionDto>>.Ok(promos, "Lấy danh sách ưu đãi thành công"));
    }

    [HttpPost("validate-promo")]
    public async Task<IActionResult> ValidatePromotion([FromBody] ValidatePromoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(ApiResponse<object>.Fail("Vui lòng nhập mã khuyến mãi"));
        }

        var normalizedCode = request.Code.Trim().ToUpper();
        var promo = await _context.MaGiamGias
            .FirstOrDefaultAsync(m => m.MaCode != null && m.MaCode.ToUpper() == normalizedCode && m.TrangThai == "HOAT_DONG");

        if (promo == null)
        {
            return NotFound(ApiResponse<object>.Fail("Mã khuyến mãi không tồn tại hoặc đã hết hạn áp dụng"));
        }

        if (promo.DonToiThieu.HasValue && request.OrderAmount < promo.DonToiThieu.Value)
        {
            return BadRequest(ApiResponse<object>.Fail($"Mã này áp dụng cho đơn thuê từ {promo.DonToiThieu.Value:N0} VNĐ trở lên"));
        }

        var promoDto = new PromotionDto
        {
            Id = promo.MaGiamGiaId,
            Code = promo.MaCode ?? "PROMO",
            Title = promo.TenMa ?? "Ưu đãi",
            DiscountPercentage = (int)promo.GiaTriGiam,
            DiscountAmountMax = promo.GiamToiDa,
            MinOrderValue = promo.DonToiThieu,
            IsActive = true
        };

        return Ok(ApiResponse<PromotionDto>.Ok(promoDto, "Mã khuyến mãi hợp lệ"));
    }
}
