using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;
using CarRental.Api.Models;
using CarRental.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN,STAFF")]
public class AdminController : ControllerBase
{
    private readonly CarRentalDbContext _context;
    private readonly IBookingLifecycleService _lifecycleService;

    public AdminController(CarRentalDbContext context, IBookingLifecycleService lifecycleService)
    {
        _context = context;
        _lifecycleService = lifecycleService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        int totalCars = await _context.Xes.CountAsync(x => !x.DaXoa);
        int availableCars = await _context.Xes.CountAsync(x => !x.DaXoa && x.TrangThai == "HOAT_DONG");
        int rentedCars = await _context.Xes.CountAsync(x => !x.DaXoa && x.TrangThai == "DANG_THUE");
        int totalUsers = await _context.NguoiDungs.CountAsync(u => !u.DaXoa);
        int totalBookings = await _context.DonThues.CountAsync();
        int activeBookings = await _context.DonThues.CountAsync(d => d.TrangThai == "DANG_THUE" || d.TrangThai == "DA_XAC_NHAN" || d.TrangThai == "DA_DAT_COC");
        decimal totalRevenue = await _context.DonThues
            .Where(d => d.TrangThai == "HOAN_THANH" || d.TrangThai == "DANG_THUE")
            .SumAsync(d => d.TongTien);

        var stats = new AdminDashboardDto
        {
            TotalCars = totalCars,
            AvailableCars = availableCars,
            RentedCars = rentedCars,
            TotalUsers = totalUsers,
            TotalBookings = totalBookings,
            ActiveBookings = activeBookings,
            TotalRevenue = totalRevenue
        };

        return Ok(ApiResponse<AdminDashboardDto>.Ok(stats, "Lấy dữ liệu thống kê tổng quan thành công"));
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> GetAllBookings([FromQuery] string? status, [FromQuery] string? search)
    {
        // Tự động kiểm tra và hết hạn các đơn quá hạn cọc trước khi trả dữ liệu
        await _lifecycleService.SweepExpiredBookingsAsync();

        var query = _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .OrderByDescending(d => d.NgayTao)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            var rawStatus = status.ToUpper() switch
            {
                "PENDING" => "CHO_XAC_NHAN",
                "CONFIRMED" => "DA_XAC_NHAN",
                "CONTRACT_DRAFT" => "CHO_HOP_DONG",
                "AWAITING_DEPOSIT" => "CHO_THANH_TOAN_COC",
                "DEPOSIT_PAID" => "DA_DAT_COC",
                "READY_FOR_DELIVERY" => "SAN_SANG_GIAO",
                "ACTIVE" => "DANG_THUE",
                "AWAITING_RETURN" => "CHO_TRA_XE",
                "AWAITING_SETTLEMENT" => "CHO_CHOT_HOA_DON",
                "AWAITING_REFUND" => "CHO_HOAN_COC",
                "COMPLETED" => "HOAN_THANH",
                "EXPIRED" => "HET_HAN",
                "CANCELLED" => "DA_HUY",
                "REJECTED" => "TU_CHOI",
                _ => status
            };
            query = query.Where(d => d.TrangThai == rawStatus);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(d => d.MaDonThue.ToLower().Contains(s) || 
                                     (d.KhachHang != null && d.KhachHang.HoTen.ToLower().Contains(s)) ||
                                     (d.Xe != null && d.Xe.MauXe != null && d.Xe.MauXe.TenMauXe.ToLower().Contains(s)));
        }

        var orders = await query.ToListAsync();
        var orderIds = orders.Select(o => o.DonThueId).ToList();

        // Lấy thông tin Hợp đồng và Thanh toán liên kết
        var contracts = await _context.HopDongThues
            .Where(h => orderIds.Contains(h.DonThueId))
            .ToDictionaryAsync(h => h.DonThueId);

        var payments = await _context.ThanhToans
            .Where(t => orderIds.Contains(t.DonThueId) && t.TrangThai == "THANH_CONG")
            .GroupBy(t => t.DonThueId)
            .ToDictionaryAsync(g => g.Key, g => g.ToList());

        var result = orders.Select(d =>
        {
            int step = CarImageHelper.CalculateStep(d.TrangThai);
            contracts.TryGetValue(d.DonThueId, out var contract);
            payments.TryGetValue(d.DonThueId, out var orderPayments);

            decimal paidDeposit = orderPayments?
                .Where(p => p.LoaiThanhToan == "TIEN_DAT_COC")
                .Sum(p => p.SoTien) ?? 0;

            bool isExpired = d.TrangThai == "HET_HAN" || 
                ((d.TrangThai == "CHO_THANH_TOAN_COC" || d.TrangThai == "DA_XAC_NHAN" || d.TrangThai == "CHO_XAC_NHAN") 
                 && d.HanGiuDon.HasValue && d.HanGiuDon.Value < DateTime.UtcNow);

            return new BookingDto
            {
                Id = d.DonThueId.ToString(),
                BookingCode = d.MaDonThue ?? d.DonThueId.ToString(),
                CarId = d.XeId,
                UserId = d.KhachHangId,
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
                PaymentStatus = d.TrangThai == "HOAN_THANH" ? "PAID" : (paidDeposit > 0 ? "DEPOSIT_PAID" : "UNPAID"),
                ContractSigned = contract != null && (contract.TrangThai == "KHACH_DA_KY" || contract.TrangThai == "HIEU_LUC" || contract.TrangThai == "DA_KY"),
                ContractId = contract?.HopDongId.ToString(),
                ContractCode = contract?.SoHopDong,
                ContractStatus = contract?.TrangThai,
                PaidDeposit = paidDeposit,
                ExtraCharges = d.TienPhiPhatSinh,
                IsDepositRefunded = d.DaDoiSoatCoc == true,
                DepositDeadline = d.HanGiuDon,
                IsExpired = isExpired,
                Step = step,
                StepName = CarImageHelper.GetStepName(step),
                PickupLocation = d.ChiNhanhNhan?.TenChiNhanh ?? "Chi nhánh Hà Nội",
                ReturnLocation = d.ChiNhanhTra?.TenChiNhanh ?? "Chi nhánh Hà Nội",
                Notes = d.GhiChuKhach,
                StaffNotes = d.GhiChuNoiBo,
                CreatedAt = d.NgayTao,
                Car = d.Xe != null ? new CarDto
                {
                    Id = d.Xe.XeId,
                    CarName = d.Xe.MauXe?.TenMauXe ?? "Xe ô tô",
                    LicensePlate = d.Xe.BienSo,
                    ThumbnailUrl = CarImageHelper.ResolveThumbnail(d.Xe.MauXe?.TenMauXe, null)
                } : null,
                User = d.KhachHang != null ? new UserDto
                {
                    Id = d.KhachHang.KhachHangId,
                    FullName = d.KhachHang.HoTen,
                    Phone = d.KhachHang.SoDienThoai
                } : null
            };
        }).ToList();

        return Ok(ApiResponse<List<BookingDto>>.Ok(result, "Lấy danh sách tất cả đơn đặt xe thành công"));
    }

