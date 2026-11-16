using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.Api.Models;

[Table("VaiTro")]
public class VaiTro
{
    [Key]
    public int VaiTroId { get; set; }
    public string? MaVaiTro { get; set; }
    public string? TenVaiTro { get; set; }
    public string? MoTa { get; set; }
}

[Table("NguoiDung")]
public class NguoiDung
{
    [Key]
    public int NguoiDungId { get; set; }
    public int VaiTroId { get; set; }
    public string? TenDangNhap { get; set; }
    public string? MatKhauMaHoa { get; set; }
    public string? Email { get; set; }
    public string? SoDienThoai { get; set; }
    public string? HoTen { get; set; }
    public string? AnhDaiDien { get; set; }
    public string? TrangThai { get; set; } = "HOAT_DONG";
    public bool DaXoa { get; set; } = false;
    public DateTime? NgayTao { get; set; }

    [ForeignKey("VaiTroId")]
    public virtual VaiTro? VaiTro { get; set; }
}

[Table("KhachHang")]
public class KhachHang
{
    [Key]
    public int KhachHangId { get; set; }
    public int? NguoiDungId { get; set; }
    public string? HoTen { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? SoCCCD { get; set; }
    public string? SoGPLX { get; set; }
    public string? HangGPLX { get; set; }
    public string? TrangThai { get; set; }
    public bool DaXoa { get; set; } = false;
}

[Table("ChiNhanh")]
public class ChiNhanh
{
    [Key]
    public int ChiNhanhId { get; set; }
    public string? MaChiNhanh { get; set; }
    public string? TenChiNhanh { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string? TinhThanh { get; set; }
    public string? QuanHuyen { get; set; }
    public string? PhuongXa { get; set; }
}

[Table("HangXe")]
public class HangXe
{
    [Key]
    public int HangXeId { get; set; }
    public string? MaHangXe { get; set; }
    public string? TenHangXe { get; set; }
    public string? QuocGia { get; set; }
    public string? Logo { get; set; }
    public string? MoTa { get; set; }
    public bool DaXoa { get; set; } = false;
}

[Table("LoaiXe")]
public class LoaiXe
{
    [Key]
    public int LoaiXeId { get; set; }
    public string? MaLoaiXe { get; set; }
    public string? TenLoaiXe { get; set; }
    public string? MoTa { get; set; }
}

[Table("MauXe")]
public class MauXe
{
    [Key]
    public int MauXeId { get; set; }
    public int HangXeId { get; set; }
    public int LoaiXeId { get; set; }
    public string? MaMauXe { get; set; }
    public string? TenMauXe { get; set; }
    public byte SoCho { get; set; } = 5;
    public string? HopSo { get; set; } = "TU_DONG";
    public string? NhienLieu { get; set; } = "XANG";
    [Column(TypeName = "decimal(18,2)")]
    public decimal GiaThueNgayMacDinh { get; set; }
    public string? MoTa { get; set; }
    public bool DaXoa { get; set; } = false;

    [ForeignKey("HangXeId")]
    public virtual HangXe? HangXe { get; set; }

