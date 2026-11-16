using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;
using CarRental.Api.Models;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public PaymentsController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpPost("create-intent")]
    public async Task<IActionResult> CreateIntent([FromBody] PaymentIntentRequest request)
    {
        long.TryParse(request.BookingId, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId || d.MaDonThue == request.BookingId);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        string txnCode = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{new Random().Next(100, 999)}";
        string qrUrl = $"https://api.vietqr.io/image/970436-0901234567-compact2.jpg?amount={request.Amount}&addInfo={order.MaDonThue}&accountName=AUTORENTAL%20VIETNAM";

        var intentData = new
        {
            transactionCode = txnCode,
            bookingId = order.DonThueId.ToString(),
            bookingCode = order.MaDonThue,
            amount = request.Amount,
            paymentMethod = request.PaymentMethod,
            paymentType = request.PaymentType,
            qrCodeUrl = qrUrl,
            bankInfo = new
            {
                bankName = "Vietcombank (VCB)",
                accountNumber = "0901234567",
                accountName = "CONG TY TNHH AUTORENTAL VIETNAM",
                branch = "Hà Nội"
            }
        };

        return Ok(ApiResponse<object>.Ok(intentData, "Tạo giao dịch thanh toán thành công"));
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
    {
        long.TryParse(request.BookingId, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId || d.MaDonThue == request.BookingId);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        // Cập nhật trạng thái đơn
        if (order.TrangThai == "CHO_XAC_NHAN")
        {
            order.TrangThai = "DA_DAT_COC";
        }
        else if (order.TrangThai == "DA_DAT_COC")
        {
            order.TrangThai = "DA_XAC_NHAN";
        }

        var payment = new ThanhToan
        {
            DonThueId = order.DonThueId,
            MaThanhToan = request.TransactionCode,
            LoaiThanhToan = "DAT_COC",
            PhuongThuc = "VNPAY",
            SoTien = order.TienDatCocYeuCau,
            TrangThai = "THANH_CONG",
            ThoiGianThanhToan = DateTime.UtcNow,
            MaGiaoDich = request.TransactionCode
        };

        _context.ThanhToans.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true, bookingStatus = order.TrangThai }, "Xác nhận thanh toán thành công"));
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetBookingPayments(string bookingId)
    {
        long.TryParse(bookingId, out long bId);
        var payments = await _context.ThanhToans
            .Where(t => t.DonThueId == bId)
            .Select(t => new PaymentDto
            {
                Id = t.ThanhToanId.ToString(),
                TransactionCode = t.MaThanhToan,
                BookingId = t.DonThueId.ToString(),
                Amount = t.SoTien,
                PaymentMethod = t.PhuongThuc,
                PaymentType = t.LoaiThanhToan,
                Status = t.TrangThai,
                PaidAt = t.ThoiGianThanhToan ?? DateTime.UtcNow
            })
            .ToListAsync();

        return Ok(ApiResponse<List<PaymentDto>>.Ok(payments, "Lấy lịch sử thanh toán thành công"));
    }
}