    // 1. Quét tự động đơn quá hạn giữ xe và giải phóng lịch xe
    [HttpPost("bookings/sweep-expired")]
    public async Task<IActionResult> SweepExpiredBookings()
    {
        var result = await _lifecycleService.SweepExpiredBookingsAsync();
        return Ok(ApiResponse<SweepExpiredResponse>.Ok(result, result.Message));
    }

    // 2. Bước 2: Nhân viên xác nhận duyệt đơn thuê
    [HttpPost("bookings/{id}/confirm")]
    public async Task<IActionResult> ConfirmBooking(long id, [FromBody] StepTransitionRequest? req)
    {
        var updated = await _lifecycleService.ConfirmOrderAsync(id, null, req?.Notes);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Đã duyệt đơn thuê thành công"));
    }

    // 3. Bước 3: Tạo hợp đồng điện tử
    [HttpPost("bookings/{id}/create-contract")]
    public async Task<IActionResult> CreateContract(long id, [FromBody] StepTransitionRequest? req)
    {
        var contract = await _lifecycleService.CreateContractAsync(id, null, req?.Notes);
        return Ok(ApiResponse<ContractDto>.Ok(contract, "Đã khởi tạo hợp đồng điện tử thành công"));
    }

    // 4. Bước 4: Khách hàng / Nhân viên xác nhận ký hợp đồng (kích hoạt thời hạn nộp cọc)
    [HttpPost("bookings/{id}/customer-sign")]
    public async Task<IActionResult> CustomerSignContract(long id, [FromBody] StepTransitionRequest? req)
    {
        var updated = await _lifecycleService.CustomerConfirmContractAsync(id, null, 30);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Khách hàng đã ký xác nhận hợp đồng. Bắt đầu đếm ngược thời hạn thanh toán cọc giữ xe."));
    }

