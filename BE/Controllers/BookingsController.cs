using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;
using CarRental.Api.Models;
using CarRental.Api.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly CarRentalDbContext _context;
    private readonly IBookingLifecycleService _lifecycleService;

    public BookingsController(CarRentalDbContext context, IBookingLifecycleService lifecycleService)
    {
        _context = context;
        _lifecycleService = lifecycleService;
    }

    [HttpPost("calculate-price")]
    public async Task<IActionResult> CalculatePrice([FromBody] PriceCalculationRequest request)
    {
        if (request.CarId <= 0 || request.StartDate >= request.EndDate)
        {
            return BadRequest(ApiResponse<object>.Fail("Thông tin thời gian thuê xe không hợp lệ"));
        }

        var car = await _context.Xes.FirstOrDefaultAsync(x => x.XeId == request.CarId);
        if (car == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy xe yêu cầu"));
        }

        int totalDays = (int)Math.Ceiling((request.EndDate - request.StartDate).TotalDays);
        if (totalDays <= 0) totalDays = 1;

        decimal carRentalFee = car.GiaThueNgay * totalDays;

        // Tính phí dịch vụ
        decimal serviceFee = 0;
        if (request.SelectedServices.Count > 0)
        {
            var services = await _context.DichVus
                .Where(d => request.SelectedServices.Contains(d.DichVuId))
                .ToListAsync();

            foreach (var s in services)
            {
                if (s.DonViTinh == "PER_DAY")
                {
                    serviceFee += s.DonGia * totalDays;
                }
                else
                {
                    serviceFee += s.DonGia;
                }
            }
        }

        // Tính giảm giá voucher
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(request.PromotionCode))
        {
            var promo = await _context.MaGiamGias
                .FirstOrDefaultAsync(m => m.MaCode.ToUpper() == request.PromotionCode.Trim().ToUpper() && m.TrangThai == "HOAT_DONG");

            if (promo != null)
            {
                decimal subtotal = carRentalFee + serviceFee;
                if (!promo.DonToiThieu.HasValue || subtotal >= promo.DonToiThieu.Value)
                {
                    discountAmount = (subtotal * promo.GiaTriGiam) / 100m;
                    if (promo.GiamToiDa.HasValue && discountAmount > promo.GiamToiDa.Value)
                    {
                        discountAmount = promo.GiamToiDa.Value;
                    }
                }
            }
        }

        decimal estimatedTotal = Math.Max(0, carRentalFee + serviceFee - discountAmount);
        decimal depositAmount = car.TienDatCocMacDinh;
        decimal requiredInitial = depositAmount;

        var response = new PriceCalculationResponse
        {
            TotalDays = totalDays,
            DailyPrice = car.GiaThueNgay,
            CarRentalFee = carRentalFee,
            ServiceFee = serviceFee,
            DiscountAmount = discountAmount,
            EstimatedTotalFee = estimatedTotal,
            DepositAmount = depositAmount,
            RequiredInitialPayment = requiredInitial
        };

        return Ok(ApiResponse<PriceCalculationResponse>.Ok(response, "Tính toán chi phí thuê xe thành công"));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var car = await _context.Xes.Include(x => x.MauXe).FirstOrDefaultAsync(x => x.XeId == request.CarId);
        if (car == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy thông tin xe yêu cầu"));
        }

        // Kiểm tra chống trùng lịch
        var conflict = await _context.DonThues
            .AnyAsync(d => d.XeId == request.CarId && 
                           d.TrangThai != "DA_HUY" && 
                           d.TrangThai != "TU_CHOI" &&
                           (request.StartDate < d.ThoiGianTraDuKien && request.EndDate > d.ThoiGianNhan));

        if (conflict)
        {
            return BadRequest(ApiResponse<object>.Fail("Xe này đã có người đặt trong khoảng thời gian quý khách chọn. Vui lòng chọn xe hoặc khung giờ khác."));
        }

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdStr, out int userId);
        if (userId <= 0) userId = 1;

        // Tìm hoặc tạo hồ sơ KhachHang
        var customer = await _context.KhachHangs.FirstOrDefaultAsync(k => k.NguoiDungId == userId);
        int customerId = customer?.KhachHangId ?? 1;

        int totalDays = (int)Math.Ceiling((request.EndDate - request.StartDate).TotalDays);
        if (totalDays <= 0) totalDays = 1;

        decimal carRentalFee = car.GiaThueNgay * totalDays;
        decimal serviceFee = 0;
        if (request.SelectedServices.Count > 0)
        {
            var services = await _context.DichVus.Where(d => request.SelectedServices.Contains(d.DichVuId)).ToListAsync();
            serviceFee = services.Sum(s => s.DonViTinh == "PER_DAY" ? s.DonGia * totalDays : s.DonGia);
        }

        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(request.PromotionCode))
        {
            var promo = await _context.MaGiamGias.FirstOrDefaultAsync(m => m.MaCode.ToUpper() == request.PromotionCode.Trim().ToUpper() && m.TrangThai == "HOAT_DONG");
            if (promo != null)
            {
                discountAmount = Math.Min((carRentalFee + serviceFee) * promo.GiaTriGiam / 100m, promo.GiamToiDa ?? 99999999m);
            }
        }

        decimal totalPrice = Math.Max(0, carRentalFee + serviceFee - discountAmount);
        string bookingCode = $"BK-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        var newOrder = new DonThue
        {
            MaDonThue = bookingCode,
            KhachHangId = customerId,
            XeId = car.XeId,
            ChiNhanhNhanId = 1,
            ChiNhanhTraId = 1,
            ThoiGianNhan = request.StartDate,
            ThoiGianTraDuKien = request.EndDate,
            SoNgayThue = totalDays,
            DonGiaNgay = car.GiaThueNgay,
            TienThue = carRentalFee,
            TienDichVu = serviceFee,
            TienGiam = discountAmount,
            TienDatCocYeuCau = car.TienDatCocMacDinh,
            TongTien = totalPrice,
            TrangThai = "CHO_XAC_NHAN",
            GhiChuKhach = request.Notes,
            NgayTao = DateTime.UtcNow
        };

        _context.DonThues.Add(newOrder);
        await _context.SaveChangesAsync();

        var bookingDto = new BookingDto
        {
            Id = newOrder.DonThueId.ToString(),
            BookingCode = newOrder.MaDonThue,
            CarId = newOrder.XeId,
            StartDate = newOrder.ThoiGianNhan,
            EndDate = newOrder.ThoiGianTraDuKien,
            TotalDays = newOrder.SoNgayThue,
            DailyPrice = newOrder.DonGiaNgay,
            CarRentalFee = newOrder.TienThue,
            ServiceFee = newOrder.TienDichVu,
            DiscountAmount = newOrder.TienGiam,
            DepositAmount = newOrder.TienDatCocYeuCau,
            TotalPrice = newOrder.TongTien,
            BookingStatus = "PENDING",
            PaymentStatus = "UNPAID",
            PickupLocation = request.PickupLocation ?? "Chi nhánh Cầu Giấy, Hà Nội",
            ReturnLocation = request.ReturnLocation ?? "Chi nhánh Cầu Giấy, Hà Nội",
            Notes = newOrder.GhiChuKhach,
            CreatedAt = newOrder.NgayTao
        };

        return Created($"/api/bookings/{newOrder.DonThueId}", ApiResponse<BookingDto>.Ok(bookingDto, "Đặt thuê xe thành công"));
    }

    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<IActionResult> GetMyBookings()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdStr, out int userId);

        var customer = await _context.KhachHangs.FirstOrDefaultAsync(k => k.NguoiDungId == userId);
        int customerId = customer?.KhachHangId ?? userId;

        var orders = await _context.DonThues
            .Include(d => d.Xe)
                .ThenInclude(x => x!.MauXe)
            .Where(d => d.KhachHangId == customerId || d.KhachHangId == userId)
            .OrderByDescending(d => d.NgayTao)
            .ToListAsync();

        var result = orders.Select(d => new BookingDto
        {
            Id = d.DonThueId.ToString(),
            BookingCode = d.MaDonThue,
            CarId = d.XeId,
            StartDate = d.ThoiGianNhan,
            EndDate = d.ThoiGianTraDuKien,
            TotalDays = d.SoNgayThue,
            DailyPrice = d.DonGiaNgay,
            CarRentalFee = d.TienThue,
            ServiceFee = d.TienDichVu,
            DiscountAmount = d.TienGiam,
            DepositAmount = d.TienDatCocYeuCau,
            TotalPrice = d.TongTien,
            BookingStatus = CarImageHelper.MapBookingStatus(d.TrangThai),
            PaymentStatus = d.TrangThai == "HOAN_THANH" ? "PAID" : "PARTIALLY_PAID",
            ContractSigned = true,
            Notes = d.GhiChuKhach,
            StaffNotes = d.GhiChuNoiBo,
            CreatedAt = d.NgayTao,
            Car = d.Xe != null ? new CarDto
            {
                Id = d.Xe.XeId,
                CarName = d.Xe.MauXe?.TenMauXe ?? "Xe ô tô",
                LicensePlate = d.Xe.BienSo,
                ThumbnailUrl = CarImageHelper.ResolveThumbnail(d.Xe.MauXe?.TenMauXe, null)
            } : null
        }).ToList();

        return Ok(ApiResponse<List<BookingDto>>.Ok(result, "Lấy danh sách đơn thuê thành công"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookingById(string id)
    {
        DonThue? order = null;
        if (long.TryParse(id, out long orderId))
        {
            order = await _context.DonThues
                .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
                .Include(d => d.KhachHang)
                .Include(d => d.ChiNhanhNhan)
                .Include(d => d.ChiNhanhTra)
                .FirstOrDefaultAsync(d => d.DonThueId == orderId);
        }

        if (order == null)
        {
            order = await _context.DonThues
                .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
                .Include(d => d.KhachHang)
                .Include(d => d.ChiNhanhNhan)
                .Include(d => d.ChiNhanhTra)
                .FirstOrDefaultAsync(d => d.MaDonThue == id);
        }

        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy thông tin đơn đặt xe"));
        }

        var dto = new BookingDto
        {
            Id = order.DonThueId.ToString(),
            BookingCode = order.MaDonThue,
            CarId = order.XeId,
            StartDate = order.ThoiGianNhan,
            EndDate = order.ThoiGianTraDuKien,
            TotalDays = order.SoNgayThue,
            DailyPrice = order.DonGiaNgay,
            CarRentalFee = order.TienThue,
            ServiceFee = order.TienDichVu,
            DiscountAmount = order.TienGiam,
            DepositAmount = order.TienDatCocYeuCau,
            TotalPrice = order.TongTien,
            BookingStatus = CarImageHelper.MapBookingStatus(order.TrangThai),
            PaymentStatus = order.TrangThai == "HOAN_THANH" ? "PAID" : "PARTIALLY_PAID",
            ContractSigned = true,
            PickupLocation = order.ChiNhanhNhan?.TenChiNhanh ?? "Chi nhánh Cầu Giấy, Hà Nội",
            ReturnLocation = order.ChiNhanhTra?.TenChiNhanh ?? "Chi nhánh Cầu Giấy, Hà Nội",
            Notes = order.GhiChuKhach,
            StaffNotes = order.GhiChuNoiBo ?? "Xe đã được vệ sinh sạch sẽ, kiểm tra kỹ thuật đạt chuẩn 100%.",
            CreatedAt = order.NgayTao,
            Car = order.Xe != null ? new CarDto
            {
                Id = order.Xe.XeId,
                CarName = order.Xe.MauXe?.TenMauXe ?? "Xe ô tô",
                LicensePlate = order.Xe.BienSo,
                DailyPrice = order.Xe.GiaThueNgay,
                DepositRequired = order.Xe.TienDatCocMacDinh,
                ThumbnailUrl = CarImageHelper.ResolveThumbnail(order.Xe.MauXe?.TenMauXe, null)
            } : null,
            User = order.KhachHang != null ? new UserDto
            {
                Id = order.KhachHang.KhachHangId,
                FullName = order.KhachHang.HoTen,
                Phone = order.KhachHang.SoDienThoai,
                Email = order.KhachHang.Email ?? ""
            } : null
        };

        return Ok(ApiResponse<BookingDto>.Ok(dto, "Lấy chi tiết đơn đặt xe thành công"));
    }

    [HttpPost("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelBooking(string id)
    {
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.MaDonThue == id || d.DonThueId.ToString() == id);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        order.TrangThai = "DA_HUY";
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { status = "CANCELLED" }, "Hủy đơn đặt xe thành công"));
    }

    [HttpPost("{id}/extend")]
    [Authorize]
    public async Task<IActionResult> ExtendBooking(string id, [FromBody] ExtendBookingRequest request)
    {
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.MaDonThue == id || d.DonThueId.ToString() == id);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        try
        {
            var updated = await _lifecycleService.ExtendBookingAsync(order.DonThueId, request.NewEndDate, request.Notes, null);
            return Ok(ApiResponse<BookingDto>.Ok(updated, "Gia hạn hợp đồng thuê xe thành công!"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }
}
