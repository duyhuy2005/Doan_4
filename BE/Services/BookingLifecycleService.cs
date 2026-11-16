using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.Models;
using CarRental.Api.DTOs;

namespace CarRental.Api.Services;

public interface IBookingLifecycleService
{
    Task AddHistoryAsync(long donThueId, string? oldStatus, string newStatus, int? staffId, string reason);
    Task<SweepExpiredResponse> SweepExpiredBookingsAsync();
    Task<BookingDto> ConfirmOrderAsync(long bookingId, int? staffId, string? notes);
    Task<ContractDto> CreateContractAsync(long bookingId, int? staffId, string? notes);
    Task<BookingDto> CustomerConfirmContractAsync(long bookingId, string? signature, int deadlineMinutes = 30);
    Task<BookingDto> ConfirmDepositAsync(long bookingId, decimal amount, string method, int? staffId);
    Task<BookingDto> HandoverCarAsync(long bookingId, int odo, decimal fuel, string? notes, int? staffId);
    Task<BookingDto> ReturnCarAsync(long bookingId, int odo, decimal fuel, decimal penalty, string? notes, int? staffId);
    Task<BookingDto> FinalizeSettlementAsync(long bookingId, decimal finalPaymentAmount, string method, int? staffId);
    Task<BookingDto> RefundDepositAsync(long bookingId, decimal refundAmount, string method, string? notes, int? staffId, decimal holdAmountForFines = 0);
    Task<BookingDto> ReleaseTrafficHoldAsync(long bookingId, decimal? amount, string method, decimal deductionForFines, string? notes, int? staffId);
    Task<BookingDto> ExtendBookingAsync(long bookingId, DateTime newEndDate, string? notes, int? staffId);
    Task<List<BookingHistoryDto>> GetBookingHistoryAsync(long bookingId);
}

public class BookingLifecycleService : IBookingLifecycleService
{
    private readonly CarRentalDbContext _context;

    public BookingLifecycleService(CarRentalDbContext context)
    {
        _context = context;
    }

    public async Task AddHistoryAsync(long donThueId, string? oldStatus, string newStatus, int? staffId, string reason)
    {
        var history = new LichSuTrangThaiDon
        {
            DonThueId = donThueId,
            TrangThaiCu = oldStatus,
            TrangThaiMoi = newStatus,
            NguoiThucHienId = staffId,
            LyDo = reason,
            NgayThucHien = DateTime.UtcNow
        };

        _context.LichSuTrangThaiDons.Add(history);
        await _context.SaveChangesAsync();
    }

    public async Task<SweepExpiredResponse> SweepExpiredBookingsAsync()
    {
        var now = DateTime.UtcNow;
        var expiredOrders = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Where(d => (d.TrangThai == "CHO_THANH_TOAN_COC" || d.TrangThai == "DA_XAC_NHAN" || d.TrangThai == "CHO_HOP_DONG" || d.TrangThai == "CHO_XAC_NHAN")
                     && d.HanGiuDon.HasValue && d.HanGiuDon.Value < now)
            .ToListAsync();

        var affectedCodes = new List<string>();

        foreach (var order in expiredOrders)
        {
            // Kiểm tra xem đơn đã có bản ghi thanh toán cọc thành công chưa
            bool hasDepositPaid = await _context.ThanhToans
                .AnyAsync(t => t.DonThueId == order.DonThueId && t.LoaiThanhToan == "TIEN_DAT_COC" && t.TrangThai == "THANH_CONG");

            if (hasDepositPaid) continue;

            string oldStatus = order.TrangThai ?? "CHO_THANH_TOAN_COC";
            order.TrangThai = "HET_HAN";
            order.GhiChuNoiBo = $"Tự động hủy: Đơn thuê hết hạn giữ xe lúc {order.HanGiuDon:dd/MM/yyyy HH:mm} do quá hạn nộp tiền cọc bảo đảm. Lịch xe đã được giải phóng.";
            order.NgayCapNhat = now;

            // Hủy hợp đồng liên kết nếu có
            var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == order.DonThueId);
            if (contract != null && contract.TrangThai != "HOAN_THANH")
            {
                contract.TrangThai = "DA_HUY";
            }

            // Ghi lịch sử nghiệp vụ
            _context.LichSuTrangThaiDons.Add(new LichSuTrangThaiDon
            {
                DonThueId = order.DonThueId,
                TrangThaiCu = oldStatus,
                TrangThaiMoi = "HET_HAN",
                NguoiThucHienId = null,
                LyDo = $"Hệ thống tự động hủy đơn giữ xe do khách hàng không thanh toán cọc đúng thời hạn quy định ({order.HanGiuDon:dd/MM/yyyy HH:mm}). Xe {order.Xe?.BienSo} đã được giải phóng trở lại lịch sẵn sàng.",
                NgayThucHien = now
            });

            affectedCodes.Add(order.MaDonThue ?? order.DonThueId.ToString());
        }