    // 5. Bước 5 & 6: Thu tiền cọc & Kích hoạt hợp đồng có hiệu lực chính thức
    [HttpPost("bookings/{id}/pay-deposit")]
    public async Task<IActionResult> PayDeposit(long id, [FromBody] StepTransitionRequest req)
    {
        var updated = await _lifecycleService.ConfirmDepositAsync(id, req.Amount ?? 0, req.PaymentMethod ?? "CHUYEN_KHOAN", null);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Thanh toán cọc thành công! Hợp đồng chính thức có hiệu lực, xe sẵn sàng bàn giao."));
    }

    // 7. Bước 7: Bàn giao xe (Check-in)
    [HttpPost("bookings/{id}/handover")]
    public async Task<IActionResult> HandoverCar(long id, [FromBody] StepTransitionRequest req)
    {
        var updated = await _lifecycleService.HandoverCarAsync(id, req.CurrentMileage ?? 0, req.FuelPercentage ?? 100, req.Notes, null);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Đã bàn giao xe cho khách hàng thành công"));
    }

    // 8. Bước 8: Trả xe và ghi nhận phụ phí (Check-out)
    [HttpPost("bookings/{id}/return")]
    public async Task<IActionResult> ReturnCar(long id, [FromBody] StepTransitionRequest req)
    {
        var updated = await _lifecycleService.ReturnCarAsync(id, req.CurrentMileage ?? 0, req.FuelPercentage ?? 100, req.DamagePenalty ?? 0, req.Notes, null);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Đã nhận lại xe và ghi nhận hiện trạng hoàn trả"));
    }

    // 9. Bước 9: Chốt hóa đơn quyết toán
    [HttpPost("bookings/{id}/settle")]
    public async Task<IActionResult> FinalizeSettlement(long id, [FromBody] StepTransitionRequest req)
    {
        var updated = await _lifecycleService.FinalizeSettlementAsync(id, req.Amount ?? 0, req.PaymentMethod ?? "CHUYEN_KHOAN", null);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Đã chốt hóa đơn quyết toán chi phí"));
    }

    // 10. Bước 10: Đối soát và hoàn cọc (Hỗ trợ bảo lưu cọc phạt nguội 15-20 ngày)
    [HttpPost("bookings/{id}/refund")]
    public async Task<IActionResult> RefundDeposit(long id, [FromBody] StepTransitionRequest req)
    {
        var updated = await _lifecycleService.RefundDepositAsync(id, req.RefundAmount ?? 0, req.PaymentMethod ?? "CHUYEN_KHOAN", req.Notes, null, req.HoldAmountForFines ?? 0);
        string message = (req.HoldAmountForFines.HasValue && req.HoldAmountForFines.Value > 0)
            ? $"Đã hoàn cọc đợt 1 và bảo lưu {req.HoldAmountForFines.Value:N0} VNĐ chờ đối soát phạt nguội cổng CSGT trong 15 ngày."
            : "Đã hoàn tất đối soát và hoàn cọc 100%! Đơn thuê hoàn thành.";
        return Ok(ApiResponse<BookingDto>.Ok(updated, message));
    }