    [ForeignKey("LoaiXeId")]
    public virtual LoaiXe? LoaiXe { get; set; }
}

[Table("Xe")]
public class Xe
{
    [Key]
    public int XeId { get; set; }
    public int MauXeId { get; set; }
    public int ChiNhanhId { get; set; }
    public string? MaXe { get; set; }
    public string? BienSo { get; set; }
    public int SoKmHienTai { get; set; } = 0;
    [Column(TypeName = "decimal(18,2)")]
    public decimal GiaThueNgay { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienDatCocMacDinh { get; set; }
    public string? TrangThai { get; set; } = "HOAT_DONG";
    public string? MoTa { get; set; }
    public bool DaXoa { get; set; } = false;

    [ForeignKey("MauXeId")]
    public virtual MauXe? MauXe { get; set; }

    [ForeignKey("ChiNhanhId")]
    public virtual ChiNhanh? ChiNhanh { get; set; }

    public virtual ICollection<HinhAnhXe> HinhAnhXes { get; set; } = new List<HinhAnhXe>();
}

[Table("HinhAnhXe")]
public class HinhAnhXe
{
    [Key]
    public int HinhAnhXeId { get; set; }
    public int XeId { get; set; }
    public string? DuongDanAnh { get; set; }
    public bool LaAnhChinh { get; set; } = false;
    public int ThuTu { get; set; } = 1;
    public string? MoTa { get; set; }
}

[Table("DichVu")]
public class DichVu
{
    [Key]
    public int DichVuId { get; set; }
    public string? MaDichVu { get; set; }
    public string? TenDichVu { get; set; }
    public string? DonViTinh { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal DonGia { get; set; }
    public string? MoTa { get; set; }
    public string? TrangThai { get; set; } = "HOAT_DONG";
}

[Table("MaGiamGia")]
public class MaGiamGia
{
    [Key]
    public int MaGiamGiaId { get; set; }
    public string? MaCode { get; set; }
    public string? TenMa { get; set; }
    public string? MoTa { get; set; }
    public string? LoaiGiam { get; set; } = "PHAN_TRAM";
    [Column(TypeName = "decimal(18,2)")]
    public decimal GiaTriGiam { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal? GiamToiDa { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal? DonToiThieu { get; set; }
    public string? TrangThai { get; set; } = "HOAT_DONG";
}

[Table("DonThue")]
public class DonThue
{
    [Key]
    public long DonThueId { get; set; }
    public string? MaDonThue { get; set; }
    public int KhachHangId { get; set; }
    public int XeId { get; set; }
    public int? ChiNhanhNhanId { get; set; }
    public int? ChiNhanhTraId { get; set; }
    public DateTime ThoiGianNhan { get; set; }
    public DateTime ThoiGianTraDuKien { get; set; }
    public DateTime? HanGiuDon { get; set; }
    public int SoNgayThue { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal DonGiaNgay { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienThue { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienDichVu { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienGiam { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienPhiPhatSinh { get; set; } = 0;
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienDatCocYeuCau { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TongTien { get; set; }
    public string? TrangThai { get; set; } = "CHO_XAC_NHAN";
    public string? GhiChuKhach { get; set; }
    public string? GhiChuNoiBo { get; set; }
    public DateTime? NgayTao { get; set; } = DateTime.UtcNow;
    public DateTime? NgayCapNhat { get; set; }
    public bool? DaDoiSoatCoc { get; set; } = false;
    public DateTime? ThoiGianDoiSoatCoc { get; set; }
    public int? NguoiDoiSoatCocId { get; set; }

    [ForeignKey("XeId")]
    public virtual Xe? Xe { get; set; }

    [ForeignKey("KhachHangId")]
    public virtual KhachHang? KhachHang { get; set; }

    [ForeignKey("ChiNhanhNhanId")]
    public virtual ChiNhanh? ChiNhanhNhan { get; set; }

    [ForeignKey("ChiNhanhTraId")]
    public virtual ChiNhanh? ChiNhanhTra { get; set; }
}

[Table("HopDongThue")]
public class HopDongThue
{
    [Key]
    public long HopDongId { get; set; }
    public long DonThueId { get; set; }
    public string? SoHopDong { get; set; }
    public string? HoTenKhachSnapshot { get; set; }
    public string? SoDienThoaiSnapshot { get; set; }
    public string? CCCDSnapshot { get; set; }
    public string? GPLXSnapshot { get; set; }
    public string? TenXeSnapshot { get; set; }
    public string? BienSoSnapshot { get; set; }
    public DateTime? ThoiGianNhan { get; set; }
    public DateTime? ThoiGianTra { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TongTien { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TienDatCoc { get; set; }
    public string? TrangThai { get; set; } = "DA_KY";
    public DateTime? NgayKy { get; set; }
    public string? DuongDanPDF { get; set; }
    public DateTime? NgayTao { get; set; }
    public string? DieuKhoan { get; set; }
    public bool? YeuCauChuKyHaiBen { get; set; }
    public bool? KyHaiBenHoanTat { get; set; }

    [ForeignKey("DonThueId")]
    public virtual DonThue? DonThue { get; set; }
}

[Table("BienBanGiaoNhan")]
public class BienBanGiaoNhan
{
    [Key]
    public long BienBanId { get; set; }
    public long DonThueId { get; set; }
    public int XeId { get; set; }
    public int? NhanVienId { get; set; }
    public int? ChiNhanhId { get; set; }
    public string? LoaiBienBan { get; set; } = "CHECK_IN";
    public DateTime ThoiGian { get; set; } = DateTime.UtcNow;
    public int SoKm { get; set; } = 0;
    [Column(TypeName = "decimal(5,2)")]
    public decimal? MucNhienLieu { get; set; } = 100;
    public string? TinhTrangNgoaiThat { get; set; }
    public string? TinhTrangNoiThat { get; set; }
    public string? GhiChu { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.UtcNow;

    [ForeignKey("XeId")]
    public virtual Xe? Xe { get; set; }
}

[Table("ThanhToan")]
public class ThanhToan
{
    [Key]
    public long ThanhToanId { get; set; }
    public long DonThueId { get; set; }
    public int KhachHangId { get; set; }
    public string? MaThanhToan { get; set; }
    public string? LoaiThanhToan { get; set; } = "TIEN_DAT_COC";
    public string? PhuongThuc { get; set; } = "TRUC_TUYEN";
    [Column(TypeName = "decimal(18,2)")]
    public decimal SoTien { get; set; }
    public string? TrangThai { get; set; } = "THANH_CONG";
    public DateTime? ThoiGianThanhToan { get; set; }
    public string? MaGiaoDich { get; set; }
    public string? MaIdempotency { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.UtcNow;
    public bool DaDoiSoatCoc { get; set; } = false;
    public string? GhiChu { get; set; }
}

[Table("BaoTri")]
public class BaoTri
{
    [Key]
    public long BaoTriId { get; set; }
    public int XeId { get; set; }
    public int ChiNhanhId { get; set; }
    public int? NhanVienId { get; set; }
    public string LoaiBaoTri { get; set; } = "BAO_DUONG_DINH_KY";
    public string? MoTa { get; set; }
    public DateTime ThoiGianBatDau { get; set; }
    public DateTime ThoiGianDuKienKetThuc { get; set; }
    public DateTime? ThoiGianKetThucThucTe { get; set; }
    public int? SoKmBaoTri { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal ChiPhi { get; set; }
    public string TrangThai { get; set; } = "HOAN_THANH";
    public string? GhiChu { get; set; }
    public DateTime? NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }

    [ForeignKey("XeId")]
    public virtual Xe? Xe { get; set; }

    [ForeignKey("ChiNhanhId")]
    public virtual ChiNhanh? ChiNhanh { get; set; }
}

[Table("DanhGia")]
public class DanhGia
{
    [Key]
    public long DanhGiaId { get; set; }
    public long DonThueId { get; set; }
    public int KhachHangId { get; set; }
    public int XeId { get; set; }
    public byte SoSao { get; set; } = 5;
    public string? TieuDe { get; set; }
    public string? NoiDung { get; set; }
    public string? PhanHoiNhanVien { get; set; }
    public DateTime? ThoiGianPhanHoi { get; set; }
    public bool HienThi { get; set; } = true;
    public DateTime? NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }

    [ForeignKey("XeId")]
    public virtual Xe? Xe { get; set; }

    [ForeignKey("KhachHangId")]
    public virtual KhachHang? KhachHang { get; set; }

    [ForeignKey("DonThueId")]
    public virtual DonThue? DonThue { get; set; }
}

[Table("LichSuTrangThaiDon")]
public class LichSuTrangThaiDon
{
    [Key]
    public long LichSuId { get; set; }
    public long DonThueId { get; set; }
    public string? TrangThaiCu { get; set; }
    public string TrangThaiMoi { get; set; } = string.Empty;
    public int? NguoiThucHienId { get; set; }
    public string? LyDo { get; set; }
    public DateTime NgayThucHien { get; set; } = DateTime.UtcNow;

    [ForeignKey("DonThueId")]
    public virtual DonThue? DonThue { get; set; }

    [ForeignKey("NguoiThucHienId")]
    public virtual NguoiDung? NguoiThucHien { get; set; }
}

[Table("ThongBao")]
public class ThongBao
{
    [Key]
    public long ThongBaoId { get; set; }
    public int? NguoiDungId { get; set; }
    public string? TieuDe { get; set; }
    public string? NoiDung { get; set; }
    public string? LoaiThongBao { get; set; }
    public string? DoiTuongLienQuan { get; set; }
    public long? IdDoiTuong { get; set; }
    public bool DaDoc { get; set; } = false;
    public DateTime NgayTao { get; set; } = DateTime.UtcNow;
}

[Table("HinhAnhGiaoNhan")]
public class HinhAnhGiaoNhan
{
    [Key]
    public int HinhAnhGiaoNhanId { get; set; }
    public long BienBanId { get; set; }
    public string? LoaiAnh { get; set; }
    public string? DuongDanAnh { get; set; }
    public string? MoTa { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.UtcNow;

    [ForeignKey("BienBanId")]
    public virtual BienBanGiaoNhan? BienBan { get; set; }
}



