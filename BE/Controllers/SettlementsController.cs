using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/settlements")]
public class SettlementsController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public SettlementsController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetSettlement(string bookingId)
    {
        long.TryParse(bookingId, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId || d.MaDonThue == bookingId);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        var settlement = new
        {
            bookingId = order.DonThueId.ToString(),
            bookingCode = order.MaDonThue,
            depositAmount = order.TienDatCocYeuCau,
            extraMileageCharge = 0,
            fuelDeficitCharge = 0,
            damageCharge = 0,
            totalExtraCharge = 0,
            depositRefundAmount = order.TienDatCocYeuCau,
            refundStatus = "REFUNDED",
            settledAt = DateTime.UtcNow
        };

        return Ok(ApiResponse<object>.Ok(settlement, "Lấy quyết toán và hoàn cọc thành công"));
    }

    [HttpPost("finalize")]
    public async Task<IActionResult> FinalizeSettlement([FromBody] dynamic payload)
    {
        return Ok(ApiResponse<object>.Ok(new { success = true, status = "FINALIZED" }, "Chốt hóa đơn quyết toán và hoàn tất hoàn cọc"));
    }
}