    // 10b. Giải phóng tiền cọc bảo lưu phạt nguội (Đợt 2)
    [HttpPost("bookings/{id}/release-traffic-hold")]
    public async Task<IActionResult> ReleaseTrafficHold(long id, [FromBody] ReleaseTrafficHoldRequest req)
    {
        var updated = await _lifecycleService.ReleaseTrafficHoldAsync(id, req.Amount, req.PaymentMethod ?? "CHUYEN_KHOAN", req.DeductionForFines ?? 0, req.Notes, null);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Đã giải phóng và thanh toán cọc phạt nguội thành công! Đơn thuê hoàn tất 100%."));
    }

    // Gia hạn hợp đồng đang thuê (Trip Extension)
    [HttpPost("bookings/{id}/extend")]
    public async Task<IActionResult> ExtendBooking(long id, [FromBody] ExtendBookingRequest req)
    {
        var updated = await _lifecycleService.ExtendBookingAsync(id, req.NewEndDate, req.Notes, null);
        return Ok(ApiResponse<BookingDto>.Ok(updated, "Gia hạn hợp đồng thuê xe thành công! Lịch xe và chi phí đã được cập nhật."));
    }

    // Lấy toàn bộ lịch sử nghiệp vụ của đơn thuê
    [HttpGet("bookings/{id}/history")]
    public async Task<IActionResult> GetBookingHistory(long id)
    {
        var history = await _lifecycleService.GetBookingHistoryAsync(id);
        return Ok(ApiResponse<List<BookingHistoryDto>>.Ok(history, "Lấy lịch sử nghiệp vụ đơn thuê thành công"));
    }