        if (affectedCodes.Count > 0)
        {
            await _context.SaveChangesAsync();
        }

        return new SweepExpiredResponse
        {
            ExpiredCount = affectedCodes.Count,
            ExpiredBookingCodes = affectedCodes,
            Message = affectedCodes.Count > 0 
                ? $"Đã tự động hủy {affectedCodes.Count} đơn quá hạn cọc và giải phóng lịch xe." 
                : "Không có đơn nào quá hạn giữ xe."
        };
    }

    public async Task<BookingDto> ConfirmOrderAsync(long bookingId, int? staffId, string? notes)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        string oldStatus = order.TrangThai ?? "CHO_XAC_NHAN";
        order.TrangThai = "DA_XAC_NHAN";
        order.GhiChuNoiBo = notes ?? order.GhiChuNoiBo;
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "DA_XAC_NHAN", staffId, 
            "Nhân viên đã xác nhận duyệt đơn thuê. Chuyển sang bước tạo hợp đồng điện tử.");

        return MapToDto(order);
    }

    public async Task<ContractDto> CreateContractAsync(long bookingId, int? staffId, string? notes)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == bookingId);
        string contractCode = $"HD{DateTime.UtcNow:yyyyMMdd}{order.DonThueId}";

        if (contract == null)
        {
            contract = new HopDongThue
            {
                DonThueId = order.DonThueId,
                SoHopDong = contractCode,
                HoTenKhachSnapshot = order.KhachHang?.HoTen ?? "Khách hàng",
                SoDienThoaiSnapshot = order.KhachHang?.SoDienThoai ?? "",
                CCCDSnapshot = order.KhachHang?.SoCCCD ?? "001200000001",
                GPLXSnapshot = order.KhachHang?.SoGPLX ?? "B2-123456",
                TenXeSnapshot = order.Xe?.MauXe?.TenMauXe ?? "Xe ô tô",
                BienSoSnapshot = order.Xe?.BienSo ?? "30A-00000",
                ThoiGianNhan = order.ThoiGianNhan,
                ThoiGianTra = order.ThoiGianTraDuKien,
                TongTien = order.TongTien,
                TienDatCoc = order.TienDatCocYeuCau,
                TrangThai = "NHAP",
                NgayTao = DateTime.UtcNow,
                DieuKhoan = "1. Bên A giao xe đúng chủng loại, an toàn kỹ thuật.\n2. Bên B sử dụng xe đúng mục đích, tuân thủ luật GTĐB.\n3. Bên B nộp tiền cọc bảo đảm trong thời hạn quy định để hợp đồng có hiệu lực."
            };
            _context.HopDongThues.Add(contract);
        }
        else
        {
            contract.TrangThai = "NHAP";
            contract.NgayTao = DateTime.UtcNow;
        }

        string oldStatus = order.TrangThai ?? "DA_XAC_NHAN";
        order.TrangThai = "CHO_HOP_DONG";
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "CHO_HOP_DONG", staffId,
            $"Đã soạn thảo và khởi tạo hợp đồng điện tử #{contract.SoHopDong}. Chuyển sang bước gửi khách hàng xác nhận ký duyệt.");

        return new ContractDto
        {
            Id = contract.HopDongId.ToString(),
            ContractCode = contract.SoHopDong ?? contractCode,
            BookingId = order.DonThueId.ToString(),
            CustomerName = contract.HoTenKhachSnapshot ?? "",
            CustomerPhone = contract.SoDienThoaiSnapshot ?? "",
            CitizenId = contract.CCCDSnapshot,
            DriverLicenseNo = contract.GPLXSnapshot,
            CarName = contract.TenXeSnapshot,
            LicensePlate = contract.BienSoSnapshot,
            TotalPrice = contract.TongTien,
            DepositAmount = contract.TienDatCoc,
            Status = contract.TrangThai ?? "NHAP",
            SignedAt = contract.NgayKy
        };
    }

    public async Task<BookingDto> CustomerConfirmContractAsync(long bookingId, string? signature, int deadlineMinutes = 30)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == bookingId);
        if (contract != null)
        {
            contract.TrangThai = "KHACH_DA_KY";
            contract.NgayKy = DateTime.UtcNow;
            contract.KyHaiBenHoanTat = true;
        }

        string oldStatus = order.TrangThai ?? "CHO_HOP_DONG";
        order.TrangThai = "CHO_THANH_TOAN_COC";
        order.HanGiuDon = DateTime.UtcNow.AddMinutes(deadlineMinutes);
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "CHO_THANH_TOAN_COC", null,
            $"Khách hàng đã ký xác nhận hợp đồng điện tử. Thời hạn giữ xe và thanh toán tiền cọc bảo đảm là {deadlineMinutes} phút (đến {order.HanGiuDon:dd/MM/yyyy HH:mm}). Nếu quá hạn, hệ thống sẽ tự động hủy đơn và giải phóng lịch xe.");

        return MapToDto(order);
    }

    public async Task<BookingDto> ConfirmDepositAsync(long bookingId, decimal amount, string method, int? staffId)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        // Kiểm tra xem đơn đã bị hết hạn giữ xe chưa
        if (order.TrangThai == "HET_HAN" || order.TrangThai == "DA_HUY")
        {
            throw new InvalidOperationException("Đơn thuê đã bị hủy hoặc hết hạn giữ xe do quá hạn thanh toán cọc.");
        }

        // Tạo bản ghi thanh toán tiền cọc
        var payment = new ThanhToan
        {
            DonThueId = order.DonThueId,
            KhachHangId = order.KhachHangId,
            MaThanhToan = $"PAY-DEP-{DateTime.UtcNow:yyyyMMddHHmmss}",
            LoaiThanhToan = "TIEN_DAT_COC",
            PhuongThuc = string.IsNullOrEmpty(method) ? "CHUYEN_KHOAN" : method,
            SoTien = amount > 0 ? amount : order.TienDatCocYeuCau,
            TrangThai = "THANH_CONG",
            ThoiGianThanhToan = DateTime.UtcNow,
            NgayTao = DateTime.UtcNow,
            DaDoiSoatCoc = false,
            MaGiaoDich = $"DEP-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            MaIdempotency = $"IDEMP-DEP-{Guid.NewGuid():N}"
        };
        _context.ThanhToans.Add(payment);

        // Kích hoạt hợp đồng chính thức có hiệu lực
        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == bookingId);
        if (contract != null)
        {
            contract.TrangThai = "HIEU_LUC";
        }

        string oldStatus = order.TrangThai ?? "CHO_THANH_TOAN_COC";
        order.TrangThai = "SAN_SANG_GIAO";
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "SAN_SANG_GIAO", staffId,
            $"Đã xác nhận thanh toán tiền cọc bảo đảm {payment.SoTien:N0} VNĐ qua {payment.PhuongThuc}. Hợp đồng chính thức có hiệu lực pháp lý. Xe sẵn sàng bàn giao cho khách.");

        return MapToDto(order);
    }

    public async Task<BookingDto> HandoverCarAsync(long bookingId, int odo, decimal fuel, string? notes, int? staffId)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        var handover = new BienBanGiaoNhan
        {
            DonThueId = order.DonThueId,
            XeId = order.XeId,
            NhanVienId = staffId,
            ChiNhanhId = order.ChiNhanhNhanId ?? 1,
            LoaiBienBan = "GIAO_XE",
            ThoiGian = DateTime.UtcNow,
            NgayTao = DateTime.UtcNow,
            SoKm = odo > 0 ? odo : (order.Xe?.SoKmHienTai ?? 10000),
            MucNhienLieu = fuel > 0 ? fuel : 100,
            TinhTrangNgoaiThat = "Ngoại thất sạch sẽ, không móp méo",
            TinhTrangNoiThat = "Nội thất nguyên bản, đầy đủ phụ kiện",
            GhiChu = notes ?? "Đã bàn giao xe và giấy tờ cho khách"
        };
        _context.BienBanGiaoNhans.Add(handover);

        if (order.Xe != null)
        {
            order.Xe.SoKmHienTai = handover.SoKm;
            order.Xe.TrangThai = "DANG_THUE";
        }

        string oldStatus = order.TrangThai ?? "SAN_SANG_GIAO";
        order.TrangThai = "DANG_THUE";
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "DANG_THUE", staffId,
            $"Đã bàn giao xe cho khách hàng (Số km ODO xuất phát: {handover.SoKm} km, Nhiên liệu: {handover.MucNhienLieu}%). Khách hàng bắt đầu hành trình lưu hành xe.");

        return MapToDto(order);
    }

    public async Task<BookingDto> ReturnCarAsync(long bookingId, int odo, decimal fuel, decimal penalty, string? notes, int? staffId)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        var handover = new BienBanGiaoNhan
        {
            DonThueId = order.DonThueId,
            XeId = order.XeId,
            NhanVienId = staffId,
            ChiNhanhId = order.ChiNhanhTraId ?? order.ChiNhanhNhanId ?? 1,
            LoaiBienBan = "NHAN_XE",
            ThoiGian = DateTime.UtcNow,
            NgayTao = DateTime.UtcNow,
            SoKm = odo > 0 ? odo : (order.Xe?.SoKmHienTai ?? 10500),
            MucNhienLieu = fuel,
            TinhTrangNgoaiThat = "Kiểm tra hoàn trả xe",
            TinhTrangNoiThat = "Đã kiểm tra nội thất khi trả xe",
            GhiChu = notes ?? "Đã thu hồi xe và kiểm định hiện trạng"
        };
        _context.BienBanGiaoNhans.Add(handover);

        if (order.Xe != null)
        {
            order.Xe.SoKmHienTai = handover.SoKm;
            order.Xe.TrangThai = "HOAT_DONG";
        }

        string oldStatus = order.TrangThai ?? "DANG_THUE";
        order.TrangThai = "CHO_CHOT_HOA_DON";
        order.TienPhiPhatSinh = penalty;
        order.TongTien = order.TienThue + order.TienDichVu - order.TienGiam + penalty;
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "CHO_CHOT_HOA_DON", staffId,
            $"Đã nhận lại xe từ khách hàng (ODO hoàn trả: {handover.SoKm} km, Nhiên liệu: {handover.MucNhienLieu}%). Phụ phí phát sinh tính toán: {penalty:N0} VNĐ. Đang chờ chốt hóa đơn quyết toán.");

        return MapToDto(order);
    }

    public async Task<BookingDto> FinalizeSettlementAsync(long bookingId, decimal finalPaymentAmount, string method, int? staffId)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        if (finalPaymentAmount > 0)
        {
            var payment = new ThanhToan
            {
                DonThueId = order.DonThueId,
                KhachHangId = order.KhachHangId,
                MaThanhToan = $"PAY-FINAL-{DateTime.UtcNow:yyyyMMddHHmmss}",
                LoaiThanhToan = "TIEN_THUE",
                PhuongThuc = string.IsNullOrEmpty(method) ? "CHUYEN_KHOAN" : method,
                SoTien = finalPaymentAmount,
                TrangThai = "THANH_CONG",
                ThoiGianThanhToan = DateTime.UtcNow,
                NgayTao = DateTime.UtcNow,
                DaDoiSoatCoc = false,
                MaGiaoDich = $"FIN-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MaIdempotency = $"IDEMP-FIN-{Guid.NewGuid():N}"
            };
            _context.ThanhToans.Add(payment);
        }

        string oldStatus = order.TrangThai ?? "CHO_CHOT_HOA_DON";
        order.TrangThai = "CHO_HOAN_COC";
        order.NgayCapNhat = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "CHO_HOAN_COC", staffId,
            $"Đã chốt hóa đơn quyết toán chi phí. Khách hàng đã thanh toán đầy đủ tiền thuê và phụ phí ({finalPaymentAmount:N0} VNĐ). Chuyển sang bước đối soát và hoàn cọc.");

        return MapToDto(order);
    }

    public async Task<BookingDto> RefundDepositAsync(long bookingId, decimal refundAmount, string method, string? notes, int? staffId, decimal holdAmountForFines = 0)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        decimal totalDeposit = order.TienDatCocYeuCau > 0 ? order.TienDatCocYeuCau : 5000000m;
        decimal requestedRefund = refundAmount > 0 ? refundAmount : totalDeposit;

        // Nếu có chọn chính sách giữ cọc phạt nguội (e.g. 2,000,000 VNĐ trong 15-20 ngày)
        if (holdAmountForFines > 0 && requestedRefund > holdAmountForFines)
        {
            decimal immediateRefund = requestedRefund - holdAmountForFines;

            var phase1Payment = new ThanhToan
            {
                DonThueId = order.DonThueId,
                KhachHangId = order.KhachHangId,
                MaThanhToan = $"REF-P1-{DateTime.UtcNow:yyyyMMddHHmmss}",
                LoaiThanhToan = "HOAN_COC",
                PhuongThuc = string.IsNullOrEmpty(method) ? "CHUYEN_KHOAN" : method,
                SoTien = immediateRefund,
                TrangThai = "THANH_CONG",
                ThoiGianThanhToan = DateTime.UtcNow,
                NgayTao = DateTime.UtcNow,
                DaDoiSoatCoc = false,
                MaGiaoDich = $"REF1-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MaIdempotency = $"IDEMP-REF1-{Guid.NewGuid():N}",
                GhiChu = $"Hoàn cọc đợt 1. Bảo lưu {holdAmountForFines:N0} VNĐ chờ đối soát phạt nguội CSGT trong 15 ngày."
            };
            _context.ThanhToans.Add(phase1Payment);

            order.DaDoiSoatCoc = false;
            order.TrangThai = "CHO_HOAN_COC"; // Vẫn giữ ở trạng thái chờ giải phóng phạt nguội
            order.GhiChuNoiBo = $"Đã hoàn cọc đợt 1: {immediateRefund:N0} VNĐ. Đang bảo lưu {holdAmountForFines:N0} VNĐ để đối soát phạt nguội. Thời hạn đối soát dự kiến: 15 ngày.";
            order.NgayCapNhat = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await AddHistoryAsync(order.DonThueId, "CHO_HOAN_COC", "CHO_HOAN_COC", staffId,
                $"Đã đối soát và hoàn cọc Đợt 1 ({immediateRefund:N0} VNĐ) qua {phase1Payment.PhuongThuc}. Bảo lưu số tiền {holdAmountForFines:N0} VNĐ trong 15 ngày chờ đối soát dữ liệu phạt nguội cổng CSGT quốc gia.");

            return MapToDto(order);
        }

        // Hoàn cọc 100% hoặc hoàn tất toàn bộ số tiền còn lại
        var refundPayment = new ThanhToan
        {
            DonThueId = order.DonThueId,
            KhachHangId = order.KhachHangId,
            MaThanhToan = $"REFUND-{DateTime.UtcNow:yyyyMMddHHmmss}",
            LoaiThanhToan = "HOAN_COC",
            PhuongThuc = string.IsNullOrEmpty(method) ? "CHUYEN_KHOAN" : method,
            SoTien = requestedRefund,
            TrangThai = "THANH_CONG",
            ThoiGianThanhToan = DateTime.UtcNow,
            NgayTao = DateTime.UtcNow,
            DaDoiSoatCoc = true,
            MaGiaoDich = $"REF-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            MaIdempotency = $"IDEMP-REF-{Guid.NewGuid():N}",
            GhiChu = notes ?? "Đối soát hoàn tất cọc 100% qua tài khoản ngân hàng"
        };
        _context.ThanhToans.Add(refundPayment);

        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == bookingId);
        if (contract != null)
        {
            contract.TrangThai = "HOAN_THANH";
        }

        string oldStatus = order.TrangThai ?? "CHO_HOAN_COC";
        order.DaDoiSoatCoc = true;
        order.ThoiGianDoiSoatCoc = DateTime.UtcNow;
        order.NguoiDoiSoatCocId = staffId;
        order.TrangThai = "HOAN_THANH";
        order.NgayCapNhat = DateTime.UtcNow;

        if (order.Xe != null)
        {
            order.Xe.TrangThai = "HOAT_DONG";
        }

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "HOAN_THANH", staffId,
            $"Đã đối soát và hoàn trả toàn bộ tiền cọc {requestedRefund:N0} VNĐ cho khách hàng qua {refundPayment.PhuongThuc}. Đơn thuê xe đã hoàn tất thành công trọn vẹn mọi thủ tục!");

        return MapToDto(order);
    }

    public async Task<BookingDto> ReleaseTrafficHoldAsync(long bookingId, decimal? amount, string method, decimal deductionForFines, string? notes, int? staffId)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        decimal holdAmount = amount ?? 2000000m;

        // Nếu có biên lai phạt nguội cần trừ tiền
        if (deductionForFines > 0)
        {
            var finePayment = new ThanhToan
            {
                DonThueId = order.DonThueId,
                KhachHangId = order.KhachHangId,
                MaThanhToan = $"FINE-{DateTime.UtcNow:yyyyMMddHHmmss}",
                LoaiThanhToan = "KHAU_TRU_COC",
                PhuongThuc = string.IsNullOrEmpty(method) ? "CHUYEN_KHOAN" : method,
                SoTien = deductionForFines,
                TrangThai = "THANH_CONG",
                ThoiGianThanhToan = DateTime.UtcNow,
                NgayTao = DateTime.UtcNow,
                DaDoiSoatCoc = true,
                MaGiaoDich = $"FINE-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MaIdempotency = $"IDEMP-FINE-{Guid.NewGuid():N}",
                GhiChu = $"Khấu trừ vi phạm giao thông / phạt nguội: {notes ?? "Theo tra cứu cổng CSGT"}"
            };
            _context.ThanhToans.Add(finePayment);
        }

        decimal netRelease = Math.Max(0, holdAmount - deductionForFines);
        if (netRelease > 0)
        {
            var releasePayment = new ThanhToan
            {
                DonThueId = order.DonThueId,
                KhachHangId = order.KhachHangId,
                MaThanhToan = $"REF-P2-{DateTime.UtcNow:yyyyMMddHHmmss}",
                LoaiThanhToan = "HOAN_COC",
                PhuongThuc = string.IsNullOrEmpty(method) ? "CHUYEN_KHOAN" : method,
                SoTien = netRelease,
                TrangThai = "THANH_CONG",
                ThoiGianThanhToan = DateTime.UtcNow,
                NgayTao = DateTime.UtcNow,
                DaDoiSoatCoc = true,
                MaGiaoDich = $"REF2-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MaIdempotency = $"IDEMP-REF2-{Guid.NewGuid():N}",
                GhiChu = $"Hoàn trả số tiền bảo lưu phạt nguội đợt 2 sau 15 ngày đối soát sạch vi phạm giao thông."
            };
            _context.ThanhToans.Add(releasePayment);
        }

        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == bookingId);
        if (contract != null)
        {
            contract.TrangThai = "HOAN_THANH";
        }

        string oldStatus = order.TrangThai ?? "CHO_HOAN_COC";
        order.DaDoiSoatCoc = true;
        order.ThoiGianDoiSoatCoc = DateTime.UtcNow;
        order.NguoiDoiSoatCocId = staffId;
        order.TrangThai = "HOAN_THANH";
        order.NgayCapNhat = DateTime.UtcNow;

        if (order.Xe != null)
        {
            order.Xe.TrangThai = "HOAT_DONG";
        }

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, oldStatus, "HOAN_THANH", staffId,
            $"Đã đối soát xong dữ liệu phạt nguội cổng CSGT (Khấu trừ vi phạm: {deductionForFines:N0} VNĐ, Thực hoàn đợt 2: {netRelease:N0} VNĐ). Đơn thuê chính thức hoàn tất 100%!");

        return MapToDto(order);
    }

    public async Task<BookingDto> ExtendBookingAsync(long bookingId, DateTime newEndDate, string? notes, int? staffId)
    {
        var order = await _context.DonThues
            .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
            .Include(d => d.KhachHang)
            .Include(d => d.ChiNhanhNhan)
            .Include(d => d.ChiNhanhTra)
            .FirstOrDefaultAsync(d => d.DonThueId == bookingId);

        if (order == null) throw new KeyNotFoundException("Không tìm thấy đơn thuê");

        if (newEndDate <= order.ThoiGianTraDuKien)
        {
            throw new InvalidOperationException($"Thời gian gia hạn mới ({newEndDate:dd/MM/yyyy HH:mm}) phải lớn hơn thời gian trả xe dự kiến hiện tại ({order.ThoiGianTraDuKien:dd/MM/yyyy HH:mm}).");
        }

        // Kiểm tra xem xe có bị trùng lịch với đơn khác không
        bool hasConflict = await _context.DonThues.AnyAsync(d =>
            d.XeId == order.XeId &&
            d.DonThueId != order.DonThueId &&
            d.TrangThai != "DA_HUY" &&
            d.TrangThai != "TU_CHOI" &&
            d.TrangThai != "HET_HAN" &&
            d.ThoiGianNhan < newEndDate &&
            d.ThoiGianTraDuKien > order.ThoiGianTraDuKien
        );

        if (hasConflict)
        {
            throw new InvalidOperationException($"Xe {order.Xe?.BienSo} đã có khách hàng khác đặt trước trong khoảng thời gian gia hạn. Quý khách vui lòng hoàn trả xe đúng hạn hoặc liên hệ hotline để đổi xe.");
        }

        int additionalDays = (int)Math.Ceiling((newEndDate - order.ThoiGianTraDuKien).TotalDays);
        if (additionalDays <= 0) additionalDays = 1;

        decimal dailyPrice = order.DonGiaNgay > 0 ? order.DonGiaNgay : (order.Xe?.GiaThueNgay ?? 1000000m);
        decimal additionalRentalFee = dailyPrice * additionalDays;

        DateTime oldEnd = order.ThoiGianTraDuKien;
        order.ThoiGianTraDuKien = newEndDate;
        order.SoNgayThue += additionalDays;
        order.TienThue += additionalRentalFee;
        order.TongTien += additionalRentalFee;
        order.NgayCapNhat = DateTime.UtcNow;

        // Cập nhật hợp đồng nếu có
        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == bookingId);
        if (contract != null)
        {
            contract.ThoiGianTra = newEndDate;
            contract.TongTien += additionalRentalFee;
        }

        await _context.SaveChangesAsync();

        await AddHistoryAsync(order.DonThueId, order.TrangThai, order.TrangThai ?? "DANG_THUE", staffId,
            $"Gia hạn thời gian thuê thêm {additionalDays} ngày (từ {oldEnd:dd/MM/yyyy HH:mm} đến {newEndDate:dd/MM/yyyy HH:mm}). Phụ phí thuê phát sinh: {additionalRentalFee:N0} VNĐ ({notes ?? "Theo thỏa thuận gia hạn hợp đồng"}). Đã cập nhật phụ lục hợp đồng và lịch xe.");

        return MapToDto(order);
    }

    public async Task<List<BookingHistoryDto>> GetBookingHistoryAsync(long bookingId)
    {
        var historyList = await _context.LichSuTrangThaiDons
            .Include(h => h.NguoiThucHien)
            .Where(h => h.DonThueId == bookingId)
            .OrderBy(h => h.NgayThucHien)
            .ToListAsync();

        return historyList.Select(h => new BookingHistoryDto
        {
            Id = h.LichSuId,
            BookingId = h.DonThueId,
            PreviousStatus = h.TrangThaiCu,
            NewStatus = h.TrangThaiMoi,
            ActorName = h.NguoiThucHien?.HoTen ?? (h.NguoiThucHienId == null ? "Hệ thống tự động" : "Nhân viên"),
            Reason = h.LyDo ?? "Cập nhật tiến trình đơn thuê",
            ActionTime = h.NgayThucHien
        }).ToList();
    }

    private static BookingDto MapToDto(DonThue d)
    {
        int step = CarImageHelper.CalculateStep(d.TrangThai);
        bool isExpired = (d.TrangThai == "HET_HAN") || 
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
            PaymentStatus = d.TrangThai == "HOAN_THANH" ? "PAID" : (d.TrangThai == "SAN_SANG_GIAO" || d.TrangThai == "DANG_THUE" ? "DEPOSIT_PAID" : "UNPAID"),
            ContractSigned = d.TrangThai != "CHO_XAC_NHAN" && d.TrangThai != "DA_XAC_NHAN" && d.TrangThai != "CHO_HOP_DONG",
            PickupLocation = d.ChiNhanhNhan?.TenChiNhanh ?? "Chi nhánh Hà Nội",
            ReturnLocation = d.ChiNhanhTra?.TenChiNhanh ?? "Chi nhánh Hà Nội",
            Notes = d.GhiChuKhach,
            StaffNotes = d.GhiChuNoiBo,
            CreatedAt = d.NgayTao,
            DepositDeadline = d.HanGiuDon,
            IsExpired = isExpired,
            Step = step,
            StepName = CarImageHelper.GetStepName(step),
            ExtraCharges = d.TienPhiPhatSinh,
            IsDepositRefunded = d.DaDoiSoatCoc == true,
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
    }
}
