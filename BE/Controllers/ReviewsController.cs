using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public ReviewsController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet("car/{carId}")]
    public async Task<IActionResult> GetCarReviews(int carId)
    {
        var reviews = await _context.DanhGias
            .Include(d => d.KhachHang)
            .Where(d => d.XeId == carId && d.HienThi)
            .OrderByDescending(d => d.NgayTao)
            .Select(d => new
            {
                id = d.DanhGiaId,
                carId = d.XeId,
                customerName = d.KhachHang != null ? d.KhachHang.HoTen : "Khách hàng",
                rating = (int)d.SoSao,
                cleanlinessRating = (int)d.SoSao,
                staffRating = (int)d.SoSao,
                carPerformanceRating = (int)d.SoSao,
                title = d.TieuDe,
                comment = d.NoiDung,
                staffResponse = d.PhanHoiNhanVien,
                createdAt = d.NgayTao
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(reviews, "Lấy đánh giá xe thành công"));
    }

    [HttpGet]
    public async Task<IActionResult> GetAllReviews()
    {
        var reviews = await _context.DanhGias
            .Include(d => d.KhachHang)
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .OrderByDescending(d => d.NgayTao)
            .Select(d => new
            {
                id = d.DanhGiaId,
                bookingId = d.DonThueId,
                carId = d.XeId,
                carName = d.Xe != null && d.Xe.MauXe != null ? d.Xe.MauXe.TenMauXe : "Xe ô tô",
                customerName = d.KhachHang != null ? d.KhachHang.HoTen : "Khách hàng",
                rating = (int)d.SoSao,
                cleanlinessRating = (int)d.SoSao,
                staffRating = (int)d.SoSao,
                carPerformanceRating = (int)d.SoSao,
                title = d.TieuDe,
                comment = d.NoiDung,
                staffResponse = d.PhanHoiNhanVien,
                createdAt = d.NgayTao
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(reviews, "Lấy tất cả đánh giá thành công"));
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var booking = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == request.BookingId);
        int carId = request.CarId > 0 ? request.CarId : (booking?.XeId ?? 1);
        int customerId = booking?.KhachHangId ?? 1;

        var review = new Models.DanhGia
        {
            DonThueId = request.BookingId > 0 ? request.BookingId : 1,
            XeId = carId,
            KhachHangId = customerId,
            SoSao = (byte)Math.Clamp(request.Rating, 1, 5),
            TieuDe = request.Title ?? "Đánh giá chuyến đi",
            NoiDung = request.Comment ?? "Dịch vụ rất tốt, xe chạy êm ái.",
            HienThi = true,
            NgayTao = DateTime.UtcNow
        };

        _context.DanhGias.Add(review);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { id = review.DanhGiaId, success = true }, "Gửi đánh giá dịch vụ thành công! Cảm ơn quý khách."));
    }
}