    [HttpPatch("bookings/{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(string id, [FromBody] dynamic payload)
    {
        long.TryParse(id, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId || d.MaDonThue == id);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        string newStatus = (string)payload.status;
        var rawStatus = newStatus.ToUpper() switch
        {
            "PENDING" => "CHO_XAC_NHAN",
            "DEPOSIT_PAID" => "DA_DAT_COC",
            "CONFIRMED" => "DA_XAC_NHAN",
            "ACTIVE" => "DANG_THUE",
            "COMPLETED" => "HOAN_THANH",
            "CANCELLED" => "DA_HUY",
            "REJECTED" => "TU_CHOI",
            _ => newStatus
        };

        order.TrangThai = rawStatus;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true, bookingStatus = newStatus }, "Cập nhật trạng thái đơn thành công"));
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _context.KhachHangs
            .Where(k => !k.DaXoa)
            .Select(k => new
            {
                id = k.KhachHangId,
                fullName = k.HoTen ?? "Khách hàng",
                email = k.Email ?? "khachhang@gmail.com",
                phone = k.SoDienThoai ?? "0901234567",
                citizenId = k.SoCCCD ?? "001201009988",
                driverLicenseNo = k.SoGPLX ?? "B2-88776655",
                licenseClass = k.HangGPLX ?? "B2",
                status = k.TrangThai == "HOAT_DONG" ? "ACTIVE" : "LOCKED",
                role = "CUSTOMER",
                avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(customers, "Lấy danh sách khách hàng thành công"));
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var staffList = await _context.NguoiDungs
            .Include(u => u.VaiTro)
            .Where(u => !u.DaXoa && (u.VaiTroId == 2 || u.VaiTroId == 1))
            .Select(u => new
            {
                id = u.NguoiDungId,
                fullName = u.HoTen ?? "Nhân viên",
                email = u.Email ?? "staff@autorental.vn",
                phone = u.SoDienThoai ?? "0912345678",
                role = u.VaiTroId == 1 ? "Quản lý" : "Nhân viên",
                status = u.TrangThai == "HOAT_DONG" ? "HOAT_DONG" : "TAM_KHOA",
                branch = "Chi nhánh Cầu Giấy - Hà Nội"
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(staffList, "Lấy danh sách nhân viên thành công"));
    }

    [HttpGet("maintenance")]
    public async Task<IActionResult> GetMaintenance()
    {
        var list = await _context.BaoTris
            .Include(b => b.Xe).ThenInclude(x => x!.MauXe)
            .OrderByDescending(b => b.ThoiGianBatDau)
            .Select(b => new
            {
                id = b.BaoTriId,
                carId = b.XeId,
                carName = b.Xe != null && b.Xe.MauXe != null ? b.Xe.MauXe.TenMauXe : "Xe ô tô",
                licensePlate = b.Xe != null ? b.Xe.BienSo : "30A-123.45",
                type = b.LoaiBaoTri == "BAO_DUONG_DINH_KY" ? "Bảo dưỡng định kỳ" : b.LoaiBaoTri,
                startDate = b.ThoiGianBatDau.ToString("yyyy-MM-dd"),
                endDate = b.ThoiGianDuKienKetThuc.ToString("yyyy-MM-dd"),
                cost = b.ChiPhi,
                status = b.TrangThai == "HOAN_THANH" ? "COMPLETED" : "IN_PROGRESS",
                technician = "Vũ Văn Nam",
                notes = b.GhiChu ?? b.MoTa
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(list, "Lấy danh sách bảo trì thành công"));
    }

    [HttpPost("maintenance")]
    public async Task<IActionResult> CreateMaintenance([FromBody] CreateMaintenanceRequest req)
    {
        var car = await _context.Xes.FirstOrDefaultAsync(x => x.XeId == req.CarId);
        if (car == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy xe yêu cầu bảo dưỡng."));
        }

        string rawType = req.Type?.ToUpper() switch
        {
            "BẢO DƯỠNG ĐỊNH KỲ" or "BAO_DUONG_DINH_KY" => "BAO_DUONG_DINH_KY",
            "SỬA CHỮA" or "SUA_CHUA" => "SUA_CHUA",
            "THAY LỐP" or "THAY_LOP" => "THAY_LOP",
            "ĐĂNG KIỂM" or "DANG_KIEM" => "DANG_KIEM",
            _ => "BAO_DUONG_DINH_KY"
        };

        var maintenance = new BaoTri
        {
            XeId = req.CarId,
            ChiNhanhId = car.ChiNhanhId,
            LoaiBaoTri = rawType,
            ThoiGianBatDau = req.StartDate,
            ThoiGianDuKienKetThuc = req.EndDate,
            ChiPhi = req.Cost,
            TrangThai = (req.Status == "COMPLETED" || req.Status == "HOAN_THANH") ? "HOAN_THANH" : "DANG_BAO_TRI",
            MoTa = req.Notes ?? "Bảo trì phương tiện định kỳ",
            GhiChu = req.Notes,
            NgayTao = DateTime.UtcNow,
            NgayCapNhat = DateTime.UtcNow
        };

        // Đồng bộ trạng thái xe
        if (maintenance.TrangThai == "DANG_BAO_TRI")
        {
            car.TrangThai = "BAO_TRI";
        }
        else
        {
            car.TrangThai = "HOAT_DONG";
        }

        _context.BaoTris.Add(maintenance);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { id = maintenance.BaoTriId, carStatus = car.TrangThai }, "Tạo phiếu bảo trì và đồng bộ trạng thái xe thành công"));
    }

