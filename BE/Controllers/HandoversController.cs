using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;
using CarRental.Api.Models;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/handovers")]
public class HandoversController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public HandoversController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetHandovers(string bookingId)
    {
        long.TryParse(bookingId, out long bId);
        var handovers = await _context.BienBanGiaoNhans
            .Where(b => b.DonThueId == bId)
            .Select(b => new HandoverDto
            {
                Id = b.BienBanId.ToString(),
                BookingId = b.DonThueId.ToString(),
                HandoverType = b.LoaiBienBan,
                CurrentMileage = b.SoKm,
                FuelPercentage = (int)(b.MucNhienLieu ?? 100),
                ConditionNotes = b.GhiChu,
                HandoverTime = b.ThoiGian
            })
            .ToListAsync();

        return Ok(ApiResponse<List<HandoverDto>>.Ok(handovers, "Lấy biên bản giao nhận xe thành công"));
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] HandoverDto request)
    {
        long.TryParse(request.BookingId, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId);
        if (order != null)
        {
            order.TrangThai = "DANG_THUE";
        }

        var handover = new BienBanGiaoNhan
        {
            DonThueId = bId,
            LoaiBienBan = "CHECK_IN",
            SoKm = request.CurrentMileage > 0 ? request.CurrentMileage : 15000,
            MucNhienLieu = request.FuelPercentage > 0 ? request.FuelPercentage : 100,
            GhiChu = request.ConditionNotes ?? "Xe sạch sẽ, ngoại thất hoàn hảo không trầy xước.",
            ThoiGian = DateTime.UtcNow
        };

        _context.BienBanGiaoNhans.Add(handover);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true, id = handover.BienBanId }, "Tạo biên bản giao xe thành công"));
    }

    [HttpPost("check-out")]
    public async Task<IActionResult> CheckOut([FromBody] HandoverDto request)
    {
        long.TryParse(request.BookingId, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId);
        if (order != null)
        {
            order.TrangThai = "HOAN_THANH";
        }

        var handover = new BienBanGiaoNhan
        {
            DonThueId = bId,
            LoaiBienBan = "CHECK_OUT",
            SoKm = request.CurrentMileage > 0 ? request.CurrentMileage : 15300,
            MucNhienLieu = request.FuelPercentage > 0 ? request.FuelPercentage : 90,
            GhiChu = request.ConditionNotes ?? "Khách hoàn trả xe đúng hạn, nguyên vẹn.",
            ThoiGian = DateTime.UtcNow
        };

        _context.BienBanGiaoNhans.Add(handover);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true, id = handover.BienBanId }, "Tạo biên bản nhận lại xe thành công"));
    }

    [HttpGet("{handoverId}/photos")]
    public async Task<IActionResult> GetHandoverPhotos(long handoverId)
    {
        var photos = await _context.HinhAnhGiaoNhans
            .Where(p => p.BienBanId == handoverId)
            .OrderBy(p => p.HinhAnhGiaoNhanId)
            .Select(p => new HandoverPhotoDto
            {
                Id = p.HinhAnhGiaoNhanId,
                HandoverId = p.BienBanId,
                PhotoType = p.LoaiAnh ?? "TRUOC",
                PhotoUrl = p.DuongDanAnh ?? "",
                Notes = p.MoTa,
                CreatedAt = p.NgayTao
            })
            .ToListAsync();

        return Ok(ApiResponse<List<HandoverPhotoDto>>.Ok(photos, "Lấy danh sách ảnh bàn giao xe thành công"));
    }

    [HttpPost("{handoverId}/photos")]
    public async Task<IActionResult> AddHandoverPhoto(long handoverId, [FromBody] HandoverPhotoDto request)
    {
        var photo = new HinhAnhGiaoNhan
        {
            BienBanId = handoverId,
            LoaiAnh = string.IsNullOrEmpty(request.PhotoType) ? "TRUOC" : request.PhotoType,
            DuongDanAnh = request.PhotoUrl,
            MoTa = request.Notes,
            NgayTao = DateTime.UtcNow
        };

        _context.HinhAnhGiaoNhans.Add(photo);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true, photoId = photo.HinhAnhGiaoNhanId }, "Lưu ảnh bàn giao thành công"));
    }
}
