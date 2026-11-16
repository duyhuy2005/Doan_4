using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.DTOs;
using CarRental.Api.Models;

namespace CarRental.Api.Controllers;

[ApiController]
[Route("api/contracts")]
public class ContractsController : ControllerBase
{
    private readonly CarRentalDbContext _context;

    public ContractsController(CarRentalDbContext context)
    {
        _context = context;
    }

    [HttpGet("{bookingId}")]
    public async Task<IActionResult> GetContract(string bookingId)
    {
        long.TryParse(bookingId, out long bId);

        var contract = await _context.HopDongThues
            .FirstOrDefaultAsync(h => h.DonThueId == bId || h.SoHopDong == bookingId);

        if (contract == null)
        {
            // Tìm theo đơn
            var order = await _context.DonThues
                .Include(d => d.Xe).ThenInclude(x => x!.MauXe)
                .Include(d => d.KhachHang)
                .FirstOrDefaultAsync(d => d.DonThueId == bId || d.MaDonThue == bookingId);

            if (order != null)
            {
                var generatedContract = new ContractDto
                {
                    Id = order.DonThueId.ToString(),
                    ContractCode = $"HD{order.DonThueId:D5}",
                    BookingId = order.DonThueId.ToString(),
                    CustomerName = order.KhachHang?.HoTen ?? "Nguyễn Văn Khách",
                    CustomerPhone = order.KhachHang?.SoDienThoai ?? "0901234567",
                    CitizenId = order.KhachHang?.SoCCCD ?? "079201008899",
                    DriverLicenseNo = order.KhachHang?.SoGPLX ?? "B2-12345678",
                    CarName = order.Xe?.MauXe?.TenMauXe ?? "Xe ô tô",
                    LicensePlate = order.Xe?.BienSo ?? "30A-123.45",
                    TotalPrice = order.TongTien,
                    DepositAmount = order.TienDatCocYeuCau,
                    Status = "DA_KY",
                    SignedAt = order.NgayTao ?? DateTime.UtcNow
                };
                return Ok(ApiResponse<ContractDto>.Ok(generatedContract, "Lấy thông tin hợp đồng thành công"));
            }

            return NotFound(ApiResponse<object>.Fail("Không tìm thấy hợp đồng"));
        }

        var dto = new ContractDto
        {
            Id = contract.HopDongId.ToString(),
            ContractCode = contract.SoHopDong,
            BookingId = contract.DonThueId.ToString(),
            CustomerName = contract.HoTenKhachSnapshot ?? "Khách hàng",
            CustomerPhone = contract.SoDienThoaiSnapshot ?? "",
            CitizenId = contract.CCCDSnapshot,
            DriverLicenseNo = contract.GPLXSnapshot,
            CarName = contract.TenXeSnapshot,
            LicensePlate = contract.BienSoSnapshot,
            TotalPrice = contract.TongTien,
            DepositAmount = contract.TienDatCoc,
            Status = contract.TrangThai,
            SignedAt = contract.NgayKy
        };

        return Ok(ApiResponse<ContractDto>.Ok(dto, "Lấy thông tin hợp đồng thành công"));
    }

    [HttpPost("sign")]
    public async Task<IActionResult> SignContract([FromBody] SignContractRequest request)
    {
        long.TryParse(request.BookingId, out long bId);
        var order = await _context.DonThues.FirstOrDefaultAsync(d => d.DonThueId == bId || d.MaDonThue == request.BookingId);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn đặt xe"));
        }

        var contract = await _context.HopDongThues.FirstOrDefaultAsync(h => h.DonThueId == order.DonThueId);
        if (contract == null)
        {
            contract = new HopDongThue
            {
                DonThueId = order.DonThueId,
                SoHopDong = $"HD{order.DonThueId:D5}",
                HoTenKhachSnapshot = request.FullName,
                CCCDSnapshot = request.CitizenId,
                GPLXSnapshot = request.DriverLicenseNo,
                TongTien = order.TongTien,
                TienDatCoc = order.TienDatCocYeuCau,
                TrangThai = "DA_KY",
                NgayKy = DateTime.UtcNow
            };
            _context.HopDongThues.Add(contract);
        }
        else
        {
            contract.TrangThai = "DA_KY";
            contract.NgayKy = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { success = true, contractCode = contract.SoHopDong }, "Ký hợp đồng điện tử thành công"));
    }
}