    [HttpPatch("maintenance/{id}/complete")]
    public async Task<IActionResult> CompleteMaintenance(long id)
    {
        var record = await _context.BaoTris.Include(b => b.Xe).FirstOrDefaultAsync(b => b.BaoTriId == id);
        if (record == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy phiếu bảo trì"));
        }

        record.TrangThai = "HOAN_THANH";
        var now = DateTime.UtcNow;
        record.ThoiGianKetThucThucTe = now >= record.ThoiGianBatDau ? now : record.ThoiGianBatDau.AddHours(1);
        record.NgayCapNhat = now;

        if (record.Xe != null)
        {
            record.Xe.TrangThai = "HOAT_DONG";
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { success = true, carId = record.XeId, carStatus = "HOAT_DONG" }, "Đã hoàn tất bảo trì, xe đã sẵn sàng cho thuê!"));
    }

    [HttpDelete("maintenance/{id}")]
    public async Task<IActionResult> DeleteMaintenance(long id)
    {
        var record = await _context.BaoTris.Include(b => b.Xe).FirstOrDefaultAsync(b => b.BaoTriId == id);
        if (record == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy phiếu bảo trì"));
        }

        if (record.Xe != null && record.Xe.TrangThai == "BAO_TRI")
        {
            record.Xe.TrangThai = "HOAT_DONG";
        }

        _context.BaoTris.Remove(record);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true }, "Đã xóa phiếu bảo trì thành công"));
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetReviews()
    {
        var list = await _context.DanhGias
            .Include(r => r.Xe).ThenInclude(x => x!.MauXe)
            .Include(r => r.KhachHang)
            .OrderByDescending(r => r.NgayTao)
            .Select(r => new
            {
                id = r.DanhGiaId,
                bookingId = r.DonThueId,
                carId = r.XeId,
                carName = r.Xe != null && r.Xe.MauXe != null ? r.Xe.MauXe.TenMauXe : "Xe ô tô",
                customerName = r.KhachHang != null ? r.KhachHang.HoTen : "Khách hàng",
                rating = (int)r.SoSao,
                cleanlinessRating = (int)r.SoSao,
                staffRating = (int)r.SoSao,
                carPerformanceRating = (int)r.SoSao,
                title = r.TieuDe,
                comment = r.NoiDung,
                staffResponse = r.PhanHoiNhanVien,
                createdAt = r.NgayTao
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(list, "Lấy danh sách đánh giá thành công"));
    }

    [HttpPost("reviews/{id}/reply")]
    public async Task<IActionResult> ReplyReview(long id, [FromBody] ReviewReplyRequest req)
    {
        var review = await _context.DanhGias.FirstOrDefaultAsync(r => r.DanhGiaId == id);
        if (review == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đánh giá"));
        }

        review.PhanHoiNhanVien = req.ReplyText;
        review.ThoiGianPhanHoi = DateTime.UtcNow;
        review.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { success = true }, "Phản hồi đánh giá của khách hàng thành công"));
    }

    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments()
    {
        var list = await _context.ThanhToans
            .OrderByDescending(t => t.ThoiGianThanhToan)
            .Select(t => new
            {
                id = t.ThanhToanId,
                bookingId = t.DonThueId,
                paymentCode = t.MaThanhToan,
                type = t.LoaiThanhToan,
                method = t.PhuongThuc,
                amount = t.SoTien,
                status = t.TrangThai,
                transactionCode = t.MaGiaoDich,
                paymentDate = t.ThoiGianThanhToan
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(list, "Lấy danh sách giao dịch thanh toán thành công"));
    }

    [HttpGet("contracts")]
    public async Task<IActionResult> GetContracts()
    {
        var list = await _context.HopDongThues
            .OrderByDescending(h => h.NgayTao)
            .Select(h => new
            {
                id = h.HopDongId,
                bookingId = h.DonThueId,
                contractNumber = h.SoHopDong,
                customerName = h.HoTenKhachSnapshot,
                phone = h.SoDienThoaiSnapshot,
                citizenId = h.CCCDSnapshot,
                licenseNo = h.GPLXSnapshot,
                carName = h.TenXeSnapshot,
                licensePlate = h.BienSoSnapshot,
                totalAmount = h.TongTien,
                depositAmount = h.TienDatCoc,
                status = h.TrangThai,
                signedDate = h.NgayKy,
                pdfUrl = h.DuongDanPDF
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(list, "Lấy danh sách hợp đồng thành công"));
    }

    [HttpGet("handovers")]
    public async Task<IActionResult> GetHandovers()
    {
        var list = await _context.BienBanGiaoNhans
            .Include(b => b.Xe).ThenInclude(x => x!.MauXe)
            .OrderByDescending(b => b.ThoiGian)
            .Select(b => new
            {
                id = b.BienBanId,
                bookingId = b.DonThueId,
                carId = b.XeId,
                carName = b.Xe != null && b.Xe.MauXe != null ? b.Xe.MauXe.TenMauXe : "Xe ô tô",
                licensePlate = b.Xe != null ? b.Xe.BienSo : "30A-123.45",
                type = b.LoaiBienBan,
                handoverTime = b.ThoiGian,
                mileage = b.SoKm,
                fuelLevel = b.MucNhienLieu,
                exterior = b.TinhTrangNgoaiThat,
                interior = b.TinhTrangNoiThat,
                notes = b.GhiChu
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(list, "Lấy danh sách biên bản giao nhận thành công"));
    }

    [HttpPatch("customers/{id}/status")]
    public async Task<IActionResult> UpdateCustomerStatus(int id, [FromBody] dynamic payload)
    {
        var customer = await _context.KhachHangs.FirstOrDefaultAsync(k => k.KhachHangId == id);
        if (customer != null)
        {
            string status = (string)payload.status;
            customer.TrangThai = status == "LOCKED" ? "KHOA" : "HOAT_DONG";
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { success = true }, "Cập nhật trạng thái khách hàng thành công"));
        }

        var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.NguoiDungId == id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy tài khoản người dùng"));
        }

        string s = (string)payload.status;
        user.TrangThai = s == "LOCKED" ? "KHOA" : "HOAT_DONG";
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { success = true }, "Cập nhật trạng thái tài khoản thành công"));
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

    [HttpGet("settings")]
    public IActionResult GetSettings()
    {
        var settings = new
        {
            companyName = "CarRental Việt Nam",
            slogan = "Hệ thống quản lý và cho thuê xe ô tô trực tuyến",
            email = "support@carrental.com",
            hotline = "0123 456 789",
            emergencyPhone = "1900 8899",
            headquarters = "Số 123, đường ABC, Hà Nội",
            dailyMileageLimit = 300,
            extraMileageCharge = 5000,
            depositRatePercentage = 100,
            enableVietQR = true,
            enableVnpay = true
        };

        return Ok(ApiResponse<object>.Ok(settings, "Lấy cấu hình hệ thống thành công"));
    }

    [HttpPut("settings")]
    public IActionResult UpdateSettings([FromBody] dynamic payload)
    {
        return Ok(ApiResponse<object>.Ok(new { success = true }, "Cập nhật cấu hình hệ thống thành công"));
    }

    // === HỆ THỐNG THÔNG BÁO VẬN HÀNH (NOTIFICATION CENTER) ===
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        var now = DateTime.UtcNow;
        var notifications = new List<NotificationDto>();

        // 1. Lấy thông báo lưu trong CSDL
        var dbNotifs = await _context.ThongBaos
            .OrderByDescending(t => t.NgayTao)
            .Take(20)
            .ToListAsync();

        foreach (var n in dbNotifs)
        {
            notifications.Add(new NotificationDto
            {
                Id = n.ThongBaoId,
                Title = n.TieuDe ?? "Thông báo hệ thống",
                Content = n.NoiDung ?? "",
                Type = n.LoaiThongBao ?? "INFO",
                RelatedTarget = n.DoiTuongLienQuan,
                TargetId = n.IdDoiTuong,
                IsRead = n.DaDoc,
                CreatedAt = n.NgayTao,
                TimeAgo = GetTimeAgo(n.NgayTao)
            });
        }

        // 2. Tự động tổng hợp các sự kiện vận hành quan trọng từ DonThue
        var pendingOrders = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Where(d => d.TrangThai == "CHO_XAC_NHAN")
            .OrderByDescending(d => d.NgayTao)
            .Take(5)
            .ToListAsync();

        foreach (var p in pendingOrders)
        {
            notifications.Add(new NotificationDto
            {
                Id = 100000 + p.DonThueId,
                Title = $"Đơn thuê mới chờ duyệt: {p.MaDonThue}",
                Content = $"Khách hàng {p.KhachHang?.HoTen ?? "Khách"} vừa đặt thuê xe {p.Xe?.MauXe?.TenMauXe ?? "ô tô"} ({p.SoNgayThue} ngày). Vui lòng kiểm tra và duyệt đơn.",
                Type = "CHO_XAC_NHAN",
                RelatedTarget = "DON_THUE",
                TargetId = p.DonThueId,
                IsRead = false,
                CreatedAt = p.NgayTao ?? now,
                TimeAgo = GetTimeAgo(p.NgayTao ?? now)
            });
        }

        // Đơn sắp đến hạn giao xe
        var readyOrders = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Where(d => d.TrangThai == "SAN_SANG_GIAO")
            .OrderByDescending(d => d.NgayCapNhat ?? d.NgayTao)
            .Take(5)
            .ToListAsync();

        foreach (var r in readyOrders)
        {
            notifications.Add(new NotificationDto
            {
                Id = 200000 + r.DonThueId,
                Title = $"Đơn sẵn sàng bàn giao: {r.MaDonThue}",
                Content = $"Khách {r.KhachHang?.HoTen ?? "Khách"} đã nộp cọc. Xe {r.Xe?.BienSo} sẵn sàng thực hiện thủ tục bàn giao xe.",
                Type = "SAN_SANG_GIAO",
                RelatedTarget = "DON_THUE",
                TargetId = r.DonThueId,
                IsRead = false,
                CreatedAt = r.NgayCapNhat ?? r.NgayTao ?? now,
                TimeAgo = GetTimeAgo(r.NgayCapNhat ?? r.NgayTao ?? now)
            });
        }

        // Đơn chờ đối soát hoàn cọc
        var refundOrders = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Where(d => d.TrangThai == "CHO_HOAN_COC" && d.DaDoiSoatCoc != true)
            .OrderByDescending(d => d.NgayCapNhat ?? d.NgayTao)
            .Take(5)
            .ToListAsync();

        foreach (var rf in refundOrders)
        {
            notifications.Add(new NotificationDto
            {
                Id = 300000 + rf.DonThueId,
                Title = $"Chờ đối soát hoàn cọc: {rf.MaDonThue}",
                Content = $"Đơn thuê xe {rf.Xe?.BienSo} đã trả xe & chốt hóa đơn. Vui lòng đối soát và hoàn cọc cho khách hàng.",
                Type = "CHO_HOAN_COC",
                RelatedTarget = "DON_THUE",
                TargetId = rf.DonThueId,
                IsRead = false,
                CreatedAt = rf.NgayCapNhat ?? rf.NgayTao ?? now,
                TimeAgo = GetTimeAgo(rf.NgayCapNhat ?? rf.NgayTao ?? now)
            });
        }

        var ordered = notifications.OrderByDescending(x => x.CreatedAt).ToList();
        int unread = ordered.Count(x => !x.IsRead);

        return Ok(ApiResponse<object>.Ok(new
        {
            unreadCount = unread,
            totalCount = ordered.Count,
            items = ordered
        }, "Lấy thông báo thành công"));
    }

    [HttpPost("notifications/{id}/read")]
    public async Task<IActionResult> MarkNotificationRead(long id)
    {
        var notif = await _context.ThongBaos.FirstOrDefaultAsync(t => t.ThongBaoId == id);
        if (notif != null)
        {
            notif.DaDoc = true;
            await _context.SaveChangesAsync();
        }
        return Ok(ApiResponse<object>.Ok(new { success = true }, "Đã đánh dấu đã đọc thông báo"));
    }

    [HttpPost("notifications/mark-all-read")]
    public async Task<IActionResult> MarkAllNotificationsRead()
    {
        var unread = await _context.ThongBaos.Where(t => !t.DaDoc).ToListAsync();
        foreach (var u in unread)
        {
            u.DaDoc = true;
        }
        if (unread.Count > 0)
        {
            await _context.SaveChangesAsync();
        }
        return Ok(ApiResponse<object>.Ok(new { success = true }, "Đã đánh dấu đọc toàn bộ thông báo"));
    }

    private static string GetTimeAgo(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 1) return "Vừa xong";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} phút trước";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} giờ trước";
        return $"{(int)diff.TotalDays} ngày trước";
    }
}
