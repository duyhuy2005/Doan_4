-- ==============================================================================
-- HE THONG CO SO DU LIEU QUAN LY VA CHO THUE XE O TO TRUC TUYEN (AUTORENTAL)
-- ONLINE CAR RENTAL MANAGEMENT SYSTEM - COMPLETE COMPREHENSIVE DATABASE SCRIPT
-- RDBMS: Microsoft SQL Server 2019+ | Database: QuanLyChoThueOto
-- Chuẩn hóa: 3NF (Third Normal Form) | Ho tro quy trinh 11 buoc & 14 phan he Admin
-- Unicode: Ho tro Tieng Viet chuan UTF-8 (N'...'), khong loi font, khong mojibake
-- ==============================================================================

USE [master];
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyChoThueOto')
BEGIN
    CREATE DATABASE [QuanLyChoThueOto] COLLATE SQL_Latin1_General_CP1_CI_AS;
    PRINT N'>>> Da khoi tao co so du lieu QuanLyChoThueOto thanh cong.';
END
GO

USE [QuanLyChoThueOto];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

-- ------------------------------------------------------------------------------
-- 0. XOA BANG CU THEO THU TU RANG BUOC NGUOC LAI (NEU DA TON TAI)
-- ------------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[NhatKyHeThong]', N'U') IS NOT NULL DROP TABLE [dbo].[NhatKyHeThong];
IF OBJECT_ID(N'[dbo].[ThongBao]', N'U') IS NOT NULL DROP TABLE [dbo].[ThongBao];
IF OBJECT_ID(N'[dbo].[LichSuTrangThaiDon]', N'U') IS NOT NULL DROP TABLE [dbo].[LichSuTrangThaiDon];
IF OBJECT_ID(N'[dbo].[DanhGia]', N'U') IS NOT NULL DROP TABLE [dbo].[DanhGia];
IF OBJECT_ID(N'[dbo].[BaoTri]', N'U') IS NOT NULL DROP TABLE [dbo].[BaoTri];
IF OBJECT_ID(N'[dbo].[ThanhToan]', N'U') IS NOT NULL DROP TABLE [dbo].[ThanhToan];
IF OBJECT_ID(N'[dbo].[PhiPhatSinh]', N'U') IS NOT NULL DROP TABLE [dbo].[PhiPhatSinh];
IF OBJECT_ID(N'[dbo].[HuHongXe]', N'U') IS NOT NULL DROP TABLE [dbo].[HuHongXe];
IF OBJECT_ID(N'[dbo].[HinhAnhGiaoNhan]', N'U') IS NOT NULL DROP TABLE [dbo].[HinhAnhGiaoNhan];
IF OBJECT_ID(N'[dbo].[BienBanGiaoNhan]', N'U') IS NOT NULL DROP TABLE [dbo].[BienBanGiaoNhan];
IF OBJECT_ID(N'[dbo].[HopDongChuKy]', N'U') IS NOT NULL DROP TABLE [dbo].[HopDongChuKy];
IF OBJECT_ID(N'[dbo].[HopDongPhienBan]', N'U') IS NOT NULL DROP TABLE [dbo].[HopDongPhienBan];
IF OBJECT_ID(N'[dbo].[HopDongThue]', N'U') IS NOT NULL DROP TABLE [dbo].[HopDongThue];
IF OBJECT_ID(N'[dbo].[SuDungMaGiamGia]', N'U') IS NOT NULL DROP TABLE [dbo].[SuDungMaGiamGia];
IF OBJECT_ID(N'[dbo].[DichVuDonThue]', N'U') IS NOT NULL DROP TABLE [dbo].[DichVuDonThue];
IF OBJECT_ID(N'[dbo].[DonThue]', N'U') IS NOT NULL DROP TABLE [dbo].[DonThue];
IF OBJECT_ID(N'[dbo].[GiayToXe]', N'U') IS NOT NULL DROP TABLE [dbo].[GiayToXe];
IF OBJECT_ID(N'[dbo].[HinhAnhXe]', N'U') IS NOT NULL DROP TABLE [dbo].[HinhAnhXe];
IF OBJECT_ID(N'[dbo].[Xe]', N'U') IS NOT NULL DROP TABLE [dbo].[Xe];
IF OBJECT_ID(N'[dbo].[NhanVien]', N'U') IS NOT NULL DROP TABLE [dbo].[NhanVien];
IF OBJECT_ID(N'[dbo].[KhachHang]', N'U') IS NOT NULL DROP TABLE [dbo].[KhachHang];
IF OBJECT_ID(N'[dbo].[MauXe]', N'U') IS NOT NULL DROP TABLE [dbo].[MauXe];
IF OBJECT_ID(N'[dbo].[NguoiDung]', N'U') IS NOT NULL DROP TABLE [dbo].[NguoiDung];
IF OBJECT_ID(N'[dbo].[MaGiamGia]', N'U') IS NOT NULL DROP TABLE [dbo].[MaGiamGia];
IF OBJECT_ID(N'[dbo].[DichVu]', N'U') IS NOT NULL DROP TABLE [dbo].[DichVu];
IF OBJECT_ID(N'[dbo].[LoaiXe]', N'U') IS NOT NULL DROP TABLE [dbo].[LoaiXe];
IF OBJECT_ID(N'[dbo].[HangXe]', N'U') IS NOT NULL DROP TABLE [dbo].[HangXe];
IF OBJECT_ID(N'[dbo].[ChiNhanh]', N'U') IS NOT NULL DROP TABLE [dbo].[ChiNhanh];
IF OBJECT_ID(N'[dbo].[VaiTro]', N'U') IS NOT NULL DROP TABLE [dbo].[VaiTro];
GO

-- ------------------------------------------------------------------------------
-- 1. TAO CAU TRUC CAC BANG DU LIEU (29 BANG QUAN HE)
-- ------------------------------------------------------------------------------
-- --------------------------------------------------
-- BANG: [dbo].[VaiTro]
-- --------------------------------------------------
CREATE TABLE [dbo].[VaiTro] (
[VaiTroId] int IDENTITY(1,1) NOT NULL,
[MaVaiTro] varchar(30) NOT NULL,
[TenVaiTro] nvarchar(100) NOT NULL,
[MoTa] nvarchar(500) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_VaiTro] PRIMARY KEY CLUSTERED ([VaiTroId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[ChiNhanh]
-- --------------------------------------------------
CREATE TABLE [dbo].[ChiNhanh] (
[ChiNhanhId] int IDENTITY(1,1) NOT NULL,
[MaChiNhanh] varchar(30) NOT NULL,
[TenChiNhanh] nvarchar(200) NOT NULL,
[SoDienThoai] varchar(20) NULL,
[Email] varchar(150) NULL,
[DiaChi] nvarchar(300) NOT NULL,
[TinhThanh] nvarchar(100) NULL,
[QuanHuyen] nvarchar(100) NULL,
[PhuongXa] nvarchar(100) NULL,
[GioMoCua] time NULL,
[GioDongCua] time NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_ChiNhanh] PRIMARY KEY CLUSTERED ([ChiNhanhId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HangXe]
-- --------------------------------------------------
CREATE TABLE [dbo].[HangXe] (
[HangXeId] int IDENTITY(1,1) NOT NULL,
[MaHangXe] varchar(30) NOT NULL,
[TenHangXe] nvarchar(100) NOT NULL,
[QuocGia] nvarchar(100) NULL,
[Logo] varchar(500) NULL,
[MoTa] nvarchar(500) NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_HangXe] PRIMARY KEY CLUSTERED ([HangXeId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[LoaiXe]
-- --------------------------------------------------
CREATE TABLE [dbo].[LoaiXe] (
[LoaiXeId] int IDENTITY(1,1) NOT NULL,
[MaLoaiXe] varchar(30) NOT NULL,
[TenLoaiXe] nvarchar(100) NOT NULL,
[MoTa] nvarchar(500) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_LoaiXe] PRIMARY KEY CLUSTERED ([LoaiXeId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[DichVu]
-- --------------------------------------------------
CREATE TABLE [dbo].[DichVu] (
[DichVuId] int IDENTITY(1,1) NOT NULL,
[MaDichVu] varchar(30) NOT NULL,
[TenDichVu] nvarchar(150) NOT NULL,
[DonViTinh] nvarchar(30) NOT NULL,
[DonGia] decimal(18, 0) NOT NULL,
[MoTa] nvarchar(500) NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_DichVu] PRIMARY KEY CLUSTERED ([DichVuId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[MaGiamGia]
-- --------------------------------------------------
CREATE TABLE [dbo].[MaGiamGia] (
[MaGiamGiaId] int IDENTITY(1,1) NOT NULL,
[MaCode] varchar(50) NOT NULL,
[TenMa] nvarchar(150) NOT NULL,
[MoTa] nvarchar(500) NULL,
[LoaiGiam] varchar(20) NOT NULL,
[GiaTriGiam] decimal(18, 0) NOT NULL,
[GiamToiDa] decimal(18, 0) NULL,
[DonToiThieu] decimal(18, 0) NOT NULL DEFAULT ((0)),
[SoLuotSuDung] int NULL,
[SoLuotDaDung] int NOT NULL DEFAULT ((0)),
[SoLanToiDaMoiKhach] int NOT NULL DEFAULT ((1)),
[ThoiGianBatDau] datetime2 NOT NULL,
[ThoiGianKetThuc] datetime2 NOT NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_MaGiamGia] PRIMARY KEY CLUSTERED ([MaGiamGiaId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[NguoiDung]
-- --------------------------------------------------
CREATE TABLE [dbo].[NguoiDung] (
[NguoiDungId] int IDENTITY(1,1) NOT NULL,
[VaiTroId] int NOT NULL,
[TenDangNhap] varchar(100) NOT NULL,
[MatKhauMaHoa] varchar(500) NOT NULL,
[Email] varchar(150) NOT NULL,
[SoDienThoai] varchar(20) NULL,
[HoTen] nvarchar(150) NOT NULL,
[AnhDaiDien] varchar(500) NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[LanDangNhapCuoi] datetime2 NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
[DaXoa] bit NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK_NguoiDung] PRIMARY KEY CLUSTERED ([NguoiDungId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[MauXe]
-- --------------------------------------------------
CREATE TABLE [dbo].[MauXe] (
[MauXeId] int IDENTITY(1,1) NOT NULL,
[HangXeId] int NOT NULL,
[LoaiXeId] int NOT NULL,
[MaMauXe] varchar(30) NOT NULL,
[TenMauXe] nvarchar(150) NOT NULL,
[SoCho] tinyint NOT NULL,
[HopSo] varchar(30) NOT NULL,
[NhienLieu] varchar(30) NOT NULL,
[GiaThueNgayMacDinh] decimal(18, 0) NOT NULL,
[MoTa] nvarchar(1000) NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_MauXe] PRIMARY KEY CLUSTERED ([MauXeId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[KhachHang]
-- --------------------------------------------------
CREATE TABLE [dbo].[KhachHang] (
[KhachHangId] int IDENTITY(1,1) NOT NULL,
[NguoiDungId] int NULL,
[MaKhachHang] varchar(30) NOT NULL,
[HoTen] nvarchar(150) NOT NULL,
[SoDienThoai] varchar(20) NOT NULL,
[Email] varchar(150) NULL,
[NgaySinh] date NULL,
[GioiTinh] varchar(20) NULL,
[SoCCCD] varchar(20) NULL,
[SoGPLX] varchar(30) NULL,
[HangGPLX] varchar(20) NULL,
[NgayHetHanGPLX] date NULL,
[DiaChi] nvarchar(300) NULL,
[TinhThanh] nvarchar(100) NULL,
[QuanHuyen] nvarchar(100) NULL,
[PhuongXa] nvarchar(100) NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
[AnhCCCD] varchar(2000) NULL,
[AnhGPLX] varchar(2000) NULL,
    CONSTRAINT [PK_KhachHang] PRIMARY KEY CLUSTERED ([KhachHangId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[NhanVien]
-- --------------------------------------------------
CREATE TABLE [dbo].[NhanVien] (
[NhanVienId] int IDENTITY(1,1) NOT NULL,
[NguoiDungId] int NOT NULL,
[ChiNhanhId] int NOT NULL,
[MaNhanVien] varchar(30) NOT NULL,
[HoTen] nvarchar(150) NOT NULL,
[SoDienThoai] varchar(20) NOT NULL,
[Email] varchar(150) NULL,
[SoCCCD] varchar(20) NULL,
[NgaySinh] date NULL,
[DiaChi] nvarchar(300) NULL,
[ChucVu] nvarchar(100) NULL,
[NgayVaoLam] date NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_NhanVien] PRIMARY KEY CLUSTERED ([NhanVienId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[Xe]
-- --------------------------------------------------
CREATE TABLE [dbo].[Xe] (
[XeId] int IDENTITY(1,1) NOT NULL,
[MauXeId] int NOT NULL,
[ChiNhanhId] int NOT NULL,
[MaXe] varchar(30) NOT NULL,
[BienSo] varchar(20) NOT NULL,
[SoKhung] varchar(50) NULL,
[MauSac] nvarchar(50) NULL,
[NamSanXuat] smallint NULL,
[NgayDangKy] date NULL,
[SoKmHienTai] int NOT NULL DEFAULT ((0)),
[GiaThueNgay] decimal(18, 0) NOT NULL,
[TienDatCocMacDinh] decimal(18, 0) NOT NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('HOAT_DONG'),
[MoTa] nvarchar(1000) NULL,
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_Xe] PRIMARY KEY CLUSTERED ([XeId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HinhAnhXe]
-- --------------------------------------------------
CREATE TABLE [dbo].[HinhAnhXe] (
[HinhAnhXeId] int IDENTITY(1,1) NOT NULL,
[XeId] int NOT NULL,
[DuongDanAnh] varchar(1000) NOT NULL,
[LaAnhChinh] bit NOT NULL DEFAULT ((0)),
[ThuTu] int NOT NULL DEFAULT ((1)),
[MoTa] nvarchar(300) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_HinhAnhXe] PRIMARY KEY CLUSTERED ([HinhAnhXeId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[GiayToXe]
-- --------------------------------------------------
CREATE TABLE [dbo].[GiayToXe] (
[GiayToXeId] int IDENTITY(1,1) NOT NULL,
[XeId] int NOT NULL,
[LoaiGiayTo] varchar(30) NOT NULL,
[SoGiayTo] varchar(100) NULL,
[NgayCap] date NULL,
[NgayHetHan] date NULL,
[DuongDanTep] varchar(1000) NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('CON_HIEU_LUC'),
[GhiChu] nvarchar(500) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_GiayToXe] PRIMARY KEY CLUSTERED ([GiayToXeId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[DonThue]
-- --------------------------------------------------
CREATE TABLE [dbo].[DonThue] (
[DonThueId] bigint IDENTITY(1,1) NOT NULL,
[MaDonThue] varchar(40) NOT NULL,
[KhachHangId] int NOT NULL,
[XeId] int NOT NULL,
[ChiNhanhNhanId] int NOT NULL,
[ChiNhanhTraId] int NOT NULL,
[NguoiTaoId] int NULL,
[KenhDat] varchar(20) NOT NULL,
[ThoiGianNhan] datetime2 NOT NULL,
[ThoiGianTraDuKien] datetime2 NOT NULL,
[HanGiuDon] datetime2 NULL,
[DonGiaNgay] decimal(18, 0) NOT NULL,
[SoNgayThue] int NOT NULL,
[TienThue] decimal(18, 0) NOT NULL,
[TienDichVu] decimal(18, 0) NOT NULL DEFAULT ((0)),
[TienGiam] decimal(18, 0) NOT NULL DEFAULT ((0)),
[TienPhiPhatSinh] decimal(18, 0) NOT NULL DEFAULT ((0)),
[TienDatCocYeuCau] decimal(18, 0) NOT NULL DEFAULT ((0)),
[TongTien] decimal(18, 0) NOT NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('CHO_XAC_NHAN'),
[GhiChuKhach] nvarchar(1000) NULL,
[GhiChuNoiBo] nvarchar(1000) NULL,
[DaXoa] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
[DaDoiSoatCoc] bit NOT NULL DEFAULT ((0)),
[NguoiDoiSoatCocId] int NULL,
[ThoiGianDoiSoatCoc] datetime2 NULL,
[NguonDuLieu] varchar(20) NOT NULL DEFAULT ('CHUA_XAC_MINH'),
    CONSTRAINT [PK_DonThue] PRIMARY KEY CLUSTERED ([DonThueId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[DichVuDonThue]
-- --------------------------------------------------
CREATE TABLE [dbo].[DichVuDonThue] (
[DichVuDonThueId] bigint IDENTITY(1,1) NOT NULL,
[DonThueId] bigint NOT NULL,
[DichVuId] int NOT NULL,
[SoLuong] int NOT NULL,
[DonGia] decimal(18, 0) NOT NULL,
[ThanhTien] decimal(18, 0) NOT NULL,
    CONSTRAINT [PK_DichVuDonThue] PRIMARY KEY CLUSTERED ([DichVuDonThueId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[SuDungMaGiamGia]
-- --------------------------------------------------
CREATE TABLE [dbo].[SuDungMaGiamGia] (
[SuDungMaId] bigint IDENTITY(1,1) NOT NULL,
[MaGiamGiaId] int NOT NULL,
[KhachHangId] int NOT NULL,
[DonThueId] bigint NOT NULL,
[SoTienGiam] decimal(18, 0) NOT NULL,
[ThoiGianSuDung] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_SuDungMaGiamGia] PRIMARY KEY CLUSTERED ([SuDungMaId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HopDongThue]
-- --------------------------------------------------
CREATE TABLE [dbo].[HopDongThue] (
[HopDongId] bigint IDENTITY(1,1) NOT NULL,
[DonThueId] bigint NOT NULL,
[SoHopDong] varchar(50) NOT NULL,
[HoTenKhachSnapshot] nvarchar(150) NOT NULL,
[SoDienThoaiSnapshot] varchar(20) NOT NULL,
[CCCDSnapshot] varchar(20) NULL,
[GPLXSnapshot] varchar(30) NULL,
[TenXeSnapshot] nvarchar(200) NOT NULL,
[BienSoSnapshot] varchar(20) NOT NULL,
[ThoiGianNhan] datetime2 NOT NULL,
[ThoiGianTra] datetime2 NOT NULL,
[TongTien] decimal(18, 0) NOT NULL,
[TienDatCoc] decimal(18, 0) NOT NULL,
[DuongDanPDF] varchar(1000) NULL,
[NgayKy] datetime2 NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('NHAP'),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[DieuKhoan] nvarchar(MAX) NULL,
[YeuCauChuKyHaiBen] bit NOT NULL DEFAULT ((0)),
[KyHaiBenHoanTat] bit NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK_HopDongThue] PRIMARY KEY CLUSTERED ([HopDongId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HopDongPhienBan]
-- --------------------------------------------------
CREATE TABLE [dbo].[HopDongPhienBan] (
[PhienBanId] bigint IDENTITY(1,1) NOT NULL,
[HopDongId] bigint NOT NULL,
[PhienBan] int NOT NULL,
[NoiDung] nvarchar(MAX) NOT NULL,
[MaNoiDung] varchar(64) NOT NULL,
[NguoiDaiDienId] int NOT NULL,
[NguoiTaoId] int NOT NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[LyDo] nvarchar(1000) NOT NULL,
    CONSTRAINT [PK__HopDongP__C5F8C917417CD0E1] PRIMARY KEY CLUSTERED ([PhienBanId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HopDongChuKy]
-- --------------------------------------------------
CREATE TABLE [dbo].[HopDongChuKy] (
[ChuKyId] bigint IDENTITY(1,1) NOT NULL,
[PhienBanId] bigint NOT NULL,
[Ben] varchar(10) NOT NULL,
[NguoiKyId] int NOT NULL,
[HoTenNguoiKy] nvarchar(150) NOT NULL,
[MaVaiTro] varchar(30) NOT NULL,
[NetKy] nvarchar(MAX) NOT NULL,
[MaNoiDung] varchar(64) NOT NULL,
[ThoiGianKy] datetime2 NOT NULL DEFAULT (sysdatetime()),
[DiaChiIP] varchar(100) NULL,
    CONSTRAINT [PK__HopDongC__9DA2E3E0BCA4C7B5] PRIMARY KEY CLUSTERED ([ChuKyId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[BienBanGiaoNhan]
-- --------------------------------------------------
CREATE TABLE [dbo].[BienBanGiaoNhan] (
[BienBanId] bigint IDENTITY(1,1) NOT NULL,
[DonThueId] bigint NOT NULL,
[XeId] int NOT NULL,
[NhanVienId] int NULL,
[ChiNhanhId] int NOT NULL,
[LoaiBienBan] varchar(20) NOT NULL,
[ThoiGian] datetime2 NOT NULL,
[SoKm] int NOT NULL,
[MucNhienLieu] decimal(5, 2) NULL,
[TinhTrangNgoaiThat] nvarchar(2000) NULL,
[TinhTrangNoiThat] nvarchar(2000) NULL,
[GhiChu] nvarchar(1000) NULL,
[ChuKyKhach] varchar(1000) NULL,
[ChuKyNhanVien] varchar(1000) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_BienBanGiaoNhan] PRIMARY KEY CLUSTERED ([BienBanId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HinhAnhGiaoNhan]
-- --------------------------------------------------
CREATE TABLE [dbo].[HinhAnhGiaoNhan] (
[HinhAnhGiaoNhanId] int IDENTITY(1,1) NOT NULL,
[BienBanId] bigint NOT NULL,
[LoaiAnh] varchar(20) NOT NULL,
[DuongDanAnh] varchar(1000) NOT NULL,
[MoTa] nvarchar(500) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_HinhAnhGiaoNhan] PRIMARY KEY CLUSTERED ([HinhAnhGiaoNhanId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[HuHongXe]
-- --------------------------------------------------
CREATE TABLE [dbo].[HuHongXe] (
[HuHongId] bigint IDENTITY(1,1) NOT NULL,
[BienBanId] bigint NOT NULL,
[XeId] int NOT NULL,
[LoaiHuHong] varchar(30) NOT NULL,
[ViTri] nvarchar(200) NULL,
[MoTa] nvarchar(1000) NOT NULL,
[ChiPhiDuKien] decimal(18, 0) NOT NULL DEFAULT ((0)),
[KhachChiuPhi] decimal(18, 0) NOT NULL DEFAULT ((0)),
[TrangThai] varchar(30) NOT NULL DEFAULT ('CHO_XU_LY'),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_HuHongXe] PRIMARY KEY CLUSTERED ([HuHongId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[PhiPhatSinh]
-- --------------------------------------------------
CREATE TABLE [dbo].[PhiPhatSinh] (
[PhiPhatSinhId] bigint IDENTITY(1,1) NOT NULL,
[DonThueId] bigint NOT NULL,
[NguoiTaoId] int NULL,
[LoaiPhi] varchar(30) NOT NULL,
[MoTa] nvarchar(500) NOT NULL,
[SoTien] decimal(18, 0) NOT NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('CHO_THANH_TOAN'),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[HuHongId] bigint NULL,
    CONSTRAINT [PK_PhiPhatSinh] PRIMARY KEY CLUSTERED ([PhiPhatSinhId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[ThanhToan]
-- --------------------------------------------------
CREATE TABLE [dbo].[ThanhToan] (
[ThanhToanId] bigint IDENTITY(1,1) NOT NULL,
[MaThanhToan] varchar(50) NOT NULL,
[DonThueId] bigint NOT NULL,
[KhachHangId] int NOT NULL,
[LoaiThanhToan] varchar(30) NOT NULL,
[PhuongThuc] varchar(20) NOT NULL,
[SoTien] decimal(18, 0) NOT NULL,
[CongThanhToan] varchar(50) NULL,
[MaGiaoDich] varchar(150) NULL,
[MaIdempotency] varchar(150) NULL,
[ThanhToanLienQuanId] bigint NULL,
[TrangThai] varchar(30) NOT NULL DEFAULT ('CHO_THANH_TOAN'),
[ThoiGianThanhToan] datetime2 NULL,
[GhiChu] nvarchar(1000) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[BienBanId] bigint NULL,
[HuHongId] bigint NULL,
[PhiPhatSinhId] bigint NULL,
[DaDoiSoatCoc] bit NOT NULL DEFAULT ((0)),
[NguoiDoiSoatId] int NULL,
[ThoiGianDoiSoat] datetime2 NULL,
    CONSTRAINT [PK_ThanhToan] PRIMARY KEY CLUSTERED ([ThanhToanId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[BaoTri]
-- --------------------------------------------------
CREATE TABLE [dbo].[BaoTri] (
[BaoTriId] bigint IDENTITY(1,1) NOT NULL,
[XeId] int NOT NULL,
[ChiNhanhId] int NOT NULL,
[NhanVienId] int NULL,
[LoaiBaoTri] varchar(50) NOT NULL,
[MoTa] nvarchar(1000) NULL,
[ThoiGianBatDau] datetime2 NOT NULL,
[ThoiGianDuKienKetThuc] datetime2 NOT NULL,
[ThoiGianKetThucThucTe] datetime2 NULL,
[SoKmBaoTri] int NULL,
[ChiPhi] decimal(18, 0) NOT NULL DEFAULT ((0)),
[TrangThai] varchar(30) NOT NULL DEFAULT ('DA_LEN_KE_HOACH'),
[GhiChu] nvarchar(1000) NULL,
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_BaoTri] PRIMARY KEY CLUSTERED ([BaoTriId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[DanhGia]
-- --------------------------------------------------
CREATE TABLE [dbo].[DanhGia] (
[DanhGiaId] bigint IDENTITY(1,1) NOT NULL,
[DonThueId] bigint NOT NULL,
[KhachHangId] int NOT NULL,
[XeId] int NOT NULL,
[SoSao] tinyint NOT NULL,
[TieuDe] nvarchar(200) NULL,
[NoiDung] nvarchar(2000) NULL,
[PhanHoiNhanVien] nvarchar(2000) NULL,
[ThoiGianPhanHoi] datetime2 NULL,
[HienThi] bit NOT NULL DEFAULT ((1)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
[NgayCapNhat] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_DanhGia] PRIMARY KEY CLUSTERED ([DanhGiaId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[LichSuTrangThaiDon]
-- --------------------------------------------------
CREATE TABLE [dbo].[LichSuTrangThaiDon] (
[LichSuId] bigint IDENTITY(1,1) NOT NULL,
[DonThueId] bigint NOT NULL,
[TrangThaiCu] varchar(30) NULL,
[TrangThaiMoi] varchar(30) NOT NULL,
[NguoiThucHienId] int NULL,
[LyDo] nvarchar(1000) NULL,
[NgayThucHien] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_LichSuTrangThaiDon] PRIMARY KEY CLUSTERED ([LichSuId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[ThongBao]
-- --------------------------------------------------
CREATE TABLE [dbo].[ThongBao] (
[ThongBaoId] bigint IDENTITY(1,1) NOT NULL,
[NguoiDungId] int NOT NULL,
[TieuDe] nvarchar(200) NOT NULL,
[NoiDung] nvarchar(2000) NOT NULL,
[LoaiThongBao] varchar(50) NULL,
[DoiTuongLienQuan] varchar(50) NULL,
[IdDoiTuong] bigint NULL,
[DaDoc] bit NOT NULL DEFAULT ((0)),
[NgayTao] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_ThongBao] PRIMARY KEY CLUSTERED ([ThongBaoId])
);
GO

-- --------------------------------------------------
-- BANG: [dbo].[NhatKyHeThong]
-- --------------------------------------------------
CREATE TABLE [dbo].[NhatKyHeThong] (
[NhatKyId] bigint IDENTITY(1,1) NOT NULL,
[NguoiDungId] int NULL,
[HanhDong] varchar(50) NOT NULL,
[TenBang] varchar(128) NULL,
[IdBanGhi] bigint NULL,
[DuLieuCu] nvarchar(MAX) NULL,
[DuLieuMoi] nvarchar(MAX) NULL,
[DiaChiIP] varchar(50) NULL,
[ThoiGian] datetime2 NOT NULL DEFAULT (sysdatetime()),
    CONSTRAINT [PK_NhatKyHeThong] PRIMARY KEY CLUSTERED ([NhatKyId])
);
GO

-- ------------------------------------------------------------------------------
-- 2. TAO RANG BUOC DUY NHAT (UNIQUE CONSTRAINTS / INDEXES)
-- ------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_NhanVien_NguoiDung' AND object_id = OBJECT_ID('[dbo].[NhanVien]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_NhanVien_NguoiDung] ON [dbo].[NhanVien] ([NguoiDungId]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_ThanhToan_Idempotency' AND object_id = OBJECT_ID('[dbo].[ThanhToan]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_ThanhToan_Idempotency] ON [dbo].[ThanhToan] ([MaIdempotency]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_HopDong_So' AND object_id = OBJECT_ID('[dbo].[HopDongThue]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_HopDong_So] ON [dbo].[HopDongThue] ([SoHopDong]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_DanhGia_DonThue' AND object_id = OBJECT_ID('[dbo].[DanhGia]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_DanhGia_DonThue] ON [dbo].[DanhGia] ([DonThueId]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Xe_SoKhung' AND object_id = OBJECT_ID('[dbo].[Xe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_Xe_SoKhung] ON [dbo].[Xe] ([SoKhung]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_GiayToXe_Xe_Loai' AND object_id = OBJECT_ID('[dbo].[GiayToXe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_GiayToXe_Xe_Loai] ON [dbo].[GiayToXe] ([XeId], [LoaiGiayTo]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_NhanVien_Ma' AND object_id = OBJECT_ID('[dbo].[NhanVien]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_NhanVien_Ma] ON [dbo].[NhanVien] ([MaNhanVien]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_ThanhToan_Ma' AND object_id = OBJECT_ID('[dbo].[ThanhToan]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_ThanhToan_Ma] ON [dbo].[ThanhToan] ([MaThanhToan]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_KhachHang_Ma' AND object_id = OBJECT_ID('[dbo].[KhachHang]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_KhachHang_Ma] ON [dbo].[KhachHang] ([MaKhachHang]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_DichVu_Ma' AND object_id = OBJECT_ID('[dbo].[DichVu]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_DichVu_Ma] ON [dbo].[DichVu] ([MaDichVu]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_HopDongChuKy' AND object_id = OBJECT_ID('[dbo].[HopDongChuKy]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_HopDongChuKy] ON [dbo].[HopDongChuKy] ([PhienBanId], [Ben]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_HopDongPhienBan' AND object_id = OBJECT_ID('[dbo].[HopDongPhienBan]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_HopDongPhienBan] ON [dbo].[HopDongPhienBan] ([HopDongId], [PhienBan]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_MauXe_Ma' AND object_id = OBJECT_ID('[dbo].[MauXe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_MauXe_Ma] ON [dbo].[MauXe] ([MaMauXe]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_HangXe_Ma' AND object_id = OBJECT_ID('[dbo].[HangXe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_HangXe_Ma] ON [dbo].[HangXe] ([MaHangXe]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_MaGiamGia_Code' AND object_id = OBJECT_ID('[dbo].[MaGiamGia]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_MaGiamGia_Code] ON [dbo].[MaGiamGia] ([MaCode]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_NguoiDung_Email' AND object_id = OBJECT_ID('[dbo].[NguoiDung]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_NguoiDung_Email] ON [dbo].[NguoiDung] ([Email]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_HopDong_DonThue' AND object_id = OBJECT_ID('[dbo].[HopDongThue]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_HopDong_DonThue] ON [dbo].[HopDongThue] ([DonThueId]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_ChiNhanh_Ma' AND object_id = OBJECT_ID('[dbo].[ChiNhanh]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_ChiNhanh_Ma] ON [dbo].[ChiNhanh] ([MaChiNhanh]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Xe_Ma' AND object_id = OBJECT_ID('[dbo].[Xe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_Xe_Ma] ON [dbo].[Xe] ([MaXe]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_SuDungMa_Don' AND object_id = OBJECT_ID('[dbo].[SuDungMaGiamGia]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_SuDungMa_Don] ON [dbo].[SuDungMaGiamGia] ([DonThueId]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_DonThue_Ma' AND object_id = OBJECT_ID('[dbo].[DonThue]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_DonThue_Ma] ON [dbo].[DonThue] ([MaDonThue]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_VaiTro_MaVaiTro' AND object_id = OBJECT_ID('[dbo].[VaiTro]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_VaiTro_MaVaiTro] ON [dbo].[VaiTro] ([MaVaiTro]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_LoaiXe_Ma' AND object_id = OBJECT_ID('[dbo].[LoaiXe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_LoaiXe_Ma] ON [dbo].[LoaiXe] ([MaLoaiXe]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_NguoiDung_TenDangNhap' AND object_id = OBJECT_ID('[dbo].[NguoiDung]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_NguoiDung_TenDangNhap] ON [dbo].[NguoiDung] ([TenDangNhap]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Xe_BienSo' AND object_id = OBJECT_ID('[dbo].[Xe]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_Xe_BienSo] ON [dbo].[Xe] ([BienSo]);
END
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_KhachHang_NguoiDung_NotNull' AND object_id = OBJECT_ID('[dbo].[KhachHang]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_KhachHang_NguoiDung_NotNull] ON [dbo].[KhachHang] ([NguoiDungId]);
END
GO

-- ------------------------------------------------------------------------------
-- 3. TAO RANG BUOC KHOA NGOAI (FOREIGN KEY CONSTRAINTS)
-- ------------------------------------------------------------------------------
ALTER TABLE [dbo].[MauXe] WITH CHECK ADD CONSTRAINT [FK_MauXe_HangXe] FOREIGN KEY ([HangXeId]) REFERENCES [dbo].[HangXe] ([HangXeId]);
ALTER TABLE [dbo].[MauXe] CHECK CONSTRAINT [FK_MauXe_HangXe];
GO
ALTER TABLE [dbo].[PhiPhatSinh] WITH CHECK ADD CONSTRAINT [FK_Phi_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[PhiPhatSinh] CHECK CONSTRAINT [FK_Phi_DonThue];
GO
ALTER TABLE [dbo].[BaoTri] WITH CHECK ADD CONSTRAINT [FK_BaoTri_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]);
ALTER TABLE [dbo].[BaoTri] CHECK CONSTRAINT [FK_BaoTri_Xe];
GO
ALTER TABLE [dbo].[HinhAnhXe] WITH CHECK ADD CONSTRAINT [FK_HinhAnhXe_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[HinhAnhXe] CHECK CONSTRAINT [FK_HinhAnhXe_Xe];
GO
ALTER TABLE [dbo].[DanhGia] WITH CHECK ADD CONSTRAINT [FK_DanhGia_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]);
ALTER TABLE [dbo].[DanhGia] CHECK CONSTRAINT [FK_DanhGia_DonThue];
GO
ALTER TABLE [dbo].[DonThue] WITH CHECK ADD CONSTRAINT [FK_DonThue_KhachHang] FOREIGN KEY ([KhachHangId]) REFERENCES [dbo].[KhachHang] ([KhachHangId]);
ALTER TABLE [dbo].[DonThue] CHECK CONSTRAINT [FK_DonThue_KhachHang];
GO
ALTER TABLE [dbo].[PhiPhatSinh] WITH CHECK ADD CONSTRAINT [FK_Phi_HuHong] FOREIGN KEY ([HuHongId]) REFERENCES [dbo].[HuHongXe] ([HuHongId]);
ALTER TABLE [dbo].[PhiPhatSinh] CHECK CONSTRAINT [FK_Phi_HuHong];
GO
ALTER TABLE [dbo].[HopDongPhienBan] WITH CHECK ADD CONSTRAINT [FK__HopDongPh__Nguoi__12C8C788] FOREIGN KEY ([NguoiTaoId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]);
ALTER TABLE [dbo].[HopDongPhienBan] CHECK CONSTRAINT [FK__HopDongPh__Nguoi__12C8C788];
GO
ALTER TABLE [dbo].[LichSuTrangThaiDon] WITH CHECK ADD CONSTRAINT [FK_LichSu_NguoiThucHien] FOREIGN KEY ([NguoiThucHienId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[LichSuTrangThaiDon] CHECK CONSTRAINT [FK_LichSu_NguoiThucHien];
GO
ALTER TABLE [dbo].[LichSuTrangThaiDon] WITH CHECK ADD CONSTRAINT [FK_LichSu_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[LichSuTrangThaiDon] CHECK CONSTRAINT [FK_LichSu_DonThue];
GO
ALTER TABLE [dbo].[BaoTri] WITH CHECK ADD CONSTRAINT [FK_BaoTri_ChiNhanh] FOREIGN KEY ([ChiNhanhId]) REFERENCES [dbo].[ChiNhanh] ([ChiNhanhId]);
ALTER TABLE [dbo].[BaoTri] CHECK CONSTRAINT [FK_BaoTri_ChiNhanh];
GO
ALTER TABLE [dbo].[SuDungMaGiamGia] WITH CHECK ADD CONSTRAINT [FK_SDMGG_Khach] FOREIGN KEY ([KhachHangId]) REFERENCES [dbo].[KhachHang] ([KhachHangId]);
ALTER TABLE [dbo].[SuDungMaGiamGia] CHECK CONSTRAINT [FK_SDMGG_Khach];
GO
ALTER TABLE [dbo].[BienBanGiaoNhan] WITH CHECK ADD CONSTRAINT [FK_BienBan_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]);
ALTER TABLE [dbo].[BienBanGiaoNhan] CHECK CONSTRAINT [FK_BienBan_Xe];
GO
ALTER TABLE [dbo].[HopDongPhienBan] WITH CHECK ADD CONSTRAINT [FK__HopDongPh__HopDo__10E07F16] FOREIGN KEY ([HopDongId]) REFERENCES [dbo].[HopDongThue] ([HopDongId]);
ALTER TABLE [dbo].[HopDongPhienBan] CHECK CONSTRAINT [FK__HopDongPh__HopDo__10E07F16];
GO
ALTER TABLE [dbo].[PhiPhatSinh] WITH CHECK ADD CONSTRAINT [FK_Phi_NguoiTao] FOREIGN KEY ([NguoiTaoId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[PhiPhatSinh] CHECK CONSTRAINT [FK_Phi_NguoiTao];
GO
ALTER TABLE [dbo].[GiayToXe] WITH CHECK ADD CONSTRAINT [FK_GiayToXe_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[GiayToXe] CHECK CONSTRAINT [FK_GiayToXe_Xe];
GO
ALTER TABLE [dbo].[HopDongChuKy] WITH CHECK ADD CONSTRAINT [FK__HopDongCh__Phien__1881A0DE] FOREIGN KEY ([PhienBanId]) REFERENCES [dbo].[HopDongPhienBan] ([PhienBanId]);
ALTER TABLE [dbo].[HopDongChuKy] CHECK CONSTRAINT [FK__HopDongCh__Phien__1881A0DE];
GO
ALTER TABLE [dbo].[NguoiDung] WITH CHECK ADD CONSTRAINT [FK_NguoiDung_VaiTro] FOREIGN KEY ([VaiTroId]) REFERENCES [dbo].[VaiTro] ([VaiTroId]);
ALTER TABLE [dbo].[NguoiDung] CHECK CONSTRAINT [FK_NguoiDung_VaiTro];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_NguoiDoiSoat] FOREIGN KEY ([NguoiDoiSoatId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_NguoiDoiSoat];
GO
ALTER TABLE [dbo].[HuHongXe] WITH CHECK ADD CONSTRAINT [FK_HuHong_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]);
ALTER TABLE [dbo].[HuHongXe] CHECK CONSTRAINT [FK_HuHong_Xe];
GO
ALTER TABLE [dbo].[HinhAnhGiaoNhan] WITH CHECK ADD CONSTRAINT [FK_HinhAnhGN_BienBan] FOREIGN KEY ([BienBanId]) REFERENCES [dbo].[BienBanGiaoNhan] ([BienBanId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[HinhAnhGiaoNhan] CHECK CONSTRAINT [FK_HinhAnhGN_BienBan];
GO
ALTER TABLE [dbo].[HuHongXe] WITH CHECK ADD CONSTRAINT [FK_HuHong_BienBan] FOREIGN KEY ([BienBanId]) REFERENCES [dbo].[BienBanGiaoNhan] ([BienBanId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[HuHongXe] CHECK CONSTRAINT [FK_HuHong_BienBan];
GO
ALTER TABLE [dbo].[Xe] WITH CHECK ADD CONSTRAINT [FK_Xe_ChiNhanh] FOREIGN KEY ([ChiNhanhId]) REFERENCES [dbo].[ChiNhanh] ([ChiNhanhId]);
ALTER TABLE [dbo].[Xe] CHECK CONSTRAINT [FK_Xe_ChiNhanh];
GO
ALTER TABLE [dbo].[DanhGia] WITH CHECK ADD CONSTRAINT [FK_DanhGia_KhachHang] FOREIGN KEY ([KhachHangId]) REFERENCES [dbo].[KhachHang] ([KhachHangId]);
ALTER TABLE [dbo].[DanhGia] CHECK CONSTRAINT [FK_DanhGia_KhachHang];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_DonThue];
GO
ALTER TABLE [dbo].[NhatKyHeThong] WITH CHECK ADD CONSTRAINT [FK_NhatKy_NguoiDung] FOREIGN KEY ([NguoiDungId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[NhatKyHeThong] CHECK CONSTRAINT [FK_NhatKy_NguoiDung];
GO
ALTER TABLE [dbo].[Xe] WITH CHECK ADD CONSTRAINT [FK_Xe_MauXe] FOREIGN KEY ([MauXeId]) REFERENCES [dbo].[MauXe] ([MauXeId]);
ALTER TABLE [dbo].[Xe] CHECK CONSTRAINT [FK_Xe_MauXe];
GO
ALTER TABLE [dbo].[DichVuDonThue] WITH CHECK ADD CONSTRAINT [FK_DichVuDonThue_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[DichVuDonThue] CHECK CONSTRAINT [FK_DichVuDonThue_DonThue];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_BienBan] FOREIGN KEY ([BienBanId]) REFERENCES [dbo].[BienBanGiaoNhan] ([BienBanId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_BienBan];
GO
ALTER TABLE [dbo].[DonThue] WITH CHECK ADD CONSTRAINT [FK_DonThue_NguoiDoiSoatCoc] FOREIGN KEY ([NguoiDoiSoatCocId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]);
ALTER TABLE [dbo].[DonThue] CHECK CONSTRAINT [FK_DonThue_NguoiDoiSoatCoc];
GO
ALTER TABLE [dbo].[HopDongThue] WITH CHECK ADD CONSTRAINT [FK_HopDong_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]);
ALTER TABLE [dbo].[HopDongThue] CHECK CONSTRAINT [FK_HopDong_DonThue];
GO
ALTER TABLE [dbo].[DichVuDonThue] WITH CHECK ADD CONSTRAINT [FK_DichVuDonThue_DichVu] FOREIGN KEY ([DichVuId]) REFERENCES [dbo].[DichVu] ([DichVuId]);
ALTER TABLE [dbo].[DichVuDonThue] CHECK CONSTRAINT [FK_DichVuDonThue_DichVu];
GO
ALTER TABLE [dbo].[MauXe] WITH CHECK ADD CONSTRAINT [FK_MauXe_LoaiXe] FOREIGN KEY ([LoaiXeId]) REFERENCES [dbo].[LoaiXe] ([LoaiXeId]);
ALTER TABLE [dbo].[MauXe] CHECK CONSTRAINT [FK_MauXe_LoaiXe];
GO
ALTER TABLE [dbo].[DonThue] WITH CHECK ADD CONSTRAINT [FK_DonThue_NguoiTao] FOREIGN KEY ([NguoiTaoId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[DonThue] CHECK CONSTRAINT [FK_DonThue_NguoiTao];
GO
ALTER TABLE [dbo].[ThongBao] WITH CHECK ADD CONSTRAINT [FK_ThongBao_NguoiDung] FOREIGN KEY ([NguoiDungId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[ThongBao] CHECK CONSTRAINT [FK_ThongBao_NguoiDung];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_KhachHang] FOREIGN KEY ([KhachHangId]) REFERENCES [dbo].[KhachHang] ([KhachHangId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_KhachHang];
GO
ALTER TABLE [dbo].[BienBanGiaoNhan] WITH CHECK ADD CONSTRAINT [FK_BienBan_DonThue] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[BienBanGiaoNhan] CHECK CONSTRAINT [FK_BienBan_DonThue];
GO
ALTER TABLE [dbo].[BaoTri] WITH CHECK ADD CONSTRAINT [FK_BaoTri_NhanVien] FOREIGN KEY ([NhanVienId]) REFERENCES [dbo].[NhanVien] ([NhanVienId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[BaoTri] CHECK CONSTRAINT [FK_BaoTri_NhanVien];
GO
ALTER TABLE [dbo].[SuDungMaGiamGia] WITH CHECK ADD CONSTRAINT [FK_SDMGG_Ma] FOREIGN KEY ([MaGiamGiaId]) REFERENCES [dbo].[MaGiamGia] ([MaGiamGiaId]);
ALTER TABLE [dbo].[SuDungMaGiamGia] CHECK CONSTRAINT [FK_SDMGG_Ma];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_HuHong] FOREIGN KEY ([HuHongId]) REFERENCES [dbo].[HuHongXe] ([HuHongId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_HuHong];
GO
ALTER TABLE [dbo].[BienBanGiaoNhan] WITH CHECK ADD CONSTRAINT [FK_BienBan_ChiNhanh] FOREIGN KEY ([ChiNhanhId]) REFERENCES [dbo].[ChiNhanh] ([ChiNhanhId]);
ALTER TABLE [dbo].[BienBanGiaoNhan] CHECK CONSTRAINT [FK_BienBan_ChiNhanh];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_LienQuan] FOREIGN KEY ([ThanhToanLienQuanId]) REFERENCES [dbo].[ThanhToan] ([ThanhToanId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_LienQuan];
GO
ALTER TABLE [dbo].[DanhGia] WITH CHECK ADD CONSTRAINT [FK_DanhGia_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]);
ALTER TABLE [dbo].[DanhGia] CHECK CONSTRAINT [FK_DanhGia_Xe];
GO
ALTER TABLE [dbo].[HopDongChuKy] WITH CHECK ADD CONSTRAINT [FK__HopDongCh__Nguoi__1A69E950] FOREIGN KEY ([NguoiKyId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]);
ALTER TABLE [dbo].[HopDongChuKy] CHECK CONSTRAINT [FK__HopDongCh__Nguoi__1A69E950];
GO
ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_PhiPhatSinh] FOREIGN KEY ([PhiPhatSinhId]) REFERENCES [dbo].[PhiPhatSinh] ([PhiPhatSinhId]);
ALTER TABLE [dbo].[ThanhToan] CHECK CONSTRAINT [FK_ThanhToan_PhiPhatSinh];
GO
ALTER TABLE [dbo].[DonThue] WITH CHECK ADD CONSTRAINT [FK_DonThue_Xe] FOREIGN KEY ([XeId]) REFERENCES [dbo].[Xe] ([XeId]);
ALTER TABLE [dbo].[DonThue] CHECK CONSTRAINT [FK_DonThue_Xe];
GO
ALTER TABLE [dbo].[SuDungMaGiamGia] WITH CHECK ADD CONSTRAINT [FK_SDMGG_Don] FOREIGN KEY ([DonThueId]) REFERENCES [dbo].[DonThue] ([DonThueId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[SuDungMaGiamGia] CHECK CONSTRAINT [FK_SDMGG_Don];
GO
ALTER TABLE [dbo].[BienBanGiaoNhan] WITH CHECK ADD CONSTRAINT [FK_BienBan_NhanVien] FOREIGN KEY ([NhanVienId]) REFERENCES [dbo].[NhanVien] ([NhanVienId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[BienBanGiaoNhan] CHECK CONSTRAINT [FK_BienBan_NhanVien];
GO
ALTER TABLE [dbo].[DonThue] WITH CHECK ADD CONSTRAINT [FK_DonThue_ChiNhanhTra] FOREIGN KEY ([ChiNhanhTraId]) REFERENCES [dbo].[ChiNhanh] ([ChiNhanhId]);
ALTER TABLE [dbo].[DonThue] CHECK CONSTRAINT [FK_DonThue_ChiNhanhTra];
GO
ALTER TABLE [dbo].[HopDongPhienBan] WITH CHECK ADD CONSTRAINT [FK__HopDongPh__Nguoi__11D4A34F] FOREIGN KEY ([NguoiDaiDienId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]);
ALTER TABLE [dbo].[HopDongPhienBan] CHECK CONSTRAINT [FK__HopDongPh__Nguoi__11D4A34F];
GO
ALTER TABLE [dbo].[DonThue] WITH CHECK ADD CONSTRAINT [FK_DonThue_ChiNhanhNhan] FOREIGN KEY ([ChiNhanhNhanId]) REFERENCES [dbo].[ChiNhanh] ([ChiNhanhId]);
ALTER TABLE [dbo].[DonThue] CHECK CONSTRAINT [FK_DonThue_ChiNhanhNhan];
GO
ALTER TABLE [dbo].[NhanVien] WITH CHECK ADD CONSTRAINT [FK_NhanVien_NguoiDung] FOREIGN KEY ([NguoiDungId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]);
ALTER TABLE [dbo].[NhanVien] CHECK CONSTRAINT [FK_NhanVien_NguoiDung];
GO
ALTER TABLE [dbo].[NhanVien] WITH CHECK ADD CONSTRAINT [FK_NhanVien_ChiNhanh] FOREIGN KEY ([ChiNhanhId]) REFERENCES [dbo].[ChiNhanh] ([ChiNhanhId]);
ALTER TABLE [dbo].[NhanVien] CHECK CONSTRAINT [FK_NhanVien_ChiNhanh];
GO
ALTER TABLE [dbo].[KhachHang] WITH CHECK ADD CONSTRAINT [FK_KhachHang_NguoiDung] FOREIGN KEY ([NguoiDungId]) REFERENCES [dbo].[NguoiDung] ([NguoiDungId]) ON DELETE SET NULL;
ALTER TABLE [dbo].[KhachHang] CHECK CONSTRAINT [FK_KhachHang_NguoiDung];
GO

-- ------------------------------------------------------------------------------
-- 4. NAP DU LIEU MAU CHUAN TIENG VIET UNICODE (20+ BAN GHI / BANG)
-- ------------------------------------------------------------------------------
-- --------------------------------------------------
-- DU LIEU: [dbo].[VaiTro] (3 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[VaiTro] ON;
GO
INSERT INTO [dbo].[VaiTro] ([VaiTroId], [MaVaiTro], [TenVaiTro], [MoTa], [NgayTao], [NgayCapNhat]) VALUES
    (1, N'ADMIN', N'Quản trị viên', N'Quản lý toàn bộ hệ thống', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, N'NHANVIEN', N'Nhân viên', N'Xử lý nghiệp vụ cho thuê xe', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (3, N'KHACHHANG', N'Khách hàng', N'Khách hàng đặt và thuê xe', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000');
GO
SET IDENTITY_INSERT [dbo].[VaiTro] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[ChiNhanh] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[ChiNhanh] ON;
GO
INSERT INTO [dbo].[ChiNhanh] ([ChiNhanhId], [MaChiNhanh], [TenChiNhanh], [SoDienThoai], [Email], [DiaChi], [TinhThanh], [QuanHuyen], [PhuongXa], [GioMoCua], [GioDongCua], [TrangThai], [DaXoa], [NgayTao], [NgayCapNhat]) VALUES
    (1, N'CN-HN-01', N'Chi nhánh Hà Nội - Phố Huế', N'02438888888', N'hanoi@car-rental.local', N'Số 123 Phố Huế', N'Hà Nội', N'Hai Bà Trưng', N'Phố Huế', '07:30:00', '21:00:00', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, N'CN-HY-01', N'Chi nhánh Hưng Yên - Nguyễn Văn Linh', N'02213888888', N'hungyen@car-rental.local', N'Số 25 Nguyễn Văn Linh', N'Hưng Yên', N'TP. Hưng Yên', N'Lam Sơn', '07:30:00', '21:00:00', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (3, N'CN-BN-01', N'Chi nhánh Bắc Ninh - Lý Thái Tổ', N'02223888888', N'bacninh@car-rental.local', N'Số 88 Lý Thái Tổ', N'Bắc Ninh', N'TP. Bắc Ninh', N'Võ Cường', '07:30:00', '21:00:00', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (7, N'TEST1791813283848', N'Chi nhánh Long Biên - Hà Nội', NULL, NULL, N'Số 56 Ngô Gia Tự, Long Biên, Hà Nội', NULL, NULL, NULL, NULL, NULL, N'TAM_NGUNG', NULL, '2026-10-12T20:54:44.000', '2026-10-12T20:54:44.000'),
    (8, N'TEST1791813418842', N'Chi nhánh Thanh Xuân - Hà Nội', NULL, NULL, N'Số 180 Khuất Duy Tiến, Thanh Xuân, Hà Nội', NULL, NULL, NULL, NULL, NULL, N'TAM_NGUNG', NULL, '2026-10-12T20:56:59.000', '2026-10-12T20:57:00.000'),
    (9, N'TEST1791813495649', N'Chi nhánh Tây Hồ - Hà Nội', NULL, NULL, N'Số 68 Lạc Long Quân, Tây Hồ, Hà Nội', NULL, NULL, NULL, NULL, NULL, N'TAM_NGUNG', NULL, '2026-10-12T20:58:16.000', '2026-10-12T20:58:17.000'),
    (10, N'CN-HN-02', N'Chi nhánh Cầu Giấy - Hà Nội', N'02431234567', N'caugiay@autorental.vn', N'Số 123 Trần Duy Hưng', N'Hà Nội', N'Cầu Giấy', N'Trung Hòa', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (11, N'CN-HN-03', N'Chi nhánh Mỹ Đình - Hà Nội', N'02439876543', N'mydinh@autorental.vn', N'Số 456 Phạm Hùng', N'Hà Nội', N'Nam Từ Liêm', N'Mỹ Đình 1', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (12, N'CN-SG-01', N'Chi nhánh Tân Sơn Nhất - TP.HCM', N'02838889999', N'tansonnhat@autorental.vn', N'Ga Quốc nội Sân bay Tân Sơn Nhất', N'TP.HCM', N'Tân Bình', N'Phường 2', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (13, N'CN-SG-02', N'Chi nhánh Quận 1 - TP.HCM', N'02837776666', N'quan1@autorental.vn', N'Số 68 Lê Duẩn', N'TP.HCM', N'Quận 1', N'Bến Nghé', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (14, N'CN-SG-03', N'Chi nhánh Quận 7 - TP.HCM', N'02836665555', N'quan7@autorental.vn', N'Số 101 Nguyễn Thị Thập', N'TP.HCM', N'Quận 7', N'Tân Phú', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (15, N'CN-DN-01', N'Chi nhánh Sân bay Đà Nẵng', N'02363123456', N'danang@autorental.vn', N'Đường Duy Tân, Sân bay Đà Nẵng', N'Đà Nẵng', N'Hải Châu', N'Hòa Thuận Tây', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (16, N'CN-HP-01', N'Chi nhánh Hải Phòng', N'02253888777', N'haiphong@autorental.vn', N'Số 86 Lạch Tray', N'Hải Phòng', N'Ngô Quyền', N'Lạch Tray', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (17, N'CN-QN-01', N'Chi nhánh Hạ Long - Quảng Ninh', N'02033666888', N'quangninh@autorental.vn', N'Số 12 Đường bao biển Trần Quốc Nghiễn', N'Quảng Ninh', N'Hạ Long', N'Bãi Cháy', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (18, N'CN-NT-01', N'Chi nhánh Nha Trang - Khánh Hòa', N'02583555999', N'nhatrang@autorental.vn', N'Số 45 Trần Phú', N'Khánh Hòa', N'Nha Trang', N'Lộc Thọ', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (19, N'CN-DL-01', N'Chi nhánh Đà Lạt - Lâm Đồng', N'02633777222', N'dalat@autorental.vn', N'Số 2 Trần Hưng Đạo', N'Lâm Đồng', N'Đà Lạt', N'Phường 10', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (20, N'CN-CT-01', N'Chi nhánh Cần Thơ', N'02923888333', N'cantho@autorental.vn', N'Số 78 Đường 30 Tháng 4', N'Cần Thơ', N'Ninh Kiều', N'Xuân Khánh', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (21, N'CN-VT-01', N'Chi nhánh Vũng Tàu', N'02543999444', N'vungtau@autorental.vn', N'Số 150 Thùy Vân', N'Bà Rịa - Vũng Tàu', N'Vũng Tàu', N'Phường 8', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (22, N'CN-BD-01', N'Chi nhánh Bình Dương', N'02743888555', N'binhduong@autorental.vn', N'Số 230 Đại lộ Bình Dương', N'Bình Dương', N'Thủ Dầu Một', N'Phú Hòa', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (23, N'CN-PQ-01', N'Chi nhánh Phú Quốc - Kiên Giang', N'02973777666', N'phuquoc@autorental.vn', N'Cảng Hàng không Quốc tế Phú Quốc', N'Kiên Giang', N'Phú Quốc', N'Dương Tơ', NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000');
GO
SET IDENTITY_INSERT [dbo].[ChiNhanh] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HangXe] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HangXe] ON;
GO
INSERT INTO [dbo].[HangXe] ([HangXeId], [MaHangXe], [TenHangXe], [QuocGia], [Logo], [MoTa], [TrangThai], [DaXoa], [NgayTao], [NgayCapNhat]) VALUES
    (1, N'TOYOTA', N'Toyota', N'Nhật Bản', NULL, N'Thương hiệu xe bền bỉ số 1 Nhật Bản', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, N'HONDA', N'Honda', N'Nhật Bản', NULL, N'Động cơ VTEC tiết kiệm nhiên liệu', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (3, N'HYUNDAI', N'Hyundai', N'Hàn Quốc', NULL, N'Thiết kế thời thượng, nhiều tiện nghi', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (4, N'KIA', N'Kia', N'Hàn Quốc', NULL, N'Trẻ trung, hiện đại, công nghệ phong phú', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (5, N'MAZDA', N'Mazda', N'Nhật Bản', NULL, N'Thiết kế KODO và công nghệ SkyActiv tiên tiến', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (6, N'MITSUBISHI', N'Mitsubishi', N'Nhật Bản', NULL, N'Bền bỉ, tiết kiệm, thực dụng cho gia đình', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (7, N'FORD', N'Ford', N'Mỹ', NULL, N'Động cơ mạnh mẽ, dẫn đầu dòng bán tải và SUV', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (8, N'VINFAST', N'VinFast', N'Việt Nam', NULL, N'Thương hiệu xe điện thông minh Việt Nam', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (9, N'HX-VF', N'VinFast', N'Việt Nam', N'https://upload.wikimedia.org/wikipedia/commons/8/87/VinFast_logo.svg', N'Thương hiệu xe điện thông minh Việt Nam', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (10, N'HX-LX', N'Lexus', N'Nhật Bản', N'https://upload.wikimedia.org/wikipedia/commons/d/df/Lexus_division_emblem.svg', N'Thương hiệu xe sang êm ái của Toyota', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (11, N'HX-AUDI', N'Audi', N'Đức', N'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg', N'Xe sang công nghệ Đức, dẫn động Quattro', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (12, N'HX-VOLVO', N'Volvo', N'Thụy Điển', N'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo-Iron-Mark-Black.svg', N'Dòng xe an toàn hàng đầu thế giới', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (13, N'HX-SUBARU', N'Subaru', N'Nhật Bản', N'https://upload.wikimedia.org/wikipedia/commons/0/07/Subaru_logo.svg', N'Động cơ Boxer và dẫn động AWD đối xứng', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (14, N'HX-PORSCHE', N'Porsche', N'Đức', N'https://upload.wikimedia.org/wikipedia/commons/8/8c/Porsche_Wappen.svg', N'Xe thể thao và SUV hiệu năng cao đỉnh cao', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (15, N'HX-LANDROVER', N'Land Rover', N'Anh Quốc', N'https://upload.wikimedia.org/wikipedia/commons/e/e0/Land_Rover_logo.svg', N'Vua địa hình quý tộc Anh Quốc', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (16, N'HX-MITSUBISHI', N'Mitsubishi', N'Nhật Bản', N'https://upload.wikimedia.org/wikipedia/commons/b/b7/Mitsubishi-logo.png', N'Bền bỉ, tiết kiệm, thực dụng cho gia đình', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (17, N'HX-NISSAN', N'Nissan', N'Nhật Bản', N'https://upload.wikimedia.org/wikipedia/commons/8/82/Nissan_logo.png', N'Đột phá công nghệ di chuyển thông minh', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (18, N'HX-SUZUKI', N'Suzuki', N'Nhật Bản', N'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg', N'Dòng xe nhỏ gọn và tiết kiệm nhiên liệu', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (19, N'HX-PEUGEOT', N'Peugeot', N'Pháp', N'https://upload.wikimedia.org/wikipedia/commons/1/18/Peugeot_2021_Logo.svg', N'Thiết kế tinh tế phong cách lãng mạn Pháp', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (20, N'HX-JAGUAR', N'Jaguar', N'Anh Quốc', N'https://upload.wikimedia.org/wikipedia/commons/d/df/Jaguar_logo_2012.png', N'Thương hiệu xe thể thao sang trọng quý tộc Anh', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000');
GO
SET IDENTITY_INSERT [dbo].[HangXe] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[LoaiXe] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[LoaiXe] ON;
GO
INSERT INTO [dbo].[LoaiXe] ([LoaiXeId], [MaLoaiXe], [TenLoaiXe], [MoTa], [NgayTao], [NgayCapNhat]) VALUES
    (1, N'SEDAN', N'Sedan hiện đại', N'Xe sedan 4 cửa thanh lịch, êm ái, tiết kiệm nhiên liệu', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, N'SUV', N'SUV gầm cao', N'Xe SUV gầm cao đa dụng vượt mọi địa hình', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (3, N'MPV', N'MPV gia đình', N'Xe đa dụng 7 chỗ rộng rãi cho gia đình', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (4, N'HATCHBACK', N'Hatchback đô thị', N'Xe hatchback nhỏ gọn, tối ưu chi phí trong phố', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (5, N'PICKUP', N'Bán tải Pick-up', N'Xe bán tải cabin kép gầm cao, chở đồ dã ngoại tiện lợi', '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (8, N'CUV', N'Crossover CUV', N'Gầm cao đô thị linh hoạt, đa dụng', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (9, N'EV-SUV', N'Xe điện SUV', N'SUV thuần điện công nghệ cao, thân thiện môi trường', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (10, N'EV-SEDAN', N'Xe điện Sedan', N'Sedan thuần điện thông minh, tăng tốc tức thì', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (11, N'LUXURY', N'Xe sang cao cấp', N'Đẳng cấp thương gia, tiện nghi thượng lưu', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (12, N'COUPE', N'Coupe thể thao', N'2 cửa thể thao khí động học, cảm giác lái đỉnh cao', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (13, N'LIMOUSINE', N'Limousine VIP', N'Khoang thương gia 9-11 chỗ, ghế massage cao cấp', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (14, N'FULL-SUV', N'SUV Full-size 7 chỗ', N'SUV cỡ lớn rộng rãi nhất phân khúc gia đình', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (15, N'CONVERTIBLE', N'Mui trần Cabriolet', N'Xe mui xếp thời thượng dạo phố và du lịch biển', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (16, N'WAGON', N'Station Wagon', N'Đuôi dài khoang hành lý siêu rộng', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (17, N'MINIVAN', N'Minivan gia đình', N'Cửa trượt điện tiện nghi cho người già và trẻ nhỏ', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (18, N'OFFROAD', N'Off-road chuyên nghiệp', N'Dẫn động 4x4 khóa vi sai chinh phục đèo dốc', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (19, N'SPORT', N'Sport Car', N'Tốc độ cao, âm thanh pô uy lực', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (20, N'COMMERCIAL', N'Xe thương mại 16 chỗ', N'Phục vụ đưa đón đoàn công tác và du lịch', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (21, N'CROSSOVER', N'Crossover đa dụng', N'Linh hoạt đô thị kết hợp dã ngoại cuối tuần', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000'),
    (22, N'SUPERCAR', N'Siêu xe hiệu năng cao', N'Trải nghiệm tốc độ và đẳng cấp số một', '2026-11-07T13:08:15.000', '2026-11-07T13:08:15.000');
GO
SET IDENTITY_INSERT [dbo].[LoaiXe] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[DichVu] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[DichVu] ON;
GO
INSERT INTO [dbo].[DichVu] ([DichVuId], [MaDichVu], [TenDichVu], [DonViTinh], [DonGia], [MoTa], [TrangThai], [NgayTao], [NgayCapNhat]) VALUES
    (1, N'GPS', N'Thiết bị GPS', N'ngày', 50000, N'Thiết bị định vị GPS', N'HOAT_DONG', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, N'GHE-TRE-EM', N'Ghế trẻ em', N'ngày', 80000, N'Ghế an toàn cho trẻ em', N'HOAT_DONG', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (3, N'GIAO-XE', N'Giao xe tận nơi', N'lần', 150000, N'Giao xe trong khu vực hỗ trợ', N'HOAT_DONG', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (4, N'VE-SINH', N'Vệ sinh xe', N'lần', 100000, N'Vệ sinh xe trước/sau thuê', N'HOAT_DONG', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (5, N'DV-GIAOXE', N'Giao và nhận xe tận nơi theo địa chỉ', N'PER_TRIP', 150000, N'Giao xe tận nhà hoặc khách sạn trong bán kính 15km', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (6, N'DV-GHEEMBE', N'Ghế ngồi an toàn cho trẻ em ISOFIX', N'PER_DAY', 50000, N'Ghế an toàn tiêu chuẩn châu Âu cho bé 1-6 tuổi', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (7, N'DV-BAOHIEMVIP', N'Gói bảo hiểm thân vỏ toàn diện VIP', N'PER_DAY', 120000, N'Miễn trừ bồi thường trầy xước nhẹ dưới 5 triệu đồng', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (8, N'DV-TAIXE', N'Tài xế riêng chuyên nghiệp lịch sự', N'PER_DAY', 600000, N'Tài xế thông thạo cung đường, lái xe an toàn', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (9, N'DV-RUAXE', N'Gói rửa xe vệ sinh nội thất trước khi trả', N'PER_TRIP', 100000, N'Khách không cần phải tìm chỗ rửa xe trước khi trả', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (10, N'DV-CAM4K', N'Camera hành trình ghi hình 4K trước sau', N'PER_DAY', 40000, N'Ghi hình hành trình độ nét cao, lưu thẻ nhớ 64GB', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (11, N'DV-WIFI4G', N'Bộ phát Wi-Fi 4G LTE tốc độ cao', N'PER_DAY', 35000, N'Internet không giới hạn dung lượng trên mọi cung đường', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (12, N'DV-GIANOC', N'Giá nóc chở đồ dã ngoại chuyên dụng', N'PER_TRIP', 200000, N'Thêm không gian chở vali, lều trại dã ngoại', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (13, N'DV-TULANH', N'Tủ lạnh mini ô tô 12V giữ lạnh đồ uống', N'PER_DAY', 60000, N'Giữ lạnh nước ngọt, hoa quả trong suốt chuyến đi', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (14, N'DV-KICHBINH', N'Bộ kích bình ắc quy dự phòng thông minh', N'PER_TRIP', 50000, N'Tự cứu hộ khi vô tình quên tắt đèn xe', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (15, N'DV-BOMDIEN', N'Máy bơm lốp điện tử tự động ngắt mini', N'PER_TRIP', 40000, N'Bơm lốp nhanh trong 3 phút, an tâm đi xa', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (16, N'DV-CAPSAC', N'Bộ củ cáp sạc nhanh Type-C/Lightning 65W', N'PER_TRIP', 30000, N'Sạc nhanh cùng lúc 3 điện thoại trên xe', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (17, N'DV-VETC', N'Hỗ trợ sẵn tài khoản thu phí tự động VETC/ePass', N'PER_TRIP', 20000, N'Xe đã dán thẻ, đi qua trạm BOT tự động không dừng', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (18, N'DV-SOS247', N'Dịch vụ cứu hộ khẩn cấp 24/7 toàn quốc', N'PER_TRIP', 80000, N'Hỗ trợ kéo xe miễn phí khi gặp sự cố bất ngờ', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (19, N'DV-KHUMUI', N'Xông khử mùi sinh học Nano Bạc cao cấp', N'PER_TRIP', 90000, N'Khoang xe thơm mát, diệt khuẩn 99.9%', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (20, N'DV-LEU', N'Bộ lều cắm trại 4 người gấp gọn', N'PER_TRIP', 250000, N'Bao gồm lều 2 lớp chống mưa, đệm hơi dã ngoại', N'HOAT_DONG', '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000');
GO
SET IDENTITY_INSERT [dbo].[DichVu] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[MaGiamGia] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[MaGiamGia] ON;
GO
INSERT INTO [dbo].[MaGiamGia] ([MaGiamGiaId], [MaCode], [TenMa], [MoTa], [LoaiGiam], [GiaTriGiam], [GiamToiDa], [DonToiThieu], [SoLuotSuDung], [SoLuotDaDung], [SoLanToiDaMoiKhach], [ThoiGianBatDau], [ThoiGianKetThuc], [TrangThai], [NgayTao], [NgayCapNhat]) VALUES
    (1, N'WELCOME10', N'Giảm 10% khách mới', N'Ưu đãi khách hàng mới', N'PHAN_TRAM', 10, 500000, 1000000, 100, 0, 1, '2026-01-01T00:00:00.000', '2027-12-31T00:00:00.000', N'HOAT_DONG', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, N'CAR200K', N'Giảm 200.000đ', N'Ưu đãi đơn thuê đủ điều kiện', N'SO_TIEN', 200000, NULL, 2000000, 200, 0, 2, '2026-01-01T00:00:00.000', '2027-12-31T00:00:00.000', N'HOAT_DONG', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (7, N'WELCOME2026', N'Ưu đãi thành viên mới 10%', N'Giảm ngay 10% cho khách hàng lần đầu thuê xe', N'PHAN_TRAM', 10, 300000, 800000, 500, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (8, N'VIPCAR500', N'Đặc quyền xe sang giảm 500k', N'Giảm 500.000 VNĐ cho các dòng xe sang', N'SO_TIEN', 500000, 500000, 2500000, 200, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (9, N'ECOGREEN', N'Trải nghiệm xe điện VinFast', N'Giảm 12% khi thuê xe điện VF8, VF9', N'PHAN_TRAM', 12, 400000, 1000000, 300, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (10, N'SUMMER2026', N'Du lịch hè sôi động', N'Giảm 10% cho chuyến đi trên 3 ngày', N'PHAN_TRAM', 10, 350000, 1500000, 400, 0, 1, '2026-05-01T00:00:00.000', '2026-08-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (11, N'WEEKEND15', N'Vi vu cuối tuần', N'Ưu đãi 15% cho đơn thuê thứ 7 và Chủ nhật', N'PHAN_TRAM', 15, 450000, 1200000, 350, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (12, N'FIRSTTRIP', N'Chuyến đi đầu tiên', N'Giảm 100.000đ trực tiếp vào đơn đầu', N'SO_TIEN', 100000, 100000, 500000, 1000, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (13, N'TET2026', N'Về quê đón Tết sum vầy', N'Ưu đãi gói thuê xe dịp Tết Nguyên Đán', N'PHAN_TRAM', 8, 600000, 5000000, 150, 0, 1, '2026-01-15T00:00:00.000', '2026-02-28T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (14, N'BUSINESSVIP', N'Khách hàng doanh nghiệp', N'Chiết khấu thuê xe công tác dài ngày', N'PHAN_TRAM', 20, 1000000, 4000000, 100, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (15, N'PHUQUOC20', N'Khám phá đảo ngọc Phú Quốc', N'Áp dụng tại chi nhánh Phú Quốc', N'PHAN_TRAM', 20, 500000, 1500000, 200, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (16, N'DANANG15', N'Dạo chơi thành phố đáng sống Đà Nẵng', N'Áp dụng tại chi nhánh Đà Nẵng', N'PHAN_TRAM', 15, 400000, 1000000, 250, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (17, N'HANOI10', N'Du ngoạn Hà Nội và phụ cận', N'Áp dụng các chi nhánh Hà Nội', N'PHAN_TRAM', 10, 250000, 800000, 300, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (18, N'SAIGON10', N'Sài Gòn hoa lệ', N'Áp dụng các chi nhánh TP.HCM', N'PHAN_TRAM', 10, 250000, 800000, 300, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (19, N'FAMILYCAR', N'Gia đình hạnh phúc', N'Giảm 12% cho các dòng xe MPV 7 chỗ', N'PHAN_TRAM', 12, 350000, 1200000, 200, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (20, N'HYBRIDLOVE', N'Xe Hybrid êm ái tiết kiệm', N'Giảm 10% khi thuê dòng xe Hybrid', N'PHAN_TRAM', 10, 300000, 1000000, 150, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (21, N'ELECTRICFUTURE', N'Tương lai xanh cùng xe điện', N'Khuyến khích lối sống xanh thân thiện', N'PHAN_TRAM', 15, 450000, 1500000, 250, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (22, N'GOLDMEMBER', N'Thành viên Vàng', N'Dành riêng cho khách hàng VIP Gold', N'PHAN_TRAM', 18, 700000, 2000000, 100, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (23, N'PLATINUM50', N'Thành viên Bạch Kim', N'Dành riêng cho khách hàng VIP Platinum', N'PHAN_TRAM', 25, 1500000, 3000000, 50, 0, 1, '2026-01-01T00:00:00.000', '2026-12-31T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000'),
    (24, N'BLACKFRIDAY', N'Siêu bão giảm giá Black Friday', N'Giảm giá lớn nhất trong năm', N'PHAN_TRAM', 30, 1200000, 2000000, 100, 0, 1, '2026-11-20T00:00:00.000', '2026-11-30T00:00:00.000', N'HOAT_DONG', '2026-11-07T13:09:06.000', '2026-11-07T13:09:06.000');
GO
SET IDENTITY_INSERT [dbo].[MaGiamGia] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[NguoiDung] (7 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[NguoiDung] ON;
GO
INSERT INTO [dbo].[NguoiDung] ([NguoiDungId], [VaiTroId], [TenDangNhap], [MatKhauMaHoa], [Email], [SoDienThoai], [HoTen], [AnhDaiDien], [TrangThai], [LanDangNhapCuoi], [NgayTao], [NgayCapNhat], [DaXoa]) VALUES
    (1, 1, N'admin', N'$2a$12$pnyhvs9AzzeNZnIpkh3TTOULfztC6hT4EliBQuDFSayp6P1SFo0bi', N'admin@carrental.local', N'0901000001', N'Quản trị viên', NULL, N'HOAT_DONG', '2026-11-02T13:51:31.000', '2026-09-19T13:10:10.000', '2026-09-24T11:09:59.000', 0),
    (2, 2, N'nhanvien01', N'$2a$12$j7ecV5nRzHPdDjiBGjCHxu60WdnD9jR5da4q8EbBjb.9SOjkWsBe6', N'nhanvien01@carrental.local', N'0901000002', N'Nguyễn Văn Nhân', NULL, N'HOAT_DONG', NULL, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000', 0),
    (3, 3, N'khachhang01', N'$2a$12$cVDzDZv6x/jgZPKVq71kY.E/wZxhzFQTt8mCRsP0x4TDYnKFDklSG', N'khach01@carrental.local', N'0901000003', N'Trần Minh Anh', NULL, N'HOAT_DONG', '2026-09-20T22:10:06.000', '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000', 0),
    (4, 3, N'tranhuy', N'$2a$12$KgB143yk9TrG3/IU84c/..rIUi6BcYHkIpDZ2jW.dJGdgbK.cMgau', N'user@demo.com', N'0987654321', N'tran duc huy', NULL, N'HOAT_DONG', '2026-11-02T13:58:13.000', '2026-09-20T12:44:46.000', '2026-09-20T12:44:46.000', 0),
    (5, 2, N'nhanvien', N'$2a$12$cYkCivK90dGROg5QIqUd/.QPWzByU6WWY2VkhaAX9ZgQSn0uZCsf2', N'nhanvien@carrental.local', N'0901000010', N'Nhân viên mới', NULL, N'HOAT_DONG', '2026-10-13T10:19:18.000', '2026-09-22T08:11:33.000', '2026-09-22T08:21:22.000', 0),
    (6, 3, N'demo_e2e013', N'$2a$12$jrJekeV2zOoZy3Ac2h/ecusVIFWAXKIqsWkf1HJet3Wg5.BOIDomK', N'demo-e2e013@example.invalid', N'0000000013', N'DEMO-E2E - Khách mô phỏng đồ án', NULL, N'HOAT_DONG', '2026-10-13T10:19:04.000', '2026-10-13T10:16:17.000', '2026-10-13T10:16:17.000', 0),
    (7, 3, N'demo_hd013', N'$2a$12$WQJRe0tdm/THAtDOlQqmA.mZXy2fQYBm0A4qyujlI4GdCNfXUInYG', N'demo-hd013@example.invalid', N'0000000014', N'DEMO-HD - Khách mô phỏng hợp đồng', NULL, N'HOAT_DONG', '2026-10-14T23:18:03.000', '2026-10-13T10:51:53.000', '2026-10-13T10:51:53.000', 0);
GO
SET IDENTITY_INSERT [dbo].[NguoiDung] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[MauXe] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[MauXe] ON;
GO
INSERT INTO [dbo].[MauXe] ([MauXeId], [HangXeId], [LoaiXeId], [MaMauXe], [TenMauXe], [SoCho], [HopSo], [NhienLieu], [GiaThueNgayMacDinh], [MoTa], [TrangThai], [DaXoa], [NgayTao], [NgayCapNhat]) VALUES
    (1, 1, 1, N'TOYOTA-VIOS', N'Toyota Vios', 5, N'TU_DONG', N'XANG', 700000, N'Sedan 5 chỗ, phù hợp đi thành phố và đường dài', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, 1, 2, N'TOYOTA-COROLLA-CROSS', N'Toyota Corolla Cross', 5, N'TU_DONG', N'HYBRID', 950000, N'SUV 5 chỗ tiết kiệm nhiên liệu', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (3, 2, 1, N'HONDA-CITY', N'Honda City', 5, N'TU_DONG', N'XANG', 700000, N'Sedan 5 chỗ', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (4, 3, 2, N'HYUNDAI-CRETA', N'Hyundai Creta', 5, N'TU_DONG', N'XANG', 850000, N'SUV 5 chỗ', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (5, 4, 3, N'KIA-CARNIVAL', N'Kia Carnival', 7, N'TU_DONG', N'DIESEL', 1500000, N'MPV 7 chỗ cao cấp', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (6, 2, 3, N'HONDA-BRV', N'Honda BR-V', 7, N'TU_DONG', N'XANG', 1000000, N'Äá»™ng cÆ¡ xÄƒng 1.5L, CVT, 7 chá»—; thÃ´ng sá»‘ theo Honda Viá»‡t Nam.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (7, 1, 3, N'TOYOTA-VELOZ-CROSS', N'Toyota Veloz Cross', 7, N'TU_DONG', N'XANG', 950000, N'Äá»™ng cÆ¡ xÄƒng 1.5L, CVT, 7 chá»—; thÃ´ng sá»‘ cÆ¡ báº£n theo Toyota Viá»‡t Nam.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (8, 2, 2, N'HONDA-HRV', N'Honda HR-V', 5, N'TU_DONG', N'XANG', 1100000, N'Báº£n xÄƒng 1.5L, CVT, 5 chá»—; thÃ´ng sá»‘ theo Honda Viá»‡t Nam.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (9, 1, 2, N'TOYOTA-YARIS-CROSS', N'Toyota Yaris Cross', 5, N'TU_DONG', N'XANG', 850000, N'Báº£n xÄƒng 1.5L, CVT, 5 chá»—; thÃ´ng sá»‘ cÆ¡ báº£n theo Toyota Viá»‡t Nam.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (10, 3, 2, N'HYUNDAI-TUCSON', N'Hyundai Tucson', 5, N'TU_DONG', N'XANG', 1200000, N'SUV 5 chá»—, báº£n xÄƒng; cáº¥u hÃ¬nh Ä‘á»™ng cÆ¡ tÃ¹y phiÃªn báº£n.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (11, 3, 2, N'HYUNDAI-SANTA-FE', N'Hyundai Santa Fe', 7, N'TU_DONG', N'XANG', 1600000, N'SUV 7 chá»—, báº£n xÄƒng; cáº¥u hÃ¬nh Ä‘á»™ng cÆ¡ tÃ¹y phiÃªn báº£n.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (12, 4, 2, N'KIA-SELTOS', N'Kia Seltos', 5, N'TU_DONG', N'XANG', 900000, N'Báº£n xÄƒng 1.5L, há»™p sá»‘ tá»± Ä‘á»™ng; thÃ´ng sá»‘ theo Kia Viá»‡t Nam.', N'HOAT_DONG', 0, '2026-10-27T23:17:36.000', '2026-10-27T23:17:36.000'),
    (13, 1, 1, N'MX-CAMRY', N'Toyota Camry 2.5Q', 5, N'TU_DONG', N'XANG', 1300000, N'Sedan hạng D cao cấp chuẩn doanh nhân thành đạt', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (14, 8, 2, N'MX-VF8', N'VinFast VF8 Plus', 5, N'TU_DONG', N'DIEN', 1500000, N'SUV điện thông minh hệ thống ADAS cấp 2 hiện đại', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (15, 8, 2, N'MX-VF9', N'VinFast VF9 Plus 6 Chỗ', 6, N'TU_DONG', N'DIEN', 2200000, N'SUV điện Full-size ghế cơ trưởng massage cao cấp', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (16, 1, 1, N'MX-C300', N'Mercedes-Benz C300 AMG', 5, N'TU_DONG', N'XANG', 2800000, N'Sedan thể thao sang trọng âm thanh Burmester 15 loa', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (17, 7, 2, N'MX-RANGER', N'Ford Ranger Wildtrak 4x4', 5, N'TU_DONG', N'DIESEL', 1100000, N'Vua bán tải dẫn động 4 bánh hai cầu thông minh', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (18, 7, 2, N'MX-EVEREST', N'Ford Everest Titanium', 7, N'TU_DONG', N'DIESEL', 1600000, N'SUV 7 chỗ máy dầu êm ái cách âm tuyệt hảo', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (19, 1, 2, N'MX-GLC300', N'Mercedes-Benz GLC 300 4MATIC', 5, N'TU_DONG', N'XANG', 3200000, N'SUV hạng sang dẫn động 4 bánh bán chạy nhất', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000'),
    (20, 1, 2, N'MX-FORTUNER', N'Toyota Fortuner Legender', 7, N'TU_DONG', N'DIESEL', 1500000, N'Gầm cao 7 chỗ bền bỉ trên mọi nẻo đường', N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000');
GO
SET IDENTITY_INSERT [dbo].[MauXe] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[KhachHang] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[KhachHang] ON;
GO
INSERT INTO [dbo].[KhachHang] ([KhachHangId], [NguoiDungId], [MaKhachHang], [HoTen], [SoDienThoai], [Email], [NgaySinh], [GioiTinh], [SoCCCD], [SoGPLX], [HangGPLX], [NgayHetHanGPLX], [DiaChi], [TinhThanh], [QuanHuyen], [PhuongXa], [TrangThai], [DaXoa], [NgayTao], [NgayCapNhat], [AnhCCCD], [AnhGPLX]) VALUES
    (1, 3, N'KH0001', N'Nguyễn Văn A', N'0901000003', N'khach01@carrental.local', '2002-05-15T00:00:00.000', N'NU', N'001202000001', N'790123456789', N'B2', '2030-05-15T00:00:00.000', N'Khu đô thị Ocean Park', N'Hưng Yên', N'Văn Giang', N'Long Hưng', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000', NULL, NULL),
    (2, 4, N'KH0002', N'Trần Thị B', N'0987654321', N'user@demo.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-09-20T12:44:46.000', '2026-09-20T12:44:46.000', NULL, NULL),
    (3, NULL, N'KH0003', N'Lê Văn C', N'0900000000', N'test1791813283848@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'Quan kiem thu', NULL, N'HOAT_DONG', 0, '2026-10-12T20:54:44.000', '2026-10-12T20:54:44.000', NULL, NULL),
    (5, NULL, N'KH0004', N'Hoàng Văn E', N'0900000000', N'test1791813418842@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'Quan kiem thu', NULL, N'HOAT_DONG', 0, '2026-10-12T20:56:59.000', '2026-10-12T20:57:00.000', NULL, NULL),
    (6, NULL, N'KH0005', N'Vũ Thị F', N'0900000000', N'test1791813495649@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'Quan kiem thu', NULL, N'HOAT_DONG', 0, '2026-10-12T20:58:16.000', '2026-10-12T20:58:17.000', NULL, NULL),
    (8, NULL, N'KH0006', N'DEMO-G01 - Khách mô phỏng', N'0000000001', N'demo-g01@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, N'DEMO - dữ liệu mô phỏng đồ án, không phải khách hàng thực tế', NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-10-12T23:02:02.000', '2026-10-12T23:02:02.000', NULL, NULL),
    (9, NULL, N'KH0007', N'DEMO-N01 - Khách mô phỏng', N'0000000002', N'demo-n01@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, N'DEMO - dữ liệu mô phỏng đồ án, không phải khách hàng thực tế', NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-10-12T23:02:06.000', '2026-10-12T23:02:06.000', NULL, NULL),
    (10, 6, N'KH0008', N'DEMO-E2E - Khách mô phỏng đồ án', N'0000000013', N'demo-e2e013@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-10-13T10:16:17.000', '2026-10-13T10:16:17.000', NULL, NULL),
    (11, 7, N'KH0009', N'DEMO-HD - Khách mô phỏng hợp đồng', N'0000000014', N'demo-hd013@example.invalid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-10-13T10:51:54.000', '2026-10-13T10:51:54.000', NULL, NULL),
    (12, NULL, N'KH-0010', N'Nguyễn Hoàng Long', N'0912111222', N'longnh@gmail.com', NULL, NULL, N'001201009988', N'B2-88776655', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (13, NULL, N'KH-0011', N'Phạm Thu Trang', N'0912333444', N'trangpt@gmail.com', NULL, NULL, N'001201007766', N'B2-77665544', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (14, NULL, N'KH-0012', N'Đỗ Minh Tuấn', N'0912555666', N'tuandm@gmail.com', NULL, NULL, N'001201005544', N'B2-66554433', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (15, NULL, N'KH-0013', N'Vũ Thị Mai Anh', N'0912777888', N'maianhvt@gmail.com', NULL, NULL, N'001201003322', N'B2-55443322', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (16, NULL, N'KH-0014', N'Hoàng Văn Hùng', N'0912999000', N'hunghv@gmail.com', NULL, NULL, N'001201001100', N'B2-44332211', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (17, NULL, N'KH-0015', N'Lê Ngọc Diệp', N'0988111222', N'diepln@gmail.com', NULL, NULL, N'079201008877', N'B2-33221100', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (18, NULL, N'KH-0016', N'Trần Quốc Bảo', N'0988333444', N'baotq@gmail.com', NULL, NULL, N'079201006655', N'B2-22110099', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (19, NULL, N'KH-0017', N'Bùi Phương Thảo', N'0988555666', N'thaobp@gmail.com', NULL, NULL, N'079201004433', N'B2-11009988', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (20, NULL, N'KH-0018', N'Ngô Thanh Tùng', N'0988777888', N'tungnt@gmail.com', NULL, NULL, N'079201002211', N'B2-00998877', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (21, NULL, N'KH-0019', N'Đinh Gia Huy', N'0988999000', N'huydg@gmail.com', NULL, NULL, N'079201001122', N'B2-99887711', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL),
    (22, NULL, N'KH-0020', N'Phan Thùy Linh', N'0977111333', N'linhpt@gmail.com', NULL, NULL, N'079201003344', N'B2-88776622', N'B2', NULL, NULL, NULL, NULL, NULL, N'HOAT_DONG', 0, '2026-11-07T13:07:34.000', '2026-11-07T13:07:34.000', NULL, NULL);
GO
SET IDENTITY_INSERT [dbo].[KhachHang] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[NhanVien] (2 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[NhanVien] ON;
GO
INSERT INTO [dbo].[NhanVien] ([NhanVienId], [NguoiDungId], [ChiNhanhId], [MaNhanVien], [HoTen], [SoDienThoai], [Email], [SoCCCD], [NgaySinh], [DiaChi], [ChucVu], [NgayVaoLam], [TrangThai], [DaXoa], [NgayTao], [NgayCapNhat]) VALUES
    (1, 2, 2, N'NV0001', N'Nguyễn Văn Nhân', N'0901000002', N'nhanvien01@carrental.local', NULL, NULL, NULL, N'Nhân viên cho thuê xe', '2026-01-10T00:00:00.000', N'HOAT_DONG', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (2, 5, 2, N'NV0009', N'Nhân viên mới', N'0901000010', N'nhanvien@carrental.local', NULL, NULL, NULL, N'Nhân viên', '2026-09-22T00:00:00.000', N'HOAT_DONG', 0, '2026-09-22T08:11:34.000', '2026-09-22T08:21:22.000');
GO
SET IDENTITY_INSERT [dbo].[NhanVien] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[Xe] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[Xe] ON;
GO
INSERT INTO [dbo].[Xe] ([XeId], [MauXeId], [ChiNhanhId], [MaXe], [BienSo], [SoKhung], [MauSac], [NamSanXuat], [NgayDangKy], [SoKmHienTai], [GiaThueNgay], [TienDatCocMacDinh], [TrangThai], [MoTa], [DaXoa], [NgayTao], [NgayCapNhat]) VALUES
    (1, 1, 2, N'XE0001', N'89A-123.45', N'RL4ABCD1234567890', N'Trắng', 2024, '2024-06-20T00:00:00.000', 25020, 650000, 5000000, N'HOAT_DONG', N'Toyota Vios bản tự động', 0, '2026-09-19T13:10:10.000', '2026-10-07T17:19:17.000'),
    (2, 2, 1, N'XE0002', N'30K-234.56', N'RZ4EFGH1234567890', N'Đen', 2025, '2025-03-10T00:00:00.000', 9810, 950000, 7000000, N'HOAT_DONG', N'Corolla Cross Hybrid', 0, '2026-09-19T13:10:10.000', '2026-10-07T23:21:08.000'),
    (3, 3, 2, N'XE0003', N'89A-345.67', N'RZ8IJKL1234567890', N'Xám', 2024, '2024-08-05T00:00:00.000', 14300, 700000, 5000000, N'HOAT_DONG', N'Honda City RS', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (4, 4, 3, N'XE0004', N'99A-456.78', N'MALMNOP1234567890', N'Xanh', 2025, '2025-05-18T00:00:00.000', 6200, 850000, 6000000, N'HOAT_DONG', N'Hyundai Creta', 0, '2026-09-19T13:10:10.000', '2026-09-19T13:10:10.000'),
    (5, 5, 1, N'XE0005', N'30L-567.89', N'KIAQRST1234567890', N'Đỏ', 2025, '2025-07-12T00:00:00.000', 20000, 1500000, 10000000, N'HOAT_DONG', N'Kia Carnival 7 chỗ', 0, '2026-09-19T13:10:10.000', '2026-10-07T16:56:25.000'),
    (7, 1, 2, N'XE0006', N'DEMO-G01', NULL, NULL, NULL, NULL, 15500, 500000, 3000000, N'HOAT_DONG', N'DEMO - xe mô phỏng đồ án; mã biển số không phải đăng ký thực tế', 0, '2026-10-12T23:02:02.000', '2026-10-12T23:02:02.000'),
    (9, 1, 2, N'XE0007', N'DEMO-N01', N'DEMO-N01', NULL, NULL, NULL, 10050, 600000, 4000000, N'HOAT_DONG', N'DEMO - xe mô phỏng đồ án; mã biển số không phải đăng ký thực tế', 0, '2026-10-12T23:02:55.000', '2026-10-13T07:44:23.000'),
    (10, 1, 2, N'XE0008', N'DEMO-E2E01', N'DEMO-E2E01', NULL, NULL, NULL, 1050, 650000, 5000000, N'HOAT_DONG', N'DEMO - xe mô phỏng đồ án, không có xe hay giao dịch thực tế', 0, '2026-10-13T10:16:17.000', '2026-10-13T10:18:04.000'),
    (11, 1, 2, N'XE0009', N'DEMO-E2E02', N'DEMO-E2E02', NULL, NULL, NULL, 1050, 650000, 5000000, N'HOAT_DONG', N'DEMO - xe mô phỏng đồ án, không có xe hay giao dịch thực tế', 0, '2026-10-13T10:18:05.000', '2026-10-13T10:19:05.000'),
    (12, 1, 2, N'XE0010', N'DEMO-E2E03', N'DEMO-E2E03', NULL, NULL, NULL, 1050, 650000, 5000000, N'HOAT_DONG', N'DEMO - xe mô phỏng đồ án, không có xe hay giao dịch thực tế', 0, '2026-10-13T10:19:07.000', '2026-10-13T10:19:08.000'),
    (13, 1, 2, N'XE0011', N'DEMO-HD01', N'DEMO-HD01', NULL, NULL, NULL, 2000, 700000, 3000000, N'HOAT_DONG', N'XE DEMO — Chưa xác minh xe thực tế hoặc tình trạng sẵn có tại chi nhánh. Biển số, số khung và số km là dữ liệu mô phỏng; đời xe và tiện nghi chưa có dữ liệu xác minh. Hãng, mẫu xe, số chỗ, hộp số, nhiên liệu, chi nhánh, giá thuê/ngày và tiền cọc được giữ theo thông tin đã cung cấp.', 0, '2026-10-13T10:51:54.000', '2026-10-13T10:51:54.000'),
    (14, 1, 2, N'XE0012', N'DEMO-HD02', N'DEMO-HD02', NULL, NULL, NULL, 2000, 700000, 3000000, N'HOAT_DONG', N'XE DEMO — Chưa xác minh xe thực tế hoặc tình trạng sẵn có tại chi nhánh. Biển số, số khung và số km là dữ liệu mô phỏng; đời xe và tiện nghi chưa có dữ liệu xác minh. Hãng, mẫu xe, số chỗ, hộp số, nhiên liệu, chi nhánh, giá thuê/ngày và tiền cọc được giữ theo thông tin đã cung cấp.', 0, '2026-10-13T10:51:56.000', '2026-10-13T10:51:56.000'),
    (15, 1, 2, N'XE0013', N'DEMO-HD03', N'DEMO-HD03', NULL, NULL, NULL, 2000, 700000, 3000000, N'HOAT_DONG', N'XE DEMO — Chưa xác minh xe thực tế hoặc tình trạng sẵn có tại chi nhánh. Biển số, số khung và số km là dữ liệu mô phỏng; đời xe và tiện nghi chưa có dữ liệu xác minh. Hãng, mẫu xe, số chỗ, hộp số, nhiên liệu, chi nhánh, giá thuê/ngày và tiền cọc được giữ theo thông tin đã cung cấp.', 0, '2026-10-13T10:51:57.000', '2026-10-13T10:51:57.000'),
    (17, 8, 3, N'XE0017', N'DEMO-0004', N'DEMO-VIN-00004', N'Tráº¯ng', NULL, NULL, 0, 1100000, 7000000, N'HOAT_DONG', N'Xe sedan hạng B tiết kiệm nhiên liệu, nội thất rộng rãi, phù hợp di chuyển gia đình.', 0, '2026-10-27T23:20:01.000', '2026-10-27T23:20:01.000'),
    (18, 11, 3, N'XE0018', N'DEMO-0005', N'DEMO-VIN-00005', N'Äen', NULL, NULL, 0, 1600000, 10000000, N'HOAT_DONG', N'Dòng SUV đô thị gầm cao hiện đại, trang bị camera 360, cảm biến an toàn vượt trội.', 0, '2026-10-27T23:20:01.000', '2026-10-27T23:20:01.000'),
    (19, 10, 1, N'XE0019', N'DEMO-0006', N'DEMO-VIN-00006', N'XÃ¡m', NULL, NULL, 12380, 1200000, 8000000, N'HOAT_DONG', N'XE DEMO — Chưa xác minh xe thực tế hoặc tình trạng sẵn có tại chi nhánh. Biển số, số khung và số km là dữ liệu mô phỏng; đời xe và tiện nghi chưa có dữ liệu xác minh. Hãng, mẫu xe, số chỗ, hộp số, nhiên liệu, chi nhánh, giá thuê/ngày và tiền cọc được giữ theo thông tin đã cung cấp.', 0, '2026-10-27T23:20:01.000', '2026-10-27T23:20:01.000'),
    (20, 6, 2, N'XE0016', N'DEMO-0003', N'DEMO-VIN-00003', N'Äen', NULL, NULL, 0, 1000000, 7000000, N'HOAT_DONG', N'MPV 7 chỗ đa dụng, hàng ghế rộng thoáng, điều hòa 2 vùng độc lập, rất thích hợp đi tour xa.', 0, '2026-10-27T23:20:01.000', '2026-10-27T23:20:01.000'),
    (21, 12, 2, N'XE0020', N'DEMO-0007', N'DEMO-VIN-00007', N'Äá»', NULL, NULL, 0, 900000, 6000000, N'HOAT_DONG', N'Crossover trẻ trung cá tính, màn hình giải trí sắc nét, kết nối Apple CarPlay không dây.', 0, '2026-10-27T23:20:01.000', '2026-10-27T23:20:01.000'),
    (22, 7, 1, N'XE0022', N'DEMO-0009', N'DEMO-VIN-00009', N'Báº¡c', NULL, NULL, 0, 950000, 6000000, N'HOAT_DONG', N'Mẫu MPV thế hệ mới với phong cách năng động, tiết kiệm nhiên liệu tối ưu.', 0, '2026-10-27T23:20:32.000', '2026-10-27T23:20:32.000'),
    (23, 9, 2, N'XE0021', N'DEMO-0008', N'DEMO-VIN-00008', N'Tráº¯ng', NULL, NULL, 0, 850000, 6000000, N'HOAT_DONG', N'SUV cỡ B đậm chất thể thao, gầm cao linh hoạt trên mọi cung đường đô thị.', 0, '2026-10-27T23:20:32.000', '2026-10-27T23:20:32.000');
GO
SET IDENTITY_INSERT [dbo].[Xe] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HinhAnhXe] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HinhAnhXe] ON;
GO
INSERT INTO [dbo].[HinhAnhXe] ([HinhAnhXeId], [XeId], [DuongDanAnh], [LaAnhChinh], [ThuTu], [MoTa], [NgayTao]) VALUES
    (1, 1, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-09-19T13:10:10.000'),
    (2, 2, N'/catalog-photos/toyotacorollacross-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-09-19T13:10:10.000'),
    (3, 3, N'/catalog-photos/hondacity-rs-2023.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-09-19T13:10:10.000'),
    (4, 4, N'/catalog-photos/hyundaicreta-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-09-19T13:10:10.000'),
    (5, 5, N'/catalog-photos/kiacarnival-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-09-19T13:10:10.000'),
    (6, 7, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (7, 9, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (8, 10, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (9, 11, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (10, 12, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (11, 13, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (12, 14, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (13, 15, N'/catalog-photos/toyotavios-2025.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:17:37.000'),
    (14, 20, N'/catalog-photos/hondabrv-2023.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:01.000'),
    (15, 17, N'/catalog-photos/hondahrv-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:01.000'),
    (16, 18, N'/catalog-photos/hyundaisantafe-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:01.000'),
    (17, 19, N'/catalog-photos/hyundaitucson-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:01.000'),
    (18, 21, N'/catalog-photos/kiaseltos-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:01.000'),
    (19, 22, N'/catalog-photos/toyotaveloz-2023.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:32.000'),
    (20, 23, N'/catalog-photos/toyotayariscross-2024.jpg', NULL, 1, N'áº¢nh minh há»a máº«u xe; khÃ´ng pháº£i áº£nh thá»±c táº¿ cá»§a xe táº¡i chi nhÃ¡nh', '2026-10-27T23:20:32.000');
GO
SET IDENTITY_INSERT [dbo].[HinhAnhXe] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[DonThue] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[DonThue] ON;
GO
INSERT INTO [dbo].[DonThue] ([DonThueId], [MaDonThue], [KhachHangId], [XeId], [ChiNhanhNhanId], [ChiNhanhTraId], [NguoiTaoId], [KenhDat], [ThoiGianNhan], [ThoiGianTraDuKien], [HanGiuDon], [DonGiaNgay], [SoNgayThue], [TienThue], [TienDichVu], [TienGiam], [TienPhiPhatSinh], [TienDatCocYeuCau], [TongTien], [TrangThai], [GhiChuKhach], [GhiChuNoiBo], [DaXoa], [NgayTao], [NgayCapNhat], [DaDoiSoatCoc], [NguoiDoiSoatCocId], [ThoiGianDoiSoatCoc], [NguonDuLieu]) VALUES
    (1, N'DT000001', 2, 5, 1, 1, 4, N'TRUC_TUYEN', '2026-09-22T02:47:48.000', '2026-09-23T17:00:00.000', '2026-09-22T03:20:37.000', 1500000, 2, 3000000, 250000, 0, 0, 10000000, 3250000, N'HOAN_THANH', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', NULL, 0, '2026-09-22T09:50:37.000', '2026-09-28T20:29:03.000', 0, NULL, NULL, N'CHUA_XAC_MINH'),
    (2, N'DT000002', 2, 4, 3, 3, 4, N'TRUC_TUYEN', '2026-09-29T04:00:00.000', '2026-10-01T04:00:00.000', '2026-09-28T14:29:20.000', 850000, 2, 1700000, 100000, 0, 0, 6000000, 1800000, N'DA_HUY', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', NULL, 0, '2026-09-28T20:59:20.000', '2026-09-28T21:00:21.000', 0, NULL, NULL, N'CHUA_XAC_MINH'),
    (3, N'DT000003', 2, 3, 2, 2, 4, N'TRUC_TUYEN', '2026-10-02T04:00:00.000', '2026-10-04T04:00:00.000', '2026-09-29T01:11:58.000', 700000, 2, 1400000, 150000, 0, 0, 5000000, 1550000, N'HET_HAN', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', NULL, 0, '2026-09-29T07:41:58.000', '2026-09-29T07:44:06.000', 0, NULL, NULL, N'CHUA_XAC_MINH'),
    (4, N'DT000004', 2, 1, 2, 2, 4, N'TRUC_TUYEN', '2026-09-30T04:00:00.000', '2026-10-01T04:00:00.000', '2026-09-29T01:17:44.000', 650000, 1, 650000, 180000, 0, 0, 5000000, 830000, N'CHO_TRA_XE', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', NULL, 0, '2026-09-29T07:47:44.000', '2026-10-07T17:00:32.000', 0, NULL, NULL, N'CHUA_XAC_MINH'),
    (5, N'DT000005', 2, 5, 1, 1, 4, N'TRUC_TUYEN', '2026-10-06T04:00:01.000', '2026-10-07T04:00:01.000', '2026-09-29T03:31:30.000', 1500000, 1, 1500000, 380000, 0, 0, 10000000, 1880000, N'CHO_TRA_XE', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', NULL, 0, '2026-09-29T10:01:30.000', '2026-10-07T16:56:25.000', 0, NULL, NULL, N'CHUA_XAC_MINH'),
    (6, N'DT000006', 2, 1, 1, 1, 4, N'TRUC_TUYEN', '2026-10-09T17:00:00.000', '2026-10-10T17:00:00.000', '2026-10-07T10:39:24.000', 650000, 1, 650000, 150000, 0, 300000, 5000000, 1100000, N'CHO_TRA_XE', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', NULL, 0, '2026-10-07T17:09:24.000', '2026-10-12T13:30:18.000', NULL, 1, '2026-10-12T13:30:18.000', N'CHUA_XAC_MINH'),
    (7, N'DT000007', 2, 2, 1, 1, 1, N'TAI_QUAY', '2031-11-12T10:00:00.000', '2031-11-14T10:00:00.000', '2026-10-07T16:44:00.000', 950000, 2, 1900000, 0, 0, 300000, 7000000, 2200000, N'HOAN_THANH', N'TEST LIVE 4.1.2 - xoa sau nghiem thu', NULL, 0, '2026-10-07T23:14:00.000', '2026-10-12T13:31:02.000', NULL, 1, '2026-10-12T13:30:53.000', N'CHUA_XAC_MINH'),
    (8, N'DT000008', 1, 3, 2, 2, 1, N'TAI_QUAY', '2032-02-10T10:00:00.000', '2032-02-12T10:00:00.000', '2026-10-07T16:53:00.000', 700000, 2, 1400000, 0, 0, 0, 5000000, 1400000, N'DA_HUY', N'TEST LIVE 4.1.2 transition smoke; cancel after test', NULL, 0, '2026-10-07T23:23:00.000', '2026-10-07T23:23:41.000', 0, NULL, NULL, N'CHUA_XAC_MINH'),
    (12, N'DT114BD8ADABF841FA', 8, 7, 2, 2, 1, N'TAI_QUAY', '2026-10-12T16:07:02.000', '2026-12-20T12:00:00.000', '2026-10-12T16:32:03.000', 500000, 69, 34500000, 0, 0, 200000, 3000000, 34700000, N'HOAN_THANH', N'DEMO-G01 - DEMO mô phỏng đồ án. Không có lượt thuê hay khoản tiền thực tế.', N'Đã hoàn cọc đợt 1: 3,000,000 VNĐ. Đang bảo lưu 2,000,000 VNĐ để đối soát phạt nguội. Thời hạn đối soát dự kiến: 15 ngày.', 0, '2026-10-12T23:02:03.000', '2026-11-10T17:06:24.000', NULL, NULL, '2026-11-10T17:06:24.000', N'DEMO'),
    (13, N'DT971DDAA21B7049E3', 9, 9, 2, 2, 1, N'TAI_QUAY', '2026-10-12T16:07:55.000', '2026-10-14T16:07:55.000', '2026-10-12T16:32:55.000', 600000, 2, 1200000, 0, 0, 100000, 4000000, 1300000, N'HOAN_THANH', N'DEMO-N01 - DEMO mô phỏng đồ án. Không có lượt thuê hay khoản tiền thực tế.', NULL, 0, '2026-10-12T23:02:55.000', '2026-10-13T07:44:26.000', NULL, 1, '2026-10-13T07:44:25.000', N'DEMO'),
    (15, N'DTF4981D90438D49E8', 10, 10, 2, 2, 6, N'TRUC_TUYEN', '2026-10-13T03:18:48.000', '2026-10-14T03:18:48.000', '2026-10-13T03:46:48.000', 650000, 2, 1300000, 0, 0, 0, 5000000, 1300000, N'HET_HAN', N'DEMO-E2E01 - DEMO mô phỏng đồ án, không giao xe hoặc thu chi tiền thực tế', NULL, 0, '2026-10-13T10:16:48.000', '2026-10-13T10:16:49.000', 0, NULL, NULL, N'DEMO'),
    (16, N'DTE39866785F694752', 10, 10, 2, 2, 6, N'TRUC_TUYEN', '2026-10-13T03:18:48.000', '2026-10-14T03:18:48.000', '2026-10-13T03:46:49.000', 650000, 2, 1300000, 0, 0, 0, 5000000, 1300000, N'HET_HAN', N'DEMO-E2E01 - DEMO mô phỏng đồ án, không giao xe hoặc thu chi tiền thực tế', NULL, 0, '2026-10-13T10:16:49.000', '2026-10-13T10:18:02.000', 0, NULL, NULL, N'DEMO'),
    (17, N'DT12621C8DF9F24060', 10, 10, 2, 2, 6, N'TRUC_TUYEN', '2026-10-13T10:20:02.000', '2026-10-14T10:20:02.000', '2026-10-13T10:48:03.000', 650000, 1, 650000, 0, 0, 0, 5000000, 650000, N'HOAN_THANH', N'DEMO-E2E01 - DEMO mô phỏng đồ án, không giao xe hoặc thu chi tiền thực tế', NULL, 0, '2026-10-13T10:18:03.000', '2026-10-13T10:18:05.000', NULL, 1, '2026-10-13T10:18:05.000', N'DEMO'),
    (18, N'DTDBF7BCD803BD491C', 10, 11, 2, 2, 6, N'TRUC_TUYEN', '2026-10-13T10:20:06.000', '2026-10-14T10:20:06.000', '2026-10-13T10:48:06.000', 650000, 1, 650000, 0, 0, 100000, 5000000, 750000, N'HOAN_THANH', N'DEMO-E2E02 - DEMO mô phỏng đồ án, không giao xe hoặc thu chi tiền thực tế', NULL, 0, '2026-10-13T10:18:06.000', '2026-10-13T10:19:06.000', NULL, 1, '2026-10-13T10:19:06.000', N'DEMO'),
    (19, N'DTEE30B7547DE947EE', 10, 12, 2, 2, 6, N'TRUC_TUYEN', '2026-10-13T10:21:07.000', '2026-10-14T10:21:07.000', '2026-10-13T10:49:07.000', 650000, 1, 650000, 0, 0, 0, 5000000, 650000, N'CHO_TRA_XE', N'DEMO-E2E03 - DEMO mô phỏng đồ án, không giao xe hoặc thu chi tiền thực tế', NULL, 0, '2026-10-13T10:19:07.000', '2026-10-13T10:19:08.000', 0, NULL, NULL, N'DEMO'),
    (20, N'DT991280A9EFF14110', 11, 13, 2, 2, 7, N'TRUC_TUYEN', '2026-10-15T10:51:54.000', '2026-10-16T10:51:54.000', '2026-10-13T11:21:55.000', 700000, 1, 700000, 0, 0, 0, 3000000, 700000, N'HET_HAN', N'DEMO-HD01 - mô phỏng ký hợp đồng, chưa có thuê xe hoặc giao dịch thực tế', N'Tự động hủy: Đơn thuê hết hạn giữ xe lúc 13/10/2026 11:21 do quá hạn nộp tiền cọc bảo đảm. Lịch xe đã được giải phóng.', 0, '2026-10-13T10:51:55.000', '2026-11-09T07:09:41.000', 0, NULL, NULL, N'DEMO'),
    (21, N'DT7CAB683840A745D8', 11, 14, 2, 2, 7, N'TRUC_TUYEN', '2026-10-15T10:51:56.000', '2026-10-16T10:51:56.000', '2026-10-13T11:21:56.000', 700000, 1, 700000, 0, 0, 0, 3000000, 700000, N'HET_HAN', N'DEMO-HD02 - mô phỏng ký hợp đồng, chưa có thuê xe hoặc giao dịch thực tế', N'Tự động hủy: Đơn thuê hết hạn giữ xe lúc 13/10/2026 11:21 do quá hạn nộp tiền cọc bảo đảm. Lịch xe đã được giải phóng.', 0, '2026-10-13T10:51:56.000', '2026-11-09T07:09:41.000', 0, NULL, NULL, N'DEMO'),
    (22, N'DT4377CB25425546F8', 11, 15, 2, 2, 7, N'TRUC_TUYEN', '2026-10-15T10:51:57.000', '2026-10-16T10:51:57.000', '2026-10-13T11:21:57.000', 700000, 1, 700000, 0, 0, 0, 3000000, 700000, N'DA_DAT_COC', N'DEMO-HD03 - mô phỏng ký hợp đồng, chưa có thuê xe hoặc giao dịch thực tế', NULL, 0, '2026-10-13T10:51:57.000', '2026-10-14T23:19:10.000', 0, NULL, NULL, N'DEMO'),
    (23, N'DT31ADE10833214220', 2, 12, 2, 2, 4, N'TRUC_TUYEN', '2026-10-31T11:00:01.000', '2026-11-01T11:00:01.000', '2026-10-30T21:15:21.000', 650000, 1, 650000, 0, 0, 0, 5000000, 650000, N'HET_HAN', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', N'Tự động hủy: Đơn thuê hết hạn giữ xe lúc 30/10/2026 21:15 do quá hạn nộp tiền cọc bảo đảm. Lịch xe đã được giải phóng.', 0, '2026-10-30T20:45:22.000', '2026-11-09T07:09:41.000', 0, NULL, NULL, N'DEMO'),
    (24, N'DTA229DB8495374DB8', 2, 19, 1, 1, 4, N'TRUC_TUYEN', '2026-11-03T11:00:01.000', '2026-11-04T11:00:01.000', '2026-11-09T07:43:39.000', 1200000, 1, 1200000, 0, 0, 200000, 8000000, 1400000, N'HOAN_THANH', N'Khách yêu cầu xe sạch sẽ, khử mùi thơm tho trước khi bàn giao.', N'Duyệt hồ sơ hợp lệ', 0, '2026-11-02T14:18:07.000', '2026-11-09T07:16:51.000', NULL, NULL, '2026-11-09T07:16:51.000', N'DEMO');
GO
SET IDENTITY_INSERT [dbo].[DonThue] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[DichVuDonThue] (7 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[DichVuDonThue] ON;
GO
INSERT INTO [dbo].[DichVuDonThue] ([DichVuDonThueId], [DonThueId], [DichVuId], [SoLuong], [DonGia], [ThanhTien]) VALUES
    (4, 4, 4, 1, 100000, 100000),
    (5, 4, 2, 1, 80000, 80000),
    (6, 5, 4, 1, 100000, 100000),
    (7, 5, 1, 1, 50000, 50000),
    (8, 5, 3, 1, 150000, 150000),
    (9, 5, 2, 1, 80000, 80000),
    (10, 6, 3, 1, 150000, 150000);
GO
SET IDENTITY_INSERT [dbo].[DichVuDonThue] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HopDongThue] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HopDongThue] ON;
GO
INSERT INTO [dbo].[HopDongThue] ([HopDongId], [DonThueId], [SoHopDong], [HoTenKhachSnapshot], [SoDienThoaiSnapshot], [CCCDSnapshot], [GPLXSnapshot], [TenXeSnapshot], [BienSoSnapshot], [ThoiGianNhan], [ThoiGianTra], [TongTien], [TienDatCoc], [DuongDanPDF], [NgayKy], [TrangThai], [NgayTao], [DieuKhoan], [YeuCauChuKyHaiBen], [KyHaiBenHoanTat]) VALUES
    (1, 4, N'HD1790692203450C1226312', N'tran duc huy', N'0987654321', NULL, NULL, N'Toyota Toyota Vios', N'89A-123.45', '2026-09-30T04:00:00.000', '2026-10-01T04:00:00.000', 830000, 5000000, NULL, '2026-09-29T21:30:17.000', N'DA_KY', '2026-09-29T21:30:03.000', NULL, 0, 0),
    (2, 5, N'HD1790696467400DB7A358E', N'tran duc huy', N'0987654321', NULL, NULL, N'Kia Kia Carnival', N'30L-567.89', '2026-10-06T04:00:01.000', '2026-10-07T04:00:01.000', 1880000, 10000000, NULL, '2026-09-29T22:41:19.000', N'DA_KY', '2026-09-29T22:41:08.000', NULL, 0, 0),
    (3, 6, N'HD17913678138715480623D', N'tran duc huy', N'0987654321', NULL, NULL, N'Toyota Toyota Vios', N'89A-123.45', '2026-10-09T17:00:00.000', '2026-10-10T17:00:00.000', 800000, 5000000, NULL, '2026-10-07T17:11:10.000', N'DA_KY', '2026-10-07T17:10:14.000', NULL, 0, 0),
    (4, 7, N'HD17913896830503BDA0D30', N'tran duc huy', N'0987654321', NULL, NULL, N'Toyota Toyota Corolla Cross', N'30K-234.56', '2031-11-12T10:00:00.000', '2031-11-14T10:00:00.000', 1900000, 7000000, NULL, '2026-10-07T23:14:43.000', N'DA_KY', '2026-10-07T23:14:43.000', NULL, 0, 0),
    (8, 12, N'HD17918209239077030798A', N'DEMO-G01 - Khách mô phỏng', N'0000000001', NULL, NULL, N'Toyota Vios', N'DEMO-G01', '2026-10-12T16:07:02.000', '2026-12-20T12:00:00.000', 34500000, 3000000, NULL, '2026-10-12T23:02:04.000', N'HOAN_THANH', '2026-10-12T23:02:04.000', N'DEMO-G01 - HỢP ĐỒNG DEMO MÔ PHỎNG ĐỒ ÁN. Không phải thỏa thuận thuê xe thực tế. Đơn vị và khách hàng đều là dữ liệu mô phỏng. Thời hạn thuê dự kiến 2 ngày, giá 500000 đồng/ngày, cọc 3000000 đồng. Giao/nhận ghi nhận số km, nhiên liệu và tình trạng xe. Phí phát sinh phải được xác nhận và đối soát riêng. Không có chữ ký hoặc chứng từ tiền thật.', 0, 0),
    (9, 13, N'HD1791820975144F032F434', N'DEMO-N01 - Khách mô phỏng', N'0000000002', NULL, NULL, N'Toyota Vios', N'DEMO-N01', '2026-10-12T16:07:55.000', '2026-10-14T16:07:55.000', 1200000, 4000000, NULL, '2026-10-12T23:02:56.000', N'DA_KY', '2026-10-12T23:02:55.000', N'DEMO-N01 - HỢP ĐỒNG DEMO MÔ PHỎNG ĐỒ ÁN. Không phải thỏa thuận thuê xe thực tế. Đơn vị và khách hàng đều là dữ liệu mô phỏng. Thời hạn thuê dự kiến 2 ngày, giá 600000 đồng/ngày, cọc 4000000 đồng. Giao/nhận ghi nhận số km, nhiên liệu và tình trạng xe. Phí phát sinh phải được xác nhận và đối soát riêng. Không có chữ ký hoặc chứng từ tiền thật.', 0, 0),
    (10, 17, N'HD1791861483408C2DE2B47', N'DEMO-E2E - Khách mô phỏng đồ án', N'0000000013', NULL, NULL, N'Toyota Vios', N'DEMO-E2E01', '2026-10-13T10:20:02.000', '2026-10-14T10:20:02.000', 650000, 5000000, NULL, '2026-10-13T10:18:04.000', N'DA_KY', '2026-10-13T10:18:03.000', N'DEMO-E2E01 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế.', 0, 0),
    (11, 18, N'HD17918614862547DCC61BD', N'DEMO-E2E - Khách mô phỏng đồ án', N'0000000013', NULL, NULL, N'Toyota Vios', N'DEMO-E2E02', '2026-10-13T10:20:06.000', '2026-10-14T10:20:06.000', 650000, 5000000, NULL, '2026-10-13T10:18:06.000', N'DA_KY', '2026-10-13T10:18:06.000', N'DEMO-E2E02 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế.', 0, 0),
    (12, 19, N'HD179186154731603756DA4', N'DEMO-E2E - Khách mô phỏng đồ án', N'0000000013', NULL, NULL, N'Toyota Vios', N'DEMO-E2E03', '2026-10-13T10:21:07.000', '2026-10-14T10:21:07.000', 650000, 5000000, NULL, '2026-10-13T10:19:07.000', N'DA_KY', '2026-10-13T10:19:07.000', N'DEMO-E2E03 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế.', 0, 0),
    (13, 20, N'HD1791863515101CF2239DC', N'DEMO-HD - Khách mô phỏng hợp đồng', N'0000000014', NULL, NULL, N'Toyota Vios', N'DEMO-HD01', '2026-10-15T10:51:54.000', '2026-10-16T10:51:54.000', 700000, 3000000, NULL, '2026-10-13T10:51:55.000', N'DA_HUY', '2026-10-13T10:51:55.000', N'1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.
2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.
3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.
4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.
5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.
6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.
7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.', NULL, 0),
    (14, 21, N'HD1791863516198898BF13A', N'DEMO-HD - Khách mô phỏng hợp đồng', N'0000000014', NULL, NULL, N'Toyota Vios', N'DEMO-HD02', '2026-10-15T10:51:56.000', '2026-10-16T10:51:56.000', 700000, 3000000, NULL, '2026-10-13T10:51:56.000', N'DA_HUY', '2026-10-13T10:51:56.000', N'1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.
2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.
3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.
4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.
5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.
6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.
7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.', NULL, 0),
    (15, 22, N'HD17918635172451A18CA0F', N'DEMO-HD - Khách mô phỏng hợp đồng', N'0000000014', NULL, NULL, N'Toyota Vios', N'DEMO-HD03', '2026-10-15T10:51:57.000', '2026-10-16T10:51:57.000', 700000, 3000000, NULL, '2026-10-13T10:51:57.000', N'DA_KY', '2026-10-13T10:51:57.000', N'1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.
2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.
3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.
4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.
5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.
6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.
7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.', NULL, NULL),
    (16, 8, N'HD00008A8', N'Trần Minh Anh', N'0901000003', N'001202000001', N'790123456789', N'Honda City', N'89A-345.67', '2032-02-10T10:00:00.000', '2032-02-12T10:00:00.000', 1400000, 5000000, NULL, '2026-10-07T23:23:00.000', N'DA_KY', '2026-10-07T23:23:00.000', NULL, NULL, NULL),
    (17, 1, N'HD00001A1', N'tran duc huy', N'0987654321', N'001200001234', N'B2-99887766', N'Kia Carnival', N'30L-567.89', '2026-09-22T02:47:48.000', '2026-09-23T17:00:00.000', 3250000, 10000000, NULL, '2026-09-22T09:50:37.000', N'DA_KY', '2026-09-22T09:50:37.000', NULL, NULL, NULL),
    (18, 2, N'HD00002A2', N'tran duc huy', N'0987654321', N'001200001234', N'B2-99887766', N'Hyundai Creta', N'99A-456.78', '2026-09-29T04:00:00.000', '2026-10-01T04:00:00.000', 1800000, 6000000, NULL, '2026-09-28T20:59:20.000', N'DA_KY', '2026-09-28T20:59:20.000', NULL, NULL, NULL),
    (19, 3, N'HD00003A3', N'tran duc huy', N'0987654321', N'001200001234', N'B2-99887766', N'Honda City', N'89A-345.67', '2026-10-02T04:00:00.000', '2026-10-04T04:00:00.000', 1550000, 5000000, NULL, '2026-09-29T07:41:58.000', N'DA_KY', '2026-09-29T07:41:58.000', NULL, NULL, NULL),
    (20, 23, N'HD00023A23', N'tran duc huy', N'0987654321', N'001200001234', N'B2-99887766', N'Toyota Vios', N'DEMO-E2E03', '2026-10-31T11:00:01.000', '2026-11-01T11:00:01.000', 650000, 5000000, NULL, '2026-10-30T20:45:22.000', N'DA_HUY', '2026-10-30T20:45:22.000', NULL, NULL, NULL),
    (21, 24, N'HD00024A24', N'tran duc huy', N'0987654321', N'001200001234', N'B2-99887766', N'Hyundai Tucson', N'DEMO-0006', '2026-11-03T11:00:01.000', '2026-11-04T11:00:01.000', 1200000, 8000000, NULL, '2026-11-09T07:13:39.000', N'HOAN_THANH', '2026-11-09T07:13:38.000', NULL, NULL, NULL),
    (22, 15, N'HD00015A15', N'DEMO-E2E - Khách mô phỏng đồ án', N'0000000013', N'001200001234', N'B2-99887766', N'Toyota Vios', N'DEMO-E2E01', '2026-10-13T03:18:48.000', '2026-10-14T03:18:48.000', 1300000, 5000000, NULL, '2026-10-13T10:16:48.000', N'DA_KY', '2026-10-13T10:16:48.000', NULL, NULL, NULL),
    (23, 16, N'HD00016A16', N'DEMO-E2E - Khách mô phỏng đồ án', N'0000000013', N'001200001234', N'B2-99887766', N'Toyota Vios', N'DEMO-E2E01', '2026-10-13T03:18:48.000', '2026-10-14T03:18:48.000', 1300000, 5000000, NULL, '2026-10-13T10:16:49.000', N'DA_KY', '2026-10-13T10:16:49.000', NULL, NULL, NULL);
GO
SET IDENTITY_INSERT [dbo].[HopDongThue] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HopDongPhienBan] (4 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HopDongPhienBan] ON;
GO
INSERT INTO [dbo].[HopDongPhienBan] ([PhienBanId], [HopDongId], [PhienBan], [NoiDung], [MaNoiDung], [NguoiDaiDienId], [NguoiTaoId], [NgayTao], [LyDo]) VALUES
    (1, 13, 1, N'{"ThongTin":{"SoHopDong":"HD1791863515101CF2239DC","PhienBan":1,"NgayLap":"2026-10-13T10:51:55+07:00","NguonDuLieu":"DEMO"},"BenA":{"TenDonVi":"CarRental - Đơn vị mô phỏng đồ án","ChiNhanh":"Chi nhánh Hưng Yên","DiaChi":"25 Nguyễn Văn Linh","SoDienThoai":"02213888888","NguoiDaiDienId":1,"HoTenDaiDien":"Quản trị viên"},"BenB":{"NguoiDungId":7,"HoTen":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoai":"0000000014","CCCD":null,"GPLX":null,"DiaChi":null},"Xe":{"TenXe":"Toyota Vios","BienSo":"DEMO-HD01","NhanXe":"2026-10-15T10:51:54+07:00","TraXe":"2026-10-16T10:51:54+07:00","DiaDiemNhan":"Chi nhánh Hưng Yên","DiaDiemTra":"Chi nhánh Hưng Yên"},"GiaTri":{"TienThue":700000,"TienCoc":3000000,"PhuongThuc":"Theo giao dịch được lập và xác nhận riêng trong hệ thống","NguyenTacPhi":"Phí phát sinh phải có căn cứ và biên bản; đối soát tiền cọc riêng, không mặc định là doanh thu."},"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.","XacThuc":"Chữ ký vẽ trên màn hình, ghi nhận bằng tài khoản đăng nhập; không phải chữ ký số có chứng thư số."}', N'DA7BCE565440E223BE4617343DF1ABC0A362E4391611C0426BB8E49534C1ABBF', 1, 1, '2026-10-13T10:51:55.000', N'DEMO-HD01 - chuẩn bị hồ sơ để người dùng tự ký'),
    (2, 14, 1, N'{"ThongTin":{"SoHopDong":"HD1791863516198898BF13A","PhienBan":1,"NgayLap":"2026-10-13T10:51:56+07:00","NguonDuLieu":"DEMO"},"BenA":{"TenDonVi":"CarRental - Đơn vị mô phỏng đồ án","ChiNhanh":"Chi nhánh Hưng Yên","DiaChi":"25 Nguyễn Văn Linh","SoDienThoai":"02213888888","NguoiDaiDienId":1,"HoTenDaiDien":"Quản trị viên"},"BenB":{"NguoiDungId":7,"HoTen":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoai":"0000000014","CCCD":null,"GPLX":null,"DiaChi":null},"Xe":{"TenXe":"Toyota Vios","BienSo":"DEMO-HD02","NhanXe":"2026-10-15T10:51:56+07:00","TraXe":"2026-10-16T10:51:56+07:00","DiaDiemNhan":"Chi nhánh Hưng Yên","DiaDiemTra":"Chi nhánh Hưng Yên"},"GiaTri":{"TienThue":700000,"TienCoc":3000000,"PhuongThuc":"Theo giao dịch được lập và xác nhận riêng trong hệ thống","NguyenTacPhi":"Phí phát sinh phải có căn cứ và biên bản; đối soát tiền cọc riêng, không mặc định là doanh thu."},"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.","XacThuc":"Chữ ký vẽ trên màn hình, ghi nhận bằng tài khoản đăng nhập; không phải chữ ký số có chứng thư số."}', N'3352E02B9DAB5E854E6E1389D918EF950A6707C081ADBA542224EE0DB9DD8633', 1, 1, '2026-10-13T10:51:57.000', N'DEMO-HD02 - chuẩn bị hồ sơ để người dùng tự ký'),
    (3, 15, 1, N'{"ThongTin":{"SoHopDong":"HD17918635172451A18CA0F","PhienBan":1,"NgayLap":"2026-10-13T10:51:57+07:00","NguonDuLieu":"DEMO"},"BenA":{"TenDonVi":"CarRental - Đơn vị mô phỏng đồ án","ChiNhanh":"Chi nhánh Hưng Yên","DiaChi":"25 Nguyễn Văn Linh","SoDienThoai":"02213888888","NguoiDaiDienId":1,"HoTenDaiDien":"Quản trị viên"},"BenB":{"NguoiDungId":7,"HoTen":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoai":"0000000014","CCCD":null,"GPLX":null,"DiaChi":null},"Xe":{"TenXe":"Toyota Vios","BienSo":"DEMO-HD03","NhanXe":"2026-10-15T10:51:57+07:00","TraXe":"2026-10-16T10:51:57+07:00","DiaDiemNhan":"Chi nhánh Hưng Yên","DiaDiemTra":"Chi nhánh Hưng Yên"},"GiaTri":{"TienThue":700000,"TienCoc":3000000,"PhuongThuc":"Theo giao dịch được lập và xác nhận riêng trong hệ thống","NguyenTacPhi":"Phí phát sinh phải có căn cứ và biên bản; đối soát tiền cọc riêng, không mặc định là doanh thu."},"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.","XacThuc":"Chữ ký vẽ trên màn hình, ghi nhận bằng tài khoản đăng nhập; không phải chữ ký số có chứng thư số."}', N'7B9B4EFEAB7E34970AD546AE3E0829B1E92BC3CC1125F2C583A6E178533B3063', 1, 1, '2026-10-13T10:51:57.000', N'DEMO-HD03 - chuẩn bị hồ sơ để người dùng tự ký'),
    (4, 15, 2, N'{"ThongTin":{"SoHopDong":"HD17918635172451A18CA0F","PhienBan":2,"NgayLap":"2026-10-13T10:51:57+07:00","NguonDuLieu":"DEMO"},"BenA":{"TenDonVi":"CarRental - Đơn vị mô phỏng đồ án","ChiNhanh":"Chi nhánh Hưng Yên","DiaChi":"25 Nguyễn Văn Linh","SoDienThoai":"02213888888","NguoiDaiDienId":1,"HoTenDaiDien":"Quản trị viên"},"BenB":{"NguoiDungId":7,"HoTen":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoai":"0000000014","CCCD":null,"GPLX":null,"DiaChi":null},"Xe":{"TenXe":"Toyota Vios","BienSo":"DEMO-HD03","NhanXe":"2026-10-15T10:51:57+07:00","TraXe":"2026-10-16T10:51:57+07:00","DiaDiemNhan":"Chi nhánh Hưng Yên","DiaDiemTra":"Chi nhánh Hưng Yên"},"GiaTri":{"TienThue":700000,"TienCoc":3000000,"PhuongThuc":"Theo giao dịch được lập và xác nhận riêng trong hệ thống","NguyenTacPhi":"Phí phát sinh phải có căn cứ và biên bản; đối soát tiền cọc riêng, không mặc định là doanh thu."},"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn.\n8. BỔ SUNG DEMO: Phiên bản 2 để minh họa lưu lịch sử; không kế thừa chữ ký bản cũ.","XacThuc":"Chữ ký vẽ trên màn hình, ghi nhận bằng tài khoản đăng nhập; không phải chữ ký số có chứng thư số."}', N'4963C989B3FFA5AD82BDE2723562D07D077DE6F1CBD709C79B0194DBD9A5BBBE', 1, 1, '2026-10-13T10:51:58.000', N'DEMO-HD03 - minh họa bản mới và lưu nguyên bản 1');
GO
SET IDENTITY_INSERT [dbo].[HopDongPhienBan] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HopDongChuKy] (3 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HopDongChuKy] ON;
GO
INSERT INTO [dbo].[HopDongChuKy] ([ChuKyId], [PhienBanId], [Ben], [NguoiKyId], [HoTenNguoiKy], [MaVaiTro], [NetKy], [MaNoiDung], [ThoiGianKy], [DiaChiIP]) VALUES
    (1, 4, N'BEN_A', 1, N'Quản trị viên', N'ADMIN', N'[[[0.34880956013997394,0.2188889397515191],[0.34880956013997394,0.22777777777777777],[0.34880956013997394,0.258888922797309],[0.34880956013997394,0.28111114501953127],[0.34880956013997394,0.29888907538519965],[0.34880956013997394,0.32555558946397567],[0.34761910211472286,0.3433335198296441],[0.3464285532633464,0.3611111111111111],[0.3464285532633464,0.37888895670572914],[0.3464285532633464,0.3922222561306424],[0.34523809523809523,0.4011111789279514],[0.34523809523809523,0.4144444783528646],[0.34523809523809523,0.42777777777777776],[0.34404763721284415,0.44555562337239585],[0.34166672116234187,0.45444454616970487],[0.3404761723109654,0.4722222222222222],[0.33809525626046316,0.4988889906141493],[0.33809525626046316,0.5122222900390625],[0.33809525626046316,0.5299999660915798],[0.3369047982352121,0.5433334350585938],[0.33571434020996094,0.5611111111111111],[0.33571434020996094,0.565555657280816],[0.3333333333333333,0.5744444105360244],[0.3333333333333333,0.5788889567057292]],[[0.4166666666666667,0.19666671752929688],[0.4166666666666667,0.23666670057508682],[0.4166666666666667,0.30333336724175347],[0.4166666666666667,0.3700000339084201],[0.4166666666666667,0.4322223239474826],[0.4166666666666667,0.45444454616970487],[0.4166666666666667,0.47666676839192706],[0.4166666666666667,0.4900000678168403],[0.41547620864141555,0.5122222900390625],[0.41190474373953684,0.5433334350585938],[0.40595236278715585,0.5877778795030382],[0.4035714467366536,0.6188888549804688],[0.4011905306861514,0.6366667005750868],[0.4011905306861514,0.6455556233723958]],[[0.34761910211472286,0.4633332994249132],[0.34761910211472286,0.45888892279730903],[0.34761910211472286,0.45],[0.35119047619047616,0.441111077202691],[0.35833331516810824,0.43666670057508683],[0.361904780069987,0.42777777777777776],[0.3654762449718657,0.42777777777777776],[0.37023807707287015,0.42777777777777776],[0.37619045802525114,0.42777777777777776],[0.388095219930013,0.42777777777777776],[0.3999999818347749,0.42777777777777776],[0.41190474373953684,0.42777777777777776],[0.4226190476190476,0.42777777777777776],[0.4321428934733073,0.42777777777777776],[0.43809527442568824,0.42777777777777776],[0.4428571973528181,0.42777777777777776],[0.4452381134033203,0.42777777777777776]],[[0.45000003633045016,0.4233334011501736],[0.45119049435570124,0.41888885498046874],[0.4523809523809524,0.41888885498046874],[0.4523809523809524,0.4233334011501736],[0.4523809523809524,0.42777777777777776],[0.4523809523809524,0.45],[0.4523809523809524,0.4855555216471354],[0.4523809523809524,0.5077777438693576],[0.4523809523809524,0.5211112128363715],[0.4535714104062035,0.5344445122612848],[0.45476195925758,0.5477778116861979],[0.4559524172828311,0.5566667344835069],[0.4559524172828311,0.5611111111111111],[0.45714287530808223,0.5611111111111111],[0.45952379135858445,0.5611111111111111],[0.4654761723109654,0.5611111111111111],[0.4714285532633464,0.5611111111111111],[0.4750000181652251,0.5611111111111111],[0.4797619410923549,0.5388888888888889],[0.48214285714285715,0.5166666666666667],[0.48333331516810824,0.4855555216471354],[0.48333331516810824,0.47666676839192706],[0.48333331516810824,0.4633332994249132],[0.48333331516810824,0.45888892279730903],[0.48333331516810824,0.45],[0.48333331516810824,0.44555562337239585],[0.4845238640194848,0.441111077202691],[0.48571432204473586,0.441111077202691],[0.486904780069987,0.45888892279730903],[0.486904780069987,0.4855555216471354],[0.486904780069987,0.5122222900390625],[0.486904780069987,0.5344445122612848],[0.4880952380952381,0.565555657280816],[0.4892856961204892,0.5788889567057292],[0.49285716102236793,0.5922222561306424],[0.49404761904761907,0.5966666327582465],[0.49642862592424664,0.6011111789279514],[0.49880954197474886,0.6011111789279514],[0.5035714649018788,0.5966666327582465],[0.5083333878290086,0.5788889567057292],[0.5119047619047619,0.5522221883138021],[0.5154762268066406,0.5299999660915798],[0.519047600882394,0.5122222900390625],[0.5214286077590216,0.49444444444444446],[0.5226190657842726,0.48111114501953123],[0.5226190657842726,0.4722222222222222],[0.5226190657842726,0.4633332994249132],[0.5238095238095238,0.45444454616970487],[0.5238095238095238,0.4633332994249132],[0.5238095238095238,0.4722222222222222],[0.5238095238095238,0.4988889906141493],[0.5249999818347749,0.5166666666666667],[0.5261905306861514,0.5299999660915798],[0.5273809887114025,0.5433334350585938],[0.5285714467366537,0.5433334350585938],[0.5333333696637835,0.5433334350585938],[0.5392857506161645,0.5299999660915798],[0.5440476735432943,0.5211112128363715],[0.5476190476190477,0.5077777438693576],[0.5500000544956752,0.49444444444444446],[0.5500000544956752,0.48111114501953123],[0.5500000544956752,0.47666676839192706],[0.5500000544956752,0.46777784559461805],[0.5500000544956752,0.45888892279730903],[0.5500000544956752,0.46777784559461805],[0.5500000544956752,0.4900000678168403],[0.5500000544956752,0.5566667344835069],[0.5488095056442988,0.6100001017252604],[0.5416666666666666,0.6677778455946181],[0.5345238276890346,0.7388888888888889],[0.5321429116385323,0.7611111111111111],[0.5285714467366537,0.7833333333333333],[0.5273809887114025,0.7877778795030382],[0.5226190657842726,0.7966666327582466],[0.519047600882394,0.8011111789279514],[0.5154762268066406,0.8011111789279514],[0.5130952199300131,0.8011111789279514],[0.5107143038795108,0.8011111789279514],[0.5095238458542597,0.8011111789279514],[0.5059523809523809,0.7966666327582466],[0.5047619229271298,0.7877778795030382],[0.5047619229271298,0.7611111111111111],[0.5059523809523809,0.7388888888888889],[0.5166666848318917,0.7077777438693577],[0.5261905306861514,0.6900000678168403],[0.5392857506161645,0.6677778455946181],[0.5511905125209263,0.658888922797309],[0.5595238095238095,0.641111077202691],[0.5654761904761905,0.6322223239474827],[0.5714285714285714,0.6188888549804688],[0.5738095783051991,0.6055555555555555],[0.5785714104062035,0.6011111789279514],[0.57976195925758,0.5922222561306424],[0.5845237913585845,0.5788889567057292],[0.5845237913585845,0.5744444105360244],[0.5857143402099609,0.5700000339084201]]]', N'4963C989B3FFA5AD82BDE2723562D07D077DE6F1CBD709C79B0194DBD9A5BBBE', '2026-10-14T23:08:56.000', N'::1'),
    (2, 4, N'BEN_B', 7, N'DEMO-HD - Khách mô phỏng hợp đồng', N'KHACHHANG', N'[[[0.34523809523809523,0.23666670057508682],[0.3464285532633464,0.24111116197374133],[0.3464285532633464,0.2455555386013455],[0.3464285532633464,0.2633333841959635],[0.34523809523809523,0.27666685316297746],[0.34523809523809523,0.29444444444444445],[0.342857179187593,0.31222220526801214],[0.34166672116234187,0.32555558946397567],[0.34166672116234187,0.3433335198296441],[0.3404761723109654,0.3611111111111111],[0.3392857142857143,0.3877778795030382],[0.3392857142857143,0.40555555555555556],[0.3369047982352121,0.42777777777777776],[0.3369047982352121,0.44555562337239585],[0.33571434020996094,0.45888892279730903],[0.33571434020996094,0.4722222222222222],[0.33571434020996094,0.4900000678168403],[0.33571434020996094,0.5033333672417535],[0.33571434020996094,0.5166666666666667],[0.33452379135858445,0.5344445122612848],[0.33452379135858445,0.5477778116861979],[0.3333333333333333,0.5611111111111111],[0.33214287530808223,0.565555657280816],[0.33214287530808223,0.5700000339084201],[0.33214287530808223,0.5433334350585938],[0.33214287530808223,0.4900000678168403],[0.33214287530808223,0.4633332994249132]],[[0.35119047619047616,0.16111111111111112],[0.3535714830671038,0.16111111111111112],[0.3535714830671038,0.17000003390842014],[0.3535714830671038,0.1788888719346788],[0.3547619410923549,0.19222225613064237],[0.355952399117606,0.20555555555555555],[0.35833331516810824,0.2188889397515191],[0.3595238640194848,0.23666670057508682],[0.36071432204473586,0.2455555386013455],[0.3630952380952381,0.2544446309407552],[0.3642856961204892,0.2677777608235677],[0.3666667029971168,0.28111114501953127],[0.36904761904761907,0.28999998304578994],[0.37023807707287015,0.30333336724175347],[0.37380954197474886,0.32111129760742185],[0.37619045802525114,0.33000005086263023],[0.3773810068766276,0.3388888888888889],[0.3785714649018787,0.35222227308485243],[0.37976192292712985,0.35222227308485243],[0.38214283897763207,0.35222227308485243],[0.3845238458542597,0.35222227308485243],[0.3892857687813895,0.35222227308485243],[0.39880952380952384,0.3477778116861979],[0.4083333696637835,0.32111129760742185],[0.41547620864141555,0.29444444444444445],[0.4261905125209263,0.2544446309407552],[0.4297618865966797,0.24111116197374133],[0.43095243544805617,0.23222240871853297],[0.4333333514985584,0.22333331637912326],[0.4333333514985584,0.2188889397515191],[0.4357142675490606,0.2188889397515191],[0.4392857324509394,0.22333331637912326],[0.4428571973528181,0.28111114501953127],[0.4440476553780692,0.3566666497124566],[0.4440476553780692,0.43666670057508683],[0.4440476553780692,0.5122222900390625],[0.4440476553780692,0.5344445122612848],[0.4440476553780692,0.5477778116861979],[0.4440476553780692,0.5522221883138021],[0.4440476553780692,0.5611111111111111]],[[0.4845238640194848,0.41888885498046874],[0.48571432204473586,0.41888885498046874],[0.486904780069987,0.44555562337239585],[0.4892856961204892,0.4855555216471354],[0.4892856961204892,0.5077777438693576],[0.4904762449718657,0.5344445122612848],[0.4916667029971168,0.5522221883138021],[0.49285716102236793,0.5700000339084201],[0.49642862592424664,0.5922222561306424],[0.5011904580252511,0.6055555555555555],[0.5107143038795108,0.6188888549804688],[0.5178571428571429,0.6188888549804688],[0.5249999818347749,0.6188888549804688],[0.5321429116385323,0.6011111789279514],[0.5369047437395368,0.5744444105360244],[0.5404762086414155,0.5477778116861979],[0.5416666666666666,0.5122222900390625],[0.5416666666666666,0.49444444444444446],[0.5416666666666666,0.4722222222222222],[0.5416666666666666,0.46777784559461805],[0.5416666666666666,0.4900000678168403],[0.5416666666666666,0.5122222900390625],[0.5416666666666666,0.5877778795030382],[0.5392857506161645,0.6722222222222223],[0.5309523627871559,0.756666734483507],[0.5238095238095238,0.8322223239474826],[0.5166666848318917,0.876666768391927],[0.5083333878290086,0.9077777438693576],[0.5023810068766276,0.9211112128363715],[0.49523807707287015,0.9211112128363715],[0.49404761904761907,0.9211112128363715],[0.486904780069987,0.9211112128363715],[0.4845238640194848,0.8988889906141493],[0.4845238640194848,0.8722222222222222],[0.4845238640194848,0.8366667005750869],[0.4880952380952381,0.8011111789279514],[0.5059523809523809,0.7700000339084201],[0.5309523627871559,0.7255555894639757],[0.5547618865966797,0.6855555216471354],[0.5738095783051991,0.6544445461697048],[0.5892857142857143,0.6233334011501737],[0.6011904761904762,0.6011111789279514],[0.6107143220447359,0.5788889567057292],[0.617857161022368,0.5566667344835069],[0.617857161022368,0.5522221883138021],[0.617857161022368,0.5477778116861979]]]', N'4963C989B3FFA5AD82BDE2723562D07D077DE6F1CBD709C79B0194DBD9A5BBBE', '2026-10-14T23:12:31.000', N'::1'),
    (3, 2, N'BEN_A', 1, N'Quản trị viên', N'ADMIN', N'[[[0.30357142857142855,0.23666670057508682],[0.30595243544805617,0.24111116197374133],[0.30595243544805617,0.31222220526801214],[0.30595243544805617,0.39666663275824654],[0.30595243544805617,0.4855555216471354],[0.30595243544805617,0.565555657280816],[0.30595243544805617,0.641111077202691],[0.30595243544805617,0.6944444444444444],[0.30595243544805617,0.7211112128363715],[0.30595243544805617,0.7299999660915799],[0.30595243544805617,0.7344445122612847],[0.30952380952380953,0.7122222900390625],[0.31309527442568824,0.65],[0.3190476553780692,0.5700000339084201],[0.32500003633045016,0.5077777438693576],[0.3273809523809524,0.45888892279730903],[0.3333333333333333,0.40555555555555556],[0.33809525626046316,0.3655557420518663],[0.3404761723109654,0.31666666666666665]],[[0.3500000181652251,0.1477778116861979],[0.35714285714285715,0.17444449530707465],[0.3654762449718657,0.22333331637912326],[0.37619045802525114,0.2722222222222222],[0.3845238458542597,0.31666666666666665],[0.39285714285714285,0.35222227308485243],[0.40238098871140254,0.4011111789279514],[0.4107142857142857,0.45],[0.41785712469191777,0.4900000678168403],[0.4261905125209263,0.5344445122612848],[0.4357142675490606,0.5744444105360244],[0.44047619047619047,0.6011111789279514],[0.44761902945382254,0.6011111789279514],[0.46666672116234187,0.6011111789279514],[0.49642862592424664,0.5877778795030382],[0.5416666666666666,0.5077777438693576],[0.5809524172828311,0.4100001017252604],[0.6107143220447359,0.3388888888888889],[0.6214286259242466,0.30333336724175347],[0.6214286259242466,0.29888907538519965],[0.6214286259242466,0.29444444444444445],[0.5392857506161645,0.37444449530707463],[0.4321428934733073,0.5344445122612848],[0.37023807707287015,0.65],[0.33809525626046316,0.7299999660915799],[0.33452379135858445,0.756666734483507],[0.33452379135858445,0.765555657280816],[0.34166672116234187,0.7744444105360243],[0.3654762449718657,0.7744444105360243],[0.4071429116385324,0.7122222900390625],[0.44047619047619047,0.6322223239474827],[0.45476195925758,0.5388888888888889],[0.45714287530808223,0.441111077202691],[0.448809578305199,0.3477778116861979]],[[0.5547618865966797,0.23666670057508682],[0.5166666848318917,0.22333331637912326],[0.47380956013997394,0.2544446309407552],[0.4333333514985584,0.35222227308485243],[0.41547620864141555,0.441111077202691],[0.4130952925909133,0.49444444444444446],[0.4130952925909133,0.5388888888888889],[0.41547620864141555,0.5566667344835069],[0.4226190476190476,0.565555657280816],[0.42857142857142855,0.565555657280816],[0.4369048164004371,0.5611111111111111],[0.4428571973528181,0.5433334350585938]]]', N'3352E02B9DAB5E854E6E1389D918EF950A6707C081ADBA542224EE0DB9DD8633', '2026-10-14T23:22:03.000', N'::1');
GO
SET IDENTITY_INSERT [dbo].[HopDongChuKy] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[BienBanGiaoNhan] (24 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[BienBanGiaoNhan] ON;
GO
INSERT INTO [dbo].[BienBanGiaoNhan] ([BienBanId], [DonThueId], [XeId], [NhanVienId], [ChiNhanhId], [LoaiBienBan], [ThoiGian], [SoKm], [MucNhienLieu], [TinhTrangNgoaiThat], [TinhTrangNoiThat], [GhiChu], [ChuKyKhach], [ChuKyNhanVien], [NgayTao]) VALUES
    (1, 5, 5, NULL, 1, N'GIAO_XE', '2026-10-07T16:54:36.000', 20000, 80.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T16:54:36.000'),
    (2, 5, 5, NULL, 1, N'NHAN_XE', '2026-10-07T16:56:25.000', 20000, 80.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T16:56:25.000'),
    (3, 4, 1, NULL, 2, N'GIAO_XE', '2026-10-07T16:59:43.000', 25000, 79.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T16:59:43.000'),
    (4, 4, 1, NULL, 2, N'NHAN_XE', '2026-10-07T17:00:32.000', 25010, 75.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T17:00:32.000'),
    (5, 6, 1, NULL, 1, N'GIAO_XE', '2026-10-07T17:14:58.000', 25010, 79.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T17:14:58.000'),
    (6, 6, 1, NULL, 1, N'NHAN_XE', '2026-10-07T17:19:17.000', 25020, 75.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T17:19:17.000'),
    (7, 7, 2, NULL, 1, N'GIAO_XE', '2026-10-07T23:18:11.000', 9801, 79.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T23:18:11.000'),
    (8, 7, 2, NULL, 1, N'NHAN_XE', '2026-10-07T23:21:08.000', 9810, 75.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-07T23:21:08.000'),
    (15, 13, 9, NULL, 2, N'GIAO_XE', '2026-10-12T23:02:57.000', 10000, 85.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-12T23:02:57.000'),
    (16, 13, 9, NULL, 2, N'NHAN_XE', '2026-10-13T07:44:23.000', 10050, 80.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T07:44:23.000'),
    (17, 17, 10, NULL, 2, N'GIAO_XE', '2026-10-13T10:18:04.000', 1000, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T10:18:04.000'),
    (18, 17, 10, NULL, 2, N'NHAN_XE', '2026-10-13T10:18:04.000', 1050, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T10:18:04.000'),
    (19, 18, 11, NULL, 2, N'GIAO_XE', '2026-10-13T10:18:07.000', 1000, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T10:18:07.000'),
    (20, 18, 11, NULL, 2, N'NHAN_XE', '2026-10-13T10:19:05.000', 1050, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T10:19:05.000'),
    (21, 19, 12, NULL, 2, N'GIAO_XE', '2026-10-13T10:19:08.000', 1000, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T10:19:08.000'),
    (22, 19, 12, NULL, 2, N'NHAN_XE', '2026-10-13T10:19:08.000', 1050, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-10-13T10:19:08.000'),
    (23, 1, 5, 1, 1, N'GIAO_XE', '2026-09-22T02:47:48.000', 18500, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-11-07T13:07:34.000'),
    (24, 2, 4, 1, 3, N'GIAO_XE', '2026-09-29T04:00:00.000', 18500, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-11-07T13:07:34.000'),
    (25, 3, 3, 1, 2, N'GIAO_XE', '2026-10-02T04:00:00.000', 18500, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-11-07T13:07:34.000'),
    (26, 8, 3, 1, 2, N'GIAO_XE', '2032-02-10T10:00:00.000', 18500, 100.00, N'Xe sạch đẹp, sơn bóng nguyên vẹn không vết trầy', N'Nội thất bọc da sạch sẽ, thơm mát, điều hòa hai vùng lạnh sâu', N'Bàn giao xe đúng giờ tại điểm hẹn, phụ tùng dự phòng đầy đủ', NULL, NULL, '2026-11-07T13:07:34.000'),
    (29, 24, 19, NULL, 1, N'GIAO_XE', '2026-11-09T07:14:12.000', 12050, 100.00, N'Ngoại thất sạch sẽ, không móp méo', N'Nội thất nguyên bản, đầy đủ phụ kiện', N'Giao xe sạch, đủ phụ tùng', NULL, NULL, '2026-11-09T07:14:12.000'),
    (30, 24, 19, NULL, 1, N'NHAN_XE', '2026-11-09T07:14:12.000', 12380, 90.00, N'Kiểm tra hoàn trả xe', N'Đã kiểm tra nội thất khi trả xe', N'Trả xe trễ 1h, bù xăng', NULL, NULL, '2026-11-09T07:14:12.000'),
    (31, 12, 7, NULL, 2, N'GIAO_XE', '2026-11-09T09:14:06.000', 15200, 100.00, N'Ngoại thất sạch sẽ, không móp méo', N'Nội thất nguyên bản, đầy đủ phụ kiện', N'Ban giao xe', NULL, NULL, '2026-11-09T09:14:06.000'),
    (32, 12, 7, NULL, 2, N'NHAN_XE', '2026-11-09T09:14:38.000', 15500, 95.00, N'Kiểm tra hoàn trả xe', N'Đã kiểm tra nội thất khi trả xe', N'Hao h?t 5% xang', NULL, NULL, '2026-11-09T09:14:38.000');
GO
SET IDENTITY_INSERT [dbo].[BienBanGiaoNhan] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HinhAnhGiaoNhan] (2 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HinhAnhGiaoNhan] ON;
GO
INSERT INTO [dbo].[HinhAnhGiaoNhan] ([HinhAnhGiaoNhanId], [BienBanId], [LoaiAnh], [DuongDanAnh], [MoTa], [NgayTao]) VALUES
    (1, 7, N'TRUOC', N'/uploads/handover/1791389890803-316165.png', NULL, '2026-10-07T23:18:11.000'),
    (2, 8, N'HU_HONG', N'/uploads/handover/1791390067847-455553.png', NULL, '2026-10-07T23:21:08.000');
GO
SET IDENTITY_INSERT [dbo].[HinhAnhGiaoNhan] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[HuHongXe] (4 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[HuHongXe] ON;
GO
INSERT INTO [dbo].[HuHongXe] ([HuHongId], [BienBanId], [XeId], [LoaiHuHong], [ViTri], [MoTa], [ChiPhiDuKien], [KhachChiuPhi], [TrangThai], [NgayTao]) VALUES
    (1, 6, 1, N'XUOC', N'cản trước', N'trầy cản trước', 30000, 300000, N'DA_XAC_NHAN', '2026-10-07T17:19:17.000'),
    (2, 8, 2, N'KHAC', N'Cản trước', N'Vết xước kiểm thử nghiệm thu ảnh và phí', 300000, 300000, N'DA_XAC_NHAN', '2026-10-07T23:21:08.000'),
    (4, 16, 9, N'XUOC', NULL, N'DEMO - phí xước mô phỏng, không có hư hỏng thực tế', 100000, 100000, N'DA_XAC_NHAN', '2026-10-13T07:44:23.000'),
    (5, 20, 11, N'XUOC', NULL, N'DEMO-E2E02 - vết xước mô phỏng', 100000, 100000, N'DA_XAC_NHAN', '2026-10-13T10:19:05.000');
GO
SET IDENTITY_INSERT [dbo].[HuHongXe] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[PhiPhatSinh] (4 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[PhiPhatSinh] ON;
GO
INSERT INTO [dbo].[PhiPhatSinh] ([PhiPhatSinhId], [DonThueId], [NguoiTaoId], [LoaiPhi], [MoTa], [SoTien], [TrangThai], [NgayTao], [HuHongId]) VALUES
    (1, 6, 1, N'HU_HONG', N'trầy cản trước (cản trước)', 300000, N'DA_THANH_TOAN', '2026-10-07T17:19:17.000', 1),
    (2, 7, 1, N'HU_HONG', N'Vết xước kiểm thử nghiệm thu ảnh và phí (Cản trước)', 300000, N'DA_THANH_TOAN', '2026-10-07T23:21:08.000', 2),
    (4, 13, 1, N'HU_HONG', N'DEMO - phí xước mô phỏng, không có hư hỏng thực tế', 100000, N'KHAU_TRU_COC', '2026-10-13T07:44:23.000', 4),
    (5, 18, 1, N'HU_HONG', N'DEMO-E2E02 - vết xước mô phỏng', 100000, N'KHAU_TRU_COC', '2026-10-13T10:19:05.000', 5);
GO
SET IDENTITY_INSERT [dbo].[PhiPhatSinh] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[ThanhToan] (52 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[ThanhToan] ON;
GO
INSERT INTO [dbo].[ThanhToan] ([ThanhToanId], [MaThanhToan], [DonThueId], [KhachHangId], [LoaiThanhToan], [PhuongThuc], [SoTien], [CongThanhToan], [MaGiaoDich], [MaIdempotency], [ThanhToanLienQuanId], [TrangThai], [ThoiGianThanhToan], [GhiChu], [NgayTao], [BienBanId], [HuHongId], [PhiPhatSinhId], [DaDoiSoatCoc], [NguoiDoiSoatId], [ThoiGianDoiSoat]) VALUES
    (1, N'TT1790697412987', 5, 2, N'TIEN_DAT_COC', N'TIEN_MAT', 10000000, NULL, NULL, N'8225526a-3b8b-45f9-b4c1-3fccdbf5cc26', NULL, N'THANH_CONG', '2026-10-01T00:25:03.000', N'Thanh toán TIEN_DAT_COC đơn DT000005', '2026-09-29T22:56:53.000', NULL, NULL, NULL, 0, NULL, NULL),
    (2, N'TT1791367032911', 4, 2, N'TIEN_DAT_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'5f8cd7c4-4392-4b7a-af95-b12898e4ebf7', NULL, N'THANH_CONG', '2026-10-07T16:58:54.000', N'Thanh toán TIEN_DAT_COC đơn DT000004', '2026-10-07T16:57:13.000', NULL, NULL, NULL, 0, NULL, NULL),
    (3, N'TT1791367881761', 6, 2, N'TIEN_DAT_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'dbaf3ea0-b528-405a-b586-0b3a1a8fa2a2', NULL, N'THANH_CONG', '2026-10-07T17:12:31.000', N'Thanh toán TIEN_DAT_COC đơn DT000006', '2026-10-07T17:11:22.000', NULL, NULL, NULL, 0, NULL, NULL),
    (4, N'TT1791389683214', 7, 2, N'TIEN_DAT_COC', N'TIEN_MAT', 7000000, NULL, NULL, N'36cb4c8a-0668-43c1-b76b-d54c46c230c9', NULL, N'THANH_CONG', '2026-10-07T23:14:43.000', N'TEST LIVE 4.1.2', '2026-10-07T23:14:43.000', NULL, NULL, NULL, 0, NULL, NULL),
    (5, N'TT1791391843137', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 400000, NULL, N'LIVE_CONFIRM_5', N'db28abed-ef4d-4952-8679-f8205ee0af48', NULL, N'THANH_CONG', '2026-10-08T00:05:00.000', N'PARTIAL 400k', '2026-10-07T23:50:43.000', NULL, NULL, NULL, 0, NULL, NULL),
    (6, N'TT1791391843729', 5, 2, N'TIEN_THUE', N'TIEN_MAT', 500000, NULL, NULL, N'1e73a557-9218-40a2-b624-20468769562d', NULL, N'THAT_BAI', NULL, N'PENDING 1', '2026-10-07T23:50:44.000', NULL, NULL, NULL, 0, NULL, NULL),
    (7, N'TT1791391844116', 7, 2, N'TIEN_THUE', N'TIEN_MAT', 600000, NULL, N'CONFIRM-600K', N'48cf144c-664c-4fc5-ad2e-9e3ae3df4bc8', NULL, N'THANH_CONG', '2026-10-07T23:52:51.000', N'CONC 1', '2026-10-07T23:50:44.000', NULL, NULL, NULL, 0, NULL, NULL),
    (8, N'TT1791391971608', 7, 2, N'TIEN_THUE', N'TIEN_MAT', 1, NULL, N'CONFIRM-LIVE-8', N'b0ae70a0-0308-4650-9180-004fb447abaf', NULL, N'THANH_CONG', '2026-10-08T00:01:54.000', N'AFTER_ZERO_7', '2026-10-07T23:52:52.000', NULL, NULL, NULL, 0, NULL, NULL),
    (9, N'TT1791392578111', 5, 2, N'TIEN_THUE', N'TIEN_MAT', 1, NULL, N'ATOMIC-LIVE-9', N'7e2f0a7b-b311-4481-af05-0f88a3131b03', NULL, N'THANH_CONG', '2026-10-08T00:07:17.000', N'LIVE_CHECK_1', '2026-10-08T00:02:58.000', NULL, NULL, NULL, 0, NULL, NULL),
    (10, N'TT1791392910074', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 1, NULL, N'ATOMIC-LIVE-10', N'4c316675-93f5-491b-bf84-8e8b0a27c9d1', NULL, N'THANH_CONG', '2026-10-08T00:08:31.000', N'ATOMIC_CONFIRM_LIVE_TEST', '2026-10-08T00:08:30.000', NULL, NULL, NULL, 0, NULL, NULL),
    (11, N'TT1791557770146', 5, 2, N'TIEN_THUE', N'TIEN_MAT', 400000, NULL, N'TEST-PT-1', N'f1499d51-db7f-420e-8289-36854bf050c9', NULL, N'THANH_CONG', '2026-10-09T21:57:08.000', NULL, '2026-10-09T21:56:10.000', NULL, NULL, NULL, 0, NULL, NULL),
    (12, N'TT1791557836806', 5, 2, N'TIEN_THUE', N'TIEN_MAT', 1479999, NULL, N'TEST-PT-FINAL', N'61b96c99-a957-460b-96d5-13279dd174ff', NULL, N'THANH_CONG', '2026-10-09T21:57:47.000', NULL, '2026-10-09T21:57:17.000', NULL, NULL, NULL, 0, NULL, NULL),
    (13, N'TT1791557886448', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 100000, NULL, N'TEST-CONC-OK', N'e4839f6f-e1ae-4495-952e-461db2ba6e35', NULL, N'THANH_CONG', '2026-10-09T21:58:21.000', NULL, '2026-10-09T21:58:07.000', NULL, NULL, NULL, 0, NULL, NULL),
    (14, N'TT1791557914107', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 100000, NULL, N'CONC-RACE-1', N'84c51967-06b2-4aa6-a0da-6425a401c88c', NULL, N'THANH_CONG', '2026-10-09T21:58:44.000', NULL, '2026-10-09T21:58:34.000', NULL, NULL, NULL, 0, NULL, NULL),
    (15, N'TT1791557932932', 7, 2, N'PHI_PHAT_SINH', N'TIEN_MAT', 300000, NULL, N'TEST-FEE-1', N'ecb9cf4d-4705-4903-ae01-bc9afa7e8409', NULL, N'THANH_CONG', '2026-10-09T21:59:10.000', NULL, '2026-10-09T21:58:53.000', NULL, NULL, NULL, 0, NULL, NULL),
    (16, N'TT1791558809574', 7, 2, N'TIEN_THUE', N'TIEN_MAT', 1000000, NULL, N'4.2F-DT7-PARTIAL', N'f53b2b76-df28-49e2-a79f-f45448978b37', NULL, N'THANH_CONG', '2026-10-09T22:14:52.000', N'4.2F partial confirm test', '2026-10-09T22:13:30.000', NULL, NULL, NULL, 0, NULL, NULL),
    (17, N'TT1791558920270', 7, 2, N'TIEN_THUE', N'TIEN_MAT', 299999, NULL, N'4.2F-DT7-FINAL', N'0c9bdad6-1745-4c45-93d0-f418d6d3dfc8', NULL, N'THANH_CONG', '2026-10-09T22:15:21.000', N'4.2F final confirm test', '2026-10-09T22:15:20.000', NULL, NULL, NULL, 0, NULL, NULL),
    (18, N'TT1791558938849', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 100000, NULL, N'4.2F-DT4-CONCURRENCY-R2', N'e1b889e5-70bf-44c4-b7db-a3aa0d9905f5', NULL, N'THANH_CONG', '2026-10-09T22:16:08.000', N'4.2F concurrent confirm test', '2026-10-09T22:15:39.000', NULL, NULL, NULL, 0, NULL, NULL),
    (19, N'TT1791559621578', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 50000, NULL, NULL, N'bc304e26-cd83-4258-93f0-c666a02bc60b', NULL, N'THAT_BAI', NULL, N'4.2G UI live partial', '2026-10-09T22:27:02.000', NULL, NULL, NULL, 0, NULL, NULL),
    (20, N'TT1791559823679', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 50000, NULL, NULL, N'cae1916d-bb6c-4964-9c06-9c981dc4fe98', NULL, N'THAT_BAI', NULL, N'4.2G UI live partial', '2026-10-09T22:30:24.000', NULL, NULL, NULL, 0, NULL, NULL),
    (21, N'TT1791560053798', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 50000, NULL, NULL, N'1dc8d2be-f16d-49c1-94ed-ef2cc1649e4a', NULL, N'THANH_CONG', '2026-10-09T22:34:14.000', N'4.2G UI live payment pass', '2026-10-09T22:34:14.000', NULL, NULL, NULL, 0, NULL, NULL),
    (22, N'TT1791560114134', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 10000, NULL, N'4.2G-CONCURRENT-1', N'932ad685-47dd-4c62-a9b9-5088ce42c25d', NULL, N'THANH_CONG', '2026-10-09T22:35:32.000', N'4.2G concurrency pending', '2026-10-09T22:35:14.000', NULL, NULL, NULL, 0, NULL, NULL),
    (23, N'TT1791560191107', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 10000, NULL, N'4.2G-CONCURRENT-RETEST-1', N'25e23e56-b3bc-4e1f-a818-59ddbeb359ce', NULL, N'THANH_CONG', '2026-10-09T22:36:44.000', N'4.2G concurrency retest', '2026-10-09T22:36:31.000', NULL, NULL, NULL, 0, NULL, NULL),
    (24, N'TT1791560222238', 4, 2, N'TIEN_THUE', N'TIEN_MAT', 59999, NULL, N'4.2G-DT4-FINAL', N'3ae338e4-d8ac-4499-bff8-d6d7bec3a80e', NULL, N'THANH_CONG', '2026-10-09T22:37:02.000', N'4.2G final payment', '2026-10-09T22:37:02.000', NULL, NULL, NULL, 0, NULL, NULL),
    (25, N'TT1791786606960', 6, 2, N'TIEN_THUE', N'TIEN_MAT', 800000, NULL, NULL, N'a0051b08-7e4e-4247-ad42-681218c71c80', NULL, N'THANH_CONG', '2026-10-12T13:30:08.000', N'Ghi nhận thanh toán TIEN_THUE đơn DT000006', '2026-10-12T13:30:07.000', NULL, NULL, NULL, 0, NULL, NULL);
GO
INSERT INTO [dbo].[ThanhToan] ([ThanhToanId], [MaThanhToan], [DonThueId], [KhachHangId], [LoaiThanhToan], [PhuongThuc], [SoTien], [CongThanhToan], [MaGiaoDich], [MaIdempotency], [ThanhToanLienQuanId], [TrangThai], [ThoiGianThanhToan], [GhiChu], [NgayTao], [BienBanId], [HuHongId], [PhiPhatSinhId], [DaDoiSoatCoc], [NguoiDoiSoatId], [ThoiGianDoiSoat]) VALUES
    (26, N'TT1791786611128', 6, 2, N'PHI_PHAT_SINH', N'TIEN_MAT', 300000, NULL, NULL, N'550f2851-c329-4659-9aab-34f7fc30f2e8', NULL, N'THANH_CONG', '2026-10-12T13:30:11.000', N'Ghi nhận thanh toán PHI_PHAT_SINH đơn DT000006', '2026-10-12T13:30:11.000', NULL, NULL, NULL, 0, NULL, NULL),
    (27, N'TTHC2277290F-741E-442F-9D57-0817CF01ED78', 6, 2, N'HOAN_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'03FA2F8C-53F8-436D-AC53-C4BE55C2C2FC', 3, N'CHO_THANH_TOAN', NULL, N'gdfg', '2026-10-12T13:30:28.000', NULL, NULL, NULL, NULL, 1, '2026-10-12T13:30:28.000'),
    (28, N'TTHC93B3B9A5-1603-4667-A2EE-DC091F628183', 7, 2, N'HOAN_COC', N'TIEN_MAT', 7000000, NULL, NULL, N'BFC097FB-4387-4387-8034-B688A9E47211', 4, N'DA_HOAN', '2026-10-12T13:31:02.000', N'vnbn', '2026-10-12T13:30:56.000', NULL, NULL, NULL, NULL, 1, '2026-10-12T13:30:56.000'),
    (41, N'TT1791820924507', 12, 8, N'TIEN_DAT_COC', N'TIEN_MAT', 3000000, NULL, NULL, N'df21f953-679d-4873-88d4-b8d2cec75666', NULL, N'THANH_CONG', '2026-10-12T23:02:05.000', N'DEMO-G01 - DEMO mô phỏng cọc, không nhận tiền thực tế', '2026-10-12T23:02:05.000', NULL, NULL, NULL, 0, NULL, NULL),
    (42, N'TT1791820975558', 13, 9, N'TIEN_DAT_COC', N'TIEN_MAT', 4000000, NULL, NULL, N'8515fea4-d96f-4f18-8f60-89bb7897df4c', NULL, N'THANH_CONG', '2026-10-12T23:02:56.000', N'DEMO-N01 - DEMO mô phỏng cọc, không nhận tiền thực tế', '2026-10-12T23:02:56.000', NULL, NULL, NULL, 0, NULL, NULL),
    (43, N'TT17918522636015434fa6c', 13, 9, N'TIEN_THUE', N'TIEN_MAT', 100000, NULL, NULL, N'229f41b1-0e9f-435b-8cef-b560c9d36104', NULL, N'THAT_BAI', NULL, N'DEMO-N01 - giao dịch mô phỏng thất bại để minh họa', '2026-10-13T07:44:24.000', NULL, NULL, NULL, 0, NULL, NULL),
    (44, N'TT17918522644311917b5e0', 13, 9, N'TIEN_THUE', N'TIEN_MAT', 1200000, NULL, NULL, N'6e8f5df0-b8af-42a9-9daf-653ce7bf1a18', NULL, N'THANH_CONG', '2026-10-13T07:44:25.000', N'DEMO-N01 - thu tiền thuê mô phỏng, không nhận tiền thực tế', '2026-10-13T07:44:24.000', NULL, NULL, NULL, 0, NULL, NULL),
    (45, N'TTKC1BBD0321-065F-48F5-A6D2-F39B62F53941', 13, 9, N'KHAU_TRU_COC', N'TIEN_MAT', 100000, NULL, NULL, N'F4438695-4F16-489A-A354-EC64924DC982', 42, N'THANH_CONG', '2026-10-13T07:44:25.000', N'Khấu trừ cọc: DEMO - phí xước mô phỏng, không có hư hỏng thực tế. DEMO-N01 - đối soát mô phỏng, khấu trừ phí mô phỏng 100.000 đồng', '2026-10-13T07:44:25.000', 16, 4, 4, NULL, 1, '2026-10-13T07:44:25.000'),
    (46, N'TTHCE71887C3-C244-498F-BEAE-4F2F9EA7C146', 13, 9, N'HOAN_COC', N'TIEN_MAT', 3900000, NULL, NULL, N'74D37FBB-1514-4AE1-B274-395611C45F1D', 42, N'DA_HOAN', '2026-10-13T07:44:26.000', N'DEMO-N01 - hoàn cọc mô phỏng, không chi tiền thực tế', '2026-10-13T07:44:25.000', NULL, NULL, NULL, NULL, 1, '2026-10-13T07:44:25.000'),
    (47, N'TT1791861483684fa1b932c', 17, 10, N'TIEN_DAT_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'7db99901-c372-40fc-88a2-e06487b7ac92', NULL, N'THANH_CONG', '2026-10-13T10:18:04.000', N'DEMO-E2E01 - tiền cọc mô phỏng', '2026-10-13T10:18:04.000', NULL, NULL, NULL, 0, NULL, NULL),
    (48, N'TT179186148451596940237', 17, 10, N'TIEN_THUE', N'TIEN_MAT', 650000, NULL, NULL, N'7a974950-7aa4-4258-b53e-1b9253a4c7fa', NULL, N'THANH_CONG', '2026-10-13T10:18:05.000', N'DEMO-E2E01 - tiền thuê mô phỏng', '2026-10-13T10:18:05.000', NULL, NULL, NULL, 0, NULL, NULL),
    (49, N'TTHCC3FFBA58-422F-445E-970E-B49CB8E564A1', 17, 10, N'HOAN_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'7B92148A-E041-4624-A277-5175AD38EC6E', 47, N'DA_HOAN', '2026-10-13T10:18:05.000', N'DEMO-E2E01 - hoàn cọc mô phỏng, không chi tiền thực tế', '2026-10-13T10:18:05.000', NULL, NULL, NULL, NULL, 1, '2026-10-13T10:18:05.000'),
    (50, N'TT1791861486410bf2b9d45', 18, 10, N'TIEN_DAT_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'e085cca5-9dff-478b-a0dc-f9750271173e', NULL, N'THANH_CONG', '2026-10-13T10:18:07.000', N'DEMO-E2E02 - tiền cọc mô phỏng', '2026-10-13T10:18:06.000', NULL, NULL, NULL, 0, NULL, NULL),
    (51, N'TT17918615456152d881121', 18, 10, N'TIEN_THUE', N'TIEN_MAT', 650000, NULL, NULL, N'e917fc4d-6c6d-4454-be6e-28e6ad534243', NULL, N'THANH_CONG', '2026-10-13T10:19:06.000', N'DEMO-E2E02 - tiền thuê mô phỏng', '2026-10-13T10:19:06.000', NULL, NULL, NULL, 0, NULL, NULL),
    (52, N'TTKC79672C1E-A0C5-43AA-938C-384D76BE3B26', 18, 10, N'KHAU_TRU_COC', N'TIEN_MAT', 100000, NULL, NULL, N'3F99852C-FEC5-4259-A0BB-5838EBF012F0', 50, N'THANH_CONG', '2026-10-13T10:19:06.000', N'Khấu trừ cọc: DEMO-E2E02 - vết xước mô phỏng. DEMO-E2E02 - đối soát mô phỏng', '2026-10-13T10:19:06.000', 20, 5, 5, NULL, 1, '2026-10-13T10:19:06.000'),
    (53, N'TTHCFEE60598-2D73-4306-B7ED-7FC7EEE7692B', 18, 10, N'HOAN_COC', N'TIEN_MAT', 4900000, NULL, NULL, N'85668B1A-AAB3-4A6D-BD93-F00208668E8D', 50, N'DA_HOAN', '2026-10-13T10:19:06.000', N'DEMO-E2E02 - hoàn cọc mô phỏng, không chi tiền thực tế', '2026-10-13T10:19:06.000', NULL, NULL, NULL, NULL, 1, '2026-10-13T10:19:06.000'),
    (54, N'TT1791861547492db705fc2', 19, 10, N'TIEN_DAT_COC', N'TIEN_MAT', 5000000, NULL, NULL, N'e9939f25-b99b-4674-8558-00a441fb11c4', NULL, N'THANH_CONG', '2026-10-13T10:19:08.000', N'DEMO-E2E03 - tiền cọc mô phỏng', '2026-10-13T10:19:08.000', NULL, NULL, NULL, 0, NULL, NULL),
    (55, N'TT1791861548290ff499f98', 19, 10, N'TIEN_THUE', N'TIEN_MAT', 100000, NULL, NULL, N'9f9ab279-695c-4acd-8b08-b0fd68447f9d', NULL, N'THAT_BAI', NULL, N'DEMO-E2E03 - thất bại mô phỏng', '2026-10-13T10:19:08.000', NULL, NULL, NULL, 0, NULL, NULL),
    (56, N'TT179186154848660e3587c', 19, 10, N'TIEN_THUE', N'TIEN_MAT', 300000, NULL, NULL, N'378830f6-746d-44da-a21d-612c6aa2f8ac', NULL, N'THANH_CONG', '2026-10-13T10:19:09.000', N'DEMO-E2E03 - tiền thuê mô phỏng', '2026-10-13T10:19:09.000', NULL, NULL, NULL, 0, NULL, NULL),
    (57, N'TT1791994723035acc28c2c', 22, 11, N'TIEN_DAT_COC', N'TIEN_MAT', 3000000, NULL, NULL, N'8d7f3f9c-cb81-4c80-8fab-3dce3b5efd65', NULL, N'THANH_CONG', '2026-10-14T23:19:10.000', N'DEMO - kiểm thử hợp đồng đủ hai chữ ký; giao dịch chờ xác nhận, chưa thu tiền thực tế', '2026-10-14T23:18:43.000', NULL, NULL, NULL, 0, NULL, NULL),
    (60, N'PAY-DEP-20261109071338', 24, 2, N'TIEN_DAT_COC', N'CHUYEN_KHOAN', 5000000, NULL, N'DEP-8D4E12C7', NULL, NULL, N'THANH_CONG', '2026-11-09T07:13:39.000', NULL, '2026-11-09T07:13:39.000', NULL, NULL, NULL, 0, NULL, NULL),
    (63, N'PAY-FINAL-20261109071649', 24, 2, N'TIEN_THUE', N'CHUYEN_KHOAN', 1500000, NULL, N'FIN-C0361273', N'IDEMP-FIN-8ab1fd9d4777441db52c80cddf2f65ae', NULL, N'THANH_CONG', '2026-11-09T07:16:49.000', NULL, '2026-11-09T07:16:49.000', NULL, NULL, NULL, 0, NULL, NULL),
    (64, N'REFUND-20261109071650', 24, 2, N'HOAN_COC', N'CHUYEN_KHOAN', 4800000, NULL, N'REF-32E6F50A', N'IDEMP-REF-a19f56031ac74db0834adc60ebfeb924', NULL, N'THANH_CONG', '2026-11-09T07:16:50.000', NULL, '2026-11-09T07:16:50.000', NULL, NULL, NULL, NULL, NULL, NULL),
    (65, N'PAY-FINAL-20261109091438', 12, 8, N'TIEN_THUE', N'CHUYEN_KHOAN', 34700000, NULL, N'FIN-331DECCE', N'IDEMP-FIN-e33e46f2d99948a698ce9c089359bd24', NULL, N'THANH_CONG', '2026-11-09T09:14:39.000', NULL, '2026-11-09T09:14:39.000', NULL, NULL, NULL, 0, NULL, NULL),
    (68, N'REF-P1-20261109091706', 12, 8, N'HOAN_COC', N'CHUYEN_KHOAN', 3000000, NULL, N'REF1-8C4B83FE', N'IDEMP-REF1-17f5c4dbb2244ea2a8f64e685217d6d8', NULL, N'THANH_CONG', '2026-11-09T09:17:06.000', N'Hoàn cọc đợt 1. Bảo lưu 2,000,000 VNĐ chờ đối soát phạt nguội CSGT trong 15 ngày.', '2026-11-09T09:17:06.000', NULL, NULL, NULL, 0, NULL, NULL);
GO
INSERT INTO [dbo].[ThanhToan] ([ThanhToanId], [MaThanhToan], [DonThueId], [KhachHangId], [LoaiThanhToan], [PhuongThuc], [SoTien], [CongThanhToan], [MaGiaoDich], [MaIdempotency], [ThanhToanLienQuanId], [TrangThai], [ThoiGianThanhToan], [GhiChu], [NgayTao], [BienBanId], [HuHongId], [PhiPhatSinhId], [DaDoiSoatCoc], [NguoiDoiSoatId], [ThoiGianDoiSoat]) VALUES
    (73, N'FINE-20261110170624', 12, 8, N'KHAU_TRU_COC', N'CHUYEN_KHOAN', 500000, NULL, N'FINE-429B6A16', N'IDEMP-FINE-3784e30a779745e4a430939515ce8f95', NULL, N'THANH_CONG', '2026-11-10T17:06:24.000', N'Khấu trừ vi phạm giao thông / phạt nguội: Phat nguoi loi qua toc do tai cao toc', '2026-11-10T17:06:24.000', NULL, NULL, NULL, NULL, NULL, NULL),
    (74, N'REF-P2-20261110170624', 12, 8, N'HOAN_COC', N'CHUYEN_KHOAN', 1500000, NULL, N'REF2-8B007238', N'IDEMP-REF2-9e24841c5a6d407ab86e166b219cc24e', NULL, N'THANH_CONG', '2026-11-10T17:06:24.000', N'Hoàn trả số tiền bảo lưu phạt nguội đợt 2 sau 15 ngày đối soát sạch vi phạm giao thông.', '2026-11-10T17:06:24.000', NULL, NULL, NULL, NULL, NULL, NULL);
GO
SET IDENTITY_INSERT [dbo].[ThanhToan] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[BaoTri] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[BaoTri] ON;
GO
INSERT INTO [dbo].[BaoTri] ([BaoTriId], [XeId], [ChiNhanhId], [NhanVienId], [LoaiBaoTri], [MoTa], [ThoiGianBatDau], [ThoiGianDuKienKetThuc], [ThoiGianKetThucThucTe], [SoKmBaoTri], [ChiPhi], [TrangThai], [GhiChu], [NgayTao], [NgayCapNhat]) VALUES
    (3, 1, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-11-02T13:07:35.000', '2026-11-04T13:07:35.000', '2026-11-04T13:07:35.000', 25020, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-11-02T13:07:35.000', '2026-11-04T13:07:35.000'),
    (4, 2, 1, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-30T13:07:35.000', '2026-11-01T13:07:35.000', '2026-11-01T13:07:35.000', 9810, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-30T13:07:35.000', '2026-11-01T13:07:35.000'),
    (5, 3, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-27T13:07:35.000', '2026-10-29T13:07:35.000', '2026-10-29T13:07:35.000', 14300, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-27T13:07:35.000', '2026-10-29T13:07:35.000'),
    (6, 4, 3, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-24T13:07:35.000', '2026-10-26T13:07:35.000', '2026-10-26T13:07:35.000', 6200, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-24T13:07:35.000', '2026-10-26T13:07:35.000'),
    (7, 5, 1, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-21T13:07:35.000', '2026-10-23T13:07:35.000', '2026-10-23T13:07:35.000', 20000, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-21T13:07:35.000', '2026-10-23T13:07:35.000'),
    (8, 7, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-15T13:07:35.000', '2026-10-17T13:07:35.000', '2026-10-17T13:07:35.000', 10000, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-15T13:07:35.000', '2026-10-17T13:07:35.000'),
    (9, 9, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-09T13:07:35.000', '2026-10-11T13:07:35.000', '2026-10-11T13:07:35.000', 10050, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-09T13:07:35.000', '2026-10-11T13:07:35.000'),
    (10, 10, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-06T13:07:35.000', '2026-10-08T13:07:35.000', '2026-10-08T13:07:35.000', 1050, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-06T13:07:35.000', '2026-10-08T13:07:35.000'),
    (11, 11, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-10-03T13:07:35.000', '2026-10-05T13:07:35.000', '2026-10-05T13:07:35.000', 1050, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-10-03T13:07:35.000', '2026-10-05T13:07:35.000'),
    (12, 12, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-30T13:07:35.000', '2026-10-02T13:07:35.000', '2026-10-02T13:07:35.000', 1050, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-30T13:07:35.000', '2026-10-02T13:07:35.000'),
    (13, 13, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-27T13:07:35.000', '2026-09-29T13:07:35.000', '2026-09-29T13:07:35.000', 2000, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-27T13:07:35.000', '2026-09-29T13:07:35.000'),
    (14, 14, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-24T13:07:35.000', '2026-09-26T13:07:35.000', '2026-09-26T13:07:35.000', 2000, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-24T13:07:35.000', '2026-09-26T13:07:35.000'),
    (15, 15, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-21T13:07:35.000', '2026-09-23T13:07:35.000', '2026-09-23T13:07:35.000', 2000, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-21T13:07:35.000', '2026-09-23T13:07:35.000'),
    (16, 17, 3, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-15T13:07:35.000', '2026-09-17T13:07:35.000', '2026-09-17T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-15T13:07:35.000', '2026-09-17T13:07:35.000'),
    (17, 18, 3, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-12T13:07:35.000', '2026-09-14T13:07:35.000', '2026-09-14T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-12T13:07:35.000', '2026-09-14T13:07:35.000'),
    (18, 19, 1, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-09T13:07:35.000', '2026-09-11T13:07:35.000', '2026-09-11T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-09T13:07:35.000', '2026-09-11T13:07:35.000'),
    (19, 20, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-06T13:07:35.000', '2026-09-08T13:07:35.000', '2026-09-08T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-06T13:07:35.000', '2026-09-08T13:07:35.000'),
    (20, 21, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-09-03T13:07:35.000', '2026-09-05T13:07:35.000', '2026-09-05T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-09-03T13:07:35.000', '2026-09-05T13:07:35.000'),
    (21, 22, 1, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-08-31T13:07:35.000', '2026-09-02T13:07:35.000', '2026-09-02T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-08-31T13:07:35.000', '2026-09-02T13:07:35.000'),
    (22, 23, 2, 1, N'BAO_DUONG_DINH_KY', N'Bảo dưỡng cấp 2 (20.000km): Thay dầu động cơ nhớt tổng hợp, lọc nhớt, lọc gió động cơ, kiểm tra hệ thống phanh ABS và cân mâm 4 bánh', '2026-08-28T13:07:35.000', '2026-08-30T13:07:35.000', '2026-08-30T13:07:35.000', 0, 1500000, N'HOAN_THANH', N'Xe vận hành trơn tru, phanh ăn, áp suất lốp chuẩn tiêu chuẩn nhà sản xuất', '2026-08-28T13:07:35.000', '2026-08-30T13:07:35.000');
GO
SET IDENTITY_INSERT [dbo].[BaoTri] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[DanhGia] (20 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[DanhGia] ON;
GO
INSERT INTO [dbo].[DanhGia] ([DanhGiaId], [DonThueId], [KhachHangId], [XeId], [SoSao], [TieuDe], [NoiDung], [PhanHoiNhanVien], [ThoiGianPhanHoi], [HienThi], [NgayTao], [NgayCapNhat]) VALUES
    (1, 1, 2, 5, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-09-23T19:00:00.000', NULL, '2026-09-23T17:00:00.000', '2026-09-23T17:00:00.000'),
    (2, 2, 2, 4, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-01T06:00:00.000', NULL, '2026-10-01T04:00:00.000', '2026-10-01T04:00:00.000'),
    (3, 3, 2, 3, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-04T06:00:00.000', NULL, '2026-10-04T04:00:00.000', '2026-10-04T04:00:00.000'),
    (4, 4, 2, 1, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-01T06:00:00.000', NULL, '2026-10-01T04:00:00.000', '2026-10-01T04:00:00.000'),
    (5, 5, 2, 5, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-07T06:00:01.000', NULL, '2026-10-07T04:00:01.000', '2026-10-07T04:00:01.000'),
    (6, 6, 2, 1, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-10T19:00:00.000', NULL, '2026-10-10T17:00:00.000', '2026-10-10T17:00:00.000'),
    (7, 7, 2, 2, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2031-11-14T12:00:00.000', NULL, '2031-11-14T10:00:00.000', '2031-11-14T10:00:00.000'),
    (8, 8, 1, 3, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Test', '2026-11-10T17:31:58.000', NULL, '2032-02-12T10:00:00.000', '2026-11-10T17:31:58.000'),
    (9, 12, 8, 7, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T18:07:02.000', NULL, '2026-10-14T16:07:02.000', '2026-10-14T16:07:02.000'),
    (10, 13, 9, 9, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T18:07:55.000', NULL, '2026-10-14T16:07:55.000', '2026-10-14T16:07:55.000'),
    (11, 15, 10, 10, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T05:18:48.000', NULL, '2026-10-14T03:18:48.000', '2026-10-14T03:18:48.000'),
    (12, 16, 10, 10, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T05:18:48.000', NULL, '2026-10-14T03:18:48.000', '2026-10-14T03:18:48.000'),
    (13, 17, 10, 10, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T12:20:02.000', NULL, '2026-10-14T10:20:02.000', '2026-10-14T10:20:02.000'),
    (14, 18, 10, 11, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T12:20:06.000', NULL, '2026-10-14T10:20:06.000', '2026-10-14T10:20:06.000'),
    (15, 19, 10, 12, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-14T12:21:07.000', NULL, '2026-10-14T10:21:07.000', '2026-10-14T10:21:07.000'),
    (16, 20, 11, 13, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-16T12:51:54.000', NULL, '2026-10-16T10:51:54.000', '2026-10-16T10:51:54.000'),
    (17, 21, 11, 14, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-16T12:51:56.000', NULL, '2026-10-16T10:51:56.000', '2026-10-16T10:51:56.000'),
    (18, 22, 11, 15, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-10-16T12:51:57.000', NULL, '2026-10-16T10:51:57.000', '2026-10-16T10:51:57.000'),
    (19, 23, 2, 12, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-11-01T13:00:01.000', NULL, '2026-11-01T11:00:01.000', '2026-11-01T11:00:01.000'),
    (20, 24, 2, 19, 5, N'Dịch vụ xuất sắc vượt mong đợi', N'Xe chạy rất đầm và êm ái, sạch sẽ như mới xuất xưởng, tiết kiệm xăng. Thủ tục giao nhận xe nhanh chóng trong 5 phút. Sẽ tiếp tục ủng hộ!', N'Cảm ơn quý khách đã tin tưởng và đồng hành cùng dịch vụ thuê xe của chúng tôi!', '2026-11-04T13:00:01.000', NULL, '2026-11-04T11:00:01.000', '2026-11-04T11:00:01.000');
GO
SET IDENTITY_INSERT [dbo].[DanhGia] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[LichSuTrangThaiDon] (90 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[LichSuTrangThaiDon] ON;
GO
INSERT INTO [dbo].[LichSuTrangThaiDon] ([LichSuId], [DonThueId], [TrangThaiCu], [TrangThaiMoi], [NguoiThucHienId], [LyDo], [NgayThucHien]) VALUES
    (1, 1, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 5, NULL, '2026-09-22T10:09:30.000'),
    (2, 1, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, NULL, '2026-09-24T11:42:32.000'),
    (3, 1, N'DA_DAT_COC', N'SAN_SANG_GIAO', 1, NULL, '2026-09-28T20:28:52.000'),
    (4, 1, N'SAN_SANG_GIAO', N'DANG_THUE', 1, NULL, '2026-09-28T20:28:57.000'),
    (5, 1, N'DANG_THUE', N'CHO_TRA_XE', 1, NULL, '2026-09-28T20:29:00.000'),
    (6, 1, N'CHO_TRA_XE', N'HOAN_THANH', 1, NULL, '2026-09-28T20:29:03.000'),
    (7, 2, N'CHO_XAC_NHAN', N'DA_HUY', 4, N'Khách hủy đơn', '2026-09-28T21:00:21.000'),
    (8, 4, NULL, N'CHO_XAC_NHAN', 4, N'Tạo đơn thuê', '2026-09-29T07:47:44.000'),
    (9, 4, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, NULL, '2026-09-29T07:48:42.000'),
    (10, 5, NULL, N'CHO_XAC_NHAN', 4, N'Tạo đơn thuê', '2026-09-29T10:01:30.000'),
    (11, 5, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, NULL, '2026-09-29T10:40:09.000'),
    (12, 5, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-07T16:54:36.000'),
    (13, 5, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ đối soát', '2026-10-07T16:56:25.000'),
    (14, 4, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-07T16:59:43.000'),
    (15, 4, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ đối soát', '2026-10-07T17:00:32.000'),
    (16, 6, NULL, N'CHO_XAC_NHAN', 4, N'Tạo đơn thuê', '2026-10-07T17:09:25.000'),
    (17, 6, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-07T17:14:58.000'),
    (18, 6, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ đối soát', '2026-10-07T17:19:17.000'),
    (19, 7, NULL, N'CHO_XAC_NHAN', 1, N'Tạo đơn thuê', '2026-10-07T23:14:01.000'),
    (20, 7, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-07T23:18:11.000'),
    (21, 7, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ đối soát', '2026-10-07T23:21:08.000'),
    (22, 8, NULL, N'CHO_XAC_NHAN', 1, N'Tạo đơn thuê', '2026-10-07T23:23:00.000'),
    (23, 8, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'Smoke test route transition after fix', '2026-10-07T23:23:41.000'),
    (24, 8, N'DA_XAC_NHAN', N'DA_HUY', 1, N'Ket thuc don smoke test transition', '2026-10-07T23:23:41.000'),
    (25, 7, N'CHO_TRA_XE', N'HOAN_THANH', 1, N'Đã hoàn cọc và hoàn tất đơn thuê', '2026-10-12T13:31:02.000');
GO
INSERT INTO [dbo].[LichSuTrangThaiDon] ([LichSuId], [DonThueId], [TrangThaiCu], [TrangThaiMoi], [NguoiThucHienId], [LyDo], [NgayThucHien]) VALUES
    (47, 12, NULL, N'CHO_XAC_NHAN', 1, N'Tạo đơn thuê', '2026-10-12T23:02:03.000'),
    (48, 12, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-G01 - xác nhận mô phỏng', '2026-10-12T23:02:04.000'),
    (49, 12, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, N'Thu đủ tiền đặt cọc', '2026-10-12T23:02:05.000'),
    (50, 12, N'DA_DAT_COC', N'SAN_SANG_GIAO', 1, N'DEMO-G01 - sẵn sàng giao mô phỏng', '2026-10-12T23:02:05.000'),
    (51, 13, NULL, N'CHO_XAC_NHAN', 1, N'Tạo đơn thuê', '2026-10-12T23:02:55.000'),
    (52, 13, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-N01 - xác nhận mô phỏng', '2026-10-12T23:02:55.000'),
    (53, 13, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, N'Thu đủ tiền đặt cọc', '2026-10-12T23:02:56.000'),
    (54, 13, N'DA_DAT_COC', N'SAN_SANG_GIAO', 1, N'DEMO-N01 - sẵn sàng giao mô phỏng', '2026-10-12T23:02:56.000'),
    (55, 13, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-12T23:02:57.000'),
    (56, 13, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ thanh toán và đối soát', '2026-10-13T07:44:23.000'),
    (57, 13, N'CHO_TRA_XE', N'HOAN_THANH', 1, N'Đã hoàn cọc và hoàn tất đơn thuê', '2026-10-13T07:44:26.000'),
    (58, 15, NULL, N'CHO_XAC_NHAN', 6, N'Tạo đơn thuê', '2026-10-13T10:16:48.000'),
    (59, 15, N'CHO_XAC_NHAN', N'HET_HAN', NULL, N'Hết thời hạn giữ đơn', '2026-10-13T10:16:49.000'),
    (60, 16, NULL, N'CHO_XAC_NHAN', 6, N'Tạo đơn thuê', '2026-10-13T10:16:49.000'),
    (61, 16, N'CHO_XAC_NHAN', N'HET_HAN', NULL, N'Hết thời hạn giữ đơn', '2026-10-13T10:18:02.000'),
    (62, 17, NULL, N'CHO_XAC_NHAN', 6, N'Tạo đơn thuê', '2026-10-13T10:18:03.000'),
    (63, 17, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-E2E01 - mô phỏng', '2026-10-13T10:18:03.000'),
    (64, 17, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, N'Thu đủ tiền đặt cọc', '2026-10-13T10:18:04.000'),
    (65, 17, N'DA_DAT_COC', N'SAN_SANG_GIAO', 1, N'DEMO-E2E01 - mô phỏng', '2026-10-13T10:18:04.000'),
    (66, 17, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-13T10:18:04.000'),
    (67, 17, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ thanh toán và đối soát', '2026-10-13T10:18:04.000'),
    (68, 17, N'CHO_TRA_XE', N'HOAN_THANH', 1, N'Đã hoàn cọc và hoàn tất đơn thuê', '2026-10-13T10:18:05.000'),
    (69, 18, NULL, N'CHO_XAC_NHAN', 6, N'Tạo đơn thuê', '2026-10-13T10:18:06.000'),
    (70, 18, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-E2E02 - mô phỏng', '2026-10-13T10:18:06.000'),
    (71, 18, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, N'Thu đủ tiền đặt cọc', '2026-10-13T10:18:07.000');
GO
INSERT INTO [dbo].[LichSuTrangThaiDon] ([LichSuId], [DonThueId], [TrangThaiCu], [TrangThaiMoi], [NguoiThucHienId], [LyDo], [NgayThucHien]) VALUES
    (72, 18, N'DA_DAT_COC', N'SAN_SANG_GIAO', 1, N'DEMO-E2E02 - mô phỏng', '2026-10-13T10:18:07.000'),
    (73, 18, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-13T10:18:07.000'),
    (74, 18, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ thanh toán và đối soát', '2026-10-13T10:19:06.000'),
    (75, 18, N'CHO_TRA_XE', N'HOAN_THANH', 1, N'Đã hoàn cọc và hoàn tất đơn thuê', '2026-10-13T10:19:06.000'),
    (76, 19, NULL, N'CHO_XAC_NHAN', 6, N'Tạo đơn thuê', '2026-10-13T10:19:07.000'),
    (77, 19, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-E2E03 - mô phỏng', '2026-10-13T10:19:07.000'),
    (78, 19, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, N'Thu đủ tiền đặt cọc', '2026-10-13T10:19:08.000'),
    (79, 19, N'DA_DAT_COC', N'SAN_SANG_GIAO', 1, N'DEMO-E2E03 - mô phỏng', '2026-10-13T10:19:08.000'),
    (80, 19, N'SAN_SANG_GIAO', N'DANG_THUE', 1, N'Giao xe', '2026-10-13T10:19:08.000'),
    (81, 19, N'DANG_THUE', N'CHO_TRA_XE', 1, N'Đã nhận xe, chờ thanh toán và đối soát', '2026-10-13T10:19:08.000'),
    (82, 20, NULL, N'CHO_XAC_NHAN', 7, N'Tạo đơn thuê', '2026-10-13T10:51:55.000'),
    (83, 20, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-HD01 - xác nhận mô phỏng', '2026-10-13T10:51:55.000'),
    (84, 21, NULL, N'CHO_XAC_NHAN', 7, N'Tạo đơn thuê', '2026-10-13T10:51:56.000'),
    (85, 21, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-HD02 - xác nhận mô phỏng', '2026-10-13T10:51:56.000'),
    (86, 22, NULL, N'CHO_XAC_NHAN', 7, N'Tạo đơn thuê', '2026-10-13T10:51:57.000'),
    (87, 22, N'CHO_XAC_NHAN', N'DA_XAC_NHAN', 1, N'DEMO-HD03 - xác nhận mô phỏng', '2026-10-13T10:51:57.000'),
    (88, 22, N'DA_XAC_NHAN', N'DA_DAT_COC', 1, N'Thu đủ tiền đặt cọc', '2026-10-14T23:19:11.000'),
    (89, 23, NULL, N'CHO_XAC_NHAN', 4, N'Tạo đơn thuê', '2026-10-30T20:45:22.000'),
    (90, 24, NULL, N'CHO_XAC_NHAN', 4, N'Tạo đơn thuê', '2026-11-02T14:18:08.000'),
    (91, 20, N'DA_XAC_NHAN', N'HET_HAN', NULL, N'Hệ thống tự động hủy đơn giữ xe do khách hàng không thanh toán cọc đúng thời hạn quy định (13/10/2026 11:21). Xe DEMO-HD01 đã được giải phóng trở lại lịch sẵn sàng.', '2026-11-09T07:09:41.000'),
    (92, 21, N'DA_XAC_NHAN', N'HET_HAN', NULL, N'Hệ thống tự động hủy đơn giữ xe do khách hàng không thanh toán cọc đúng thời hạn quy định (13/10/2026 11:21). Xe DEMO-HD02 đã được giải phóng trở lại lịch sẵn sàng.', '2026-11-09T07:09:41.000'),
    (93, 23, N'CHO_XAC_NHAN', N'HET_HAN', NULL, N'Hệ thống tự động hủy đơn giữ xe do khách hàng không thanh toán cọc đúng thời hạn quy định (30/10/2026 21:15). Xe DEMO-E2E03 đã được giải phóng trở lại lịch sẵn sàng.', '2026-11-09T07:09:41.000'),
    (94, 24, N'CHO_XAC_NHAN', N'HET_HAN', NULL, N'Hệ thống tự động hủy đơn giữ xe do khách hàng không thanh toán cọc đúng thời hạn quy định (02/11/2026 14:48). Xe DEMO-0006 đã được giải phóng trở lại lịch sẵn sàng.', '2026-11-09T07:09:41.000'),
    (95, 24, N'HET_HAN', N'DA_XAC_NHAN', NULL, N'Nhân viên đã xác nhận duyệt đơn thuê. Chuyển sang bước tạo hợp đồng điện tử.', '2026-11-09T07:10:20.000'),
    (96, 24, N'DA_XAC_NHAN', N'CHO_HOP_DONG', NULL, N'Đã soạn thảo và khởi tạo hợp đồng điện tử #HD00024A24. Chuyển sang bước gửi khách hàng xác nhận ký duyệt.', '2026-11-09T07:10:20.000');
GO
INSERT INTO [dbo].[LichSuTrangThaiDon] ([LichSuId], [DonThueId], [TrangThaiCu], [TrangThaiMoi], [NguoiThucHienId], [LyDo], [NgayThucHien]) VALUES
    (97, 24, N'CHO_HOP_DONG', N'CHO_THANH_TOAN_COC', NULL, N'Khách hàng đã ký xác nhận hợp đồng điện tử. Thời hạn giữ xe và thanh toán tiền cọc bảo đảm là 30 phút (đến 09/11/2026 07:40). Nếu quá hạn, hệ thống sẽ tự động hủy đơn và giải phóng lịch xe.', '2026-11-09T07:10:20.000'),
    (98, 24, N'CHO_THANH_TOAN_COC', N'DA_XAC_NHAN', NULL, N'Nhân viên đã xác nhận duyệt đơn thuê. Chuyển sang bước tạo hợp đồng điện tử.', '2026-11-09T07:13:38.000'),
    (99, 24, N'DA_XAC_NHAN', N'CHO_HOP_DONG', NULL, N'Đã soạn thảo và khởi tạo hợp đồng điện tử #HD00024A24. Chuyển sang bước gửi khách hàng xác nhận ký duyệt.', '2026-11-09T07:13:39.000'),
    (100, 24, N'CHO_HOP_DONG', N'CHO_THANH_TOAN_COC', NULL, N'Khách hàng đã ký xác nhận hợp đồng điện tử. Thời hạn giữ xe và thanh toán tiền cọc bảo đảm là 30 phút (đến 09/11/2026 07:43). Nếu quá hạn, hệ thống sẽ tự động hủy đơn và giải phóng lịch xe.', '2026-11-09T07:13:39.000'),
    (101, 24, N'CHO_THANH_TOAN_COC', N'SAN_SANG_GIAO', NULL, N'Đã xác nhận thanh toán tiền cọc bảo đảm 5,000,000 VNĐ qua CHUYEN_KHOAN. Hợp đồng chính thức có hiệu lực pháp lý. Xe sẵn sàng bàn giao cho khách.', '2026-11-09T07:13:39.000'),
    (102, 24, N'SAN_SANG_GIAO', N'DANG_THUE', NULL, N'Đã bàn giao xe cho khách hàng (Số km ODO xuất phát: 12050 km, Nhiên liệu: 100%). Khách hàng bắt đầu hành trình lưu hành xe.', '2026-11-09T07:14:12.000'),
    (103, 24, N'DANG_THUE', N'CHO_CHOT_HOA_DON', NULL, N'Đã nhận lại xe từ khách hàng (ODO hoàn trả: 12380 km, Nhiên liệu: 90%). Phụ phí phát sinh tính toán: 200,000 VNĐ. Đang chờ chốt hóa đơn quyết toán.', '2026-11-09T07:14:12.000'),
    (104, 24, N'CHO_CHOT_HOA_DON', N'CHO_HOAN_COC', NULL, N'Đã chốt hóa đơn quyết toán chi phí. Khách hàng đã thanh toán đầy đủ tiền thuê và phụ phí (1,500,000 VNĐ). Chuyển sang bước đối soát và hoàn cọc.', '2026-11-09T07:16:50.000'),
    (105, 24, N'CHO_HOAN_COC', N'HOAN_THANH', NULL, N'Đã đối soát và hoàn trả tiền cọc bảo đảm 4,800,000 VNĐ cho khách hàng qua CHUYEN_KHOAN. Đơn thuê xe đã hoàn tất thành công trọn vẹn mọi thủ tục!', '2026-11-09T07:16:51.000'),
    (106, 12, N'SAN_SANG_GIAO', N'DANG_THUE', NULL, N'Đã bàn giao xe cho khách hàng (Số km ODO xuất phát: 15200 km, Nhiên liệu: 100%). Khách hàng bắt đầu hành trình lưu hành xe.', '2026-11-09T09:14:07.000'),
    (107, 12, N'DANG_THUE', N'DANG_THUE', NULL, N'Gia hạn thời gian thuê thêm 67 ngày (từ 14/10/2026 16:07 đến 20/12/2026 12:00). Phụ phí thuê phát sinh: 33,500,000 VNĐ (Khach muon gia han them). Đã cập nhật phụ lục hợp đồng và lịch xe.', '2026-11-09T09:14:15.000'),
    (108, 12, N'DANG_THUE', N'CHO_CHOT_HOA_DON', NULL, N'Đã nhận lại xe từ khách hàng (ODO hoàn trả: 15500 km, Nhiên liệu: 95%). Phụ phí phát sinh tính toán: 200,000 VNĐ. Đang chờ chốt hóa đơn quyết toán.', '2026-11-09T09:14:38.000'),
    (109, 12, N'CHO_CHOT_HOA_DON', N'CHO_HOAN_COC', NULL, N'Đã chốt hóa đơn quyết toán chi phí. Khách hàng đã thanh toán đầy đủ tiền thuê và phụ phí (34,700,000 VNĐ). Chuyển sang bước đối soát và hoàn cọc.', '2026-11-09T09:14:39.000'),
    (110, 12, N'CHO_HOAN_COC', N'CHO_HOAN_COC', NULL, N'Đã đối soát và hoàn cọc Đợt 1 (3,000,000 VNĐ) qua CHUYEN_KHOAN. Bảo lưu số tiền 2,000,000 VNĐ trong 15 ngày chờ đối soát dữ liệu phạt nguội cổng CSGT quốc gia.', '2026-11-09T09:17:07.000'),
    (111, 12, N'CHO_HOAN_COC', N'HOAN_THANH', NULL, N'Đã đối soát xong dữ liệu phạt nguội cổng CSGT (Khấu trừ vi phạm: 500,000 VNĐ, Thực hoàn đợt 2: 1,500,000 VNĐ). Đơn thuê chính thức hoàn tất 100%!', '2026-11-10T17:06:25.000');
GO
SET IDENTITY_INSERT [dbo].[LichSuTrangThaiDon] OFF;
GO

-- --------------------------------------------------
-- DU LIEU: [dbo].[NhatKyHeThong] (141 ban ghi)
-- --------------------------------------------------
SET IDENTITY_INSERT [dbo].[NhatKyHeThong] ON;
GO
INSERT INTO [dbo].[NhatKyHeThong] ([NhatKyId], [NguoiDungId], [HanhDong], [TenBang], [IdBanGhi], [DuLieuCu], [DuLieuMoi], [DiaChiIP], [ThoiGian]) VALUES
    (1, 1, N'TAO_HOP_DONG', N'HopDongThue', 2, NULL, N'{"DonThueId":5,"SoHopDong":"HD1790696467400DB7A358E"}', N'::1', '2026-09-29T22:41:08.000'),
    (2, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 2, NULL, N'{"TrangThai":"DA_KY"}', N'::1', '2026-09-29T22:41:19.000'),
    (3, 1, N'TAO_THANH_TOAN', N'ThanhToan', 1, NULL, N'{"DonThueId":5,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":10000000}', N'::1', '2026-09-29T22:56:53.000'),
    (4, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 1, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-01T00:25:03.000'),
    (5, 1, N'GIU_TIEN_COC', N'ThanhToan', 1, NULL, N'{"DonThueId":5,"SoTien":10000000}', N'::1', '2026-10-01T00:25:04.000'),
    (6, 1, N'TAO_THANH_TOAN', N'ThanhToan', 2, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":5000000}', N'::1', '2026-10-07T16:57:13.000'),
    (7, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 2, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-07T16:58:54.000'),
    (8, 1, N'GIU_TIEN_COC', N'ThanhToan', 2, NULL, N'{"DonThueId":4,"SoTien":5000000}', N'::1', '2026-10-07T16:58:54.000'),
    (9, 1, N'TAO_HOP_DONG', N'HopDongThue', 3, NULL, N'{"DonThueId":6,"SoHopDong":"HD17913678138715480623D"}', N'::1', '2026-10-07T17:10:14.000'),
    (10, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 3, NULL, N'{"TrangThai":"DA_KY"}', N'::1', '2026-10-07T17:11:10.000'),
    (11, 1, N'TAO_THANH_TOAN', N'ThanhToan', 3, NULL, N'{"DonThueId":6,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":5000000}', N'::1', '2026-10-07T17:11:22.000'),
    (12, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 3, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-07T17:12:31.000'),
    (13, 1, N'GIU_TIEN_COC', N'ThanhToan', 3, NULL, N'{"DonThueId":6,"SoTien":5000000}', N'::1', '2026-10-07T17:12:31.000'),
    (14, 1, N'TAO_HOP_DONG', N'HopDongThue', 4, NULL, N'{"DonThueId":7,"SoHopDong":"HD17913896830503BDA0D30"}', N'::1', '2026-10-07T23:14:43.000'),
    (15, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 4, NULL, N'{"TrangThai":"DA_KY"}', N'::1', '2026-10-07T23:14:43.000'),
    (16, 1, N'TAO_THANH_TOAN', N'ThanhToan', 4, NULL, N'{"DonThueId":7,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":7000000}', N'::1', '2026-10-07T23:14:43.000'),
    (17, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 4, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-07T23:14:43.000'),
    (18, 1, N'GIU_TIEN_COC', N'ThanhToan', 4, NULL, N'{"DonThueId":7,"SoTien":7000000}', N'::1', '2026-10-07T23:14:43.000'),
    (19, 5, N'TAO_THANH_TOAN', N'ThanhToan', 5, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":400000}', N'::1', '2026-10-07T23:50:43.000'),
    (20, 5, N'TAO_THANH_TOAN', N'ThanhToan', 6, NULL, N'{"DonThueId":5,"LoaiThanhToan":"TIEN_THUE","SoTien":500000}', N'::1', '2026-10-07T23:50:44.000'),
    (21, 5, N'TAO_THANH_TOAN', N'ThanhToan', 7, NULL, N'{"DonThueId":7,"LoaiThanhToan":"TIEN_THUE","SoTien":600000}', N'::1', '2026-10-07T23:50:44.000'),
    (22, 5, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 7, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"CONFIRM-600K"}', N'::1', '2026-10-07T23:52:51.000'),
    (23, 5, N'TAO_THANH_TOAN', N'ThanhToan', 8, NULL, N'{"DonThueId":7,"LoaiThanhToan":"TIEN_THUE","SoTien":1}', N'::1', '2026-10-07T23:52:52.000'),
    (24, 5, N'THAT_BAI_THANH_TOAN', N'ThanhToan', 6, NULL, N'{"LyDo":"test failed pending"}', N'::1', '2026-10-07T23:53:02.000'),
    (25, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 8, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"CONFIRM-LIVE-8"}', N'::1', '2026-10-08T00:01:54.000');
GO
INSERT INTO [dbo].[NhatKyHeThong] ([NhatKyId], [NguoiDungId], [HanhDong], [TenBang], [IdBanGhi], [DuLieuCu], [DuLieuMoi], [DiaChiIP], [ThoiGian]) VALUES
    (26, 1, N'TAO_THANH_TOAN', N'ThanhToan', 9, NULL, N'{"DonThueId":5,"LoaiThanhToan":"TIEN_THUE","SoTien":1}', N'::1', '2026-10-08T00:02:58.000'),
    (27, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 5, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"LIVE_CONFIRM_5"}', N'::1', '2026-10-08T00:05:00.000'),
    (28, 1, N'TAO_THANH_TOAN', N'ThanhToan', 10, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":1}', N'::1', '2026-10-08T00:08:30.000'),
    (29, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 10, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"ATOMIC-LIVE-10"}', N'::1', '2026-10-08T00:08:31.000'),
    (30, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 9, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"ATOMIC-LIVE-9"}', N'127.0.0.1', '2026-10-08T00:09:09.000'),
    (31, 1, N'TAO_THANH_TOAN', N'ThanhToan', 11, NULL, N'{"DonThueId":5,"LoaiThanhToan":"TIEN_THUE","SoTien":400000}', N'::1', '2026-10-09T21:56:10.000'),
    (32, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 11, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"TEST-PT-1"}', N'::1', '2026-10-09T21:57:08.000'),
    (33, 1, N'TAO_THANH_TOAN', N'ThanhToan', 12, NULL, N'{"DonThueId":5,"LoaiThanhToan":"TIEN_THUE","SoTien":1479999}', N'::1', '2026-10-09T21:57:17.000'),
    (34, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 12, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"TEST-PT-FINAL"}', N'::1', '2026-10-09T21:57:47.000'),
    (35, 1, N'TAO_THANH_TOAN', N'ThanhToan', 13, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":100000}', N'::1', '2026-10-09T21:58:07.000'),
    (36, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 13, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"TEST-CONC-OK"}', N'::1', '2026-10-09T21:58:21.000'),
    (37, 1, N'TAO_THANH_TOAN', N'ThanhToan', 14, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":100000}', N'::1', '2026-10-09T21:58:34.000'),
    (38, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 14, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"CONC-RACE-1"}', N'::1', '2026-10-09T21:58:44.000'),
    (39, 1, N'TAO_THANH_TOAN', N'ThanhToan', 15, NULL, N'{"DonThueId":7,"LoaiThanhToan":"PHI_PHAT_SINH","SoTien":300000}', N'::1', '2026-10-09T21:58:53.000'),
    (40, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 15, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"TEST-FEE-1"}', N'::1', '2026-10-09T21:59:10.000'),
    (41, 1, N'TAO_THANH_TOAN', N'ThanhToan', 16, NULL, N'{"DonThueId":7,"LoaiThanhToan":"TIEN_THUE","SoTien":1000000}', N'::1', '2026-10-09T22:13:30.000'),
    (42, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 16, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"4.2F-DT7-PARTIAL"}', N'::1', '2026-10-09T22:14:52.000'),
    (43, 1, N'TAO_THANH_TOAN', N'ThanhToan', 17, NULL, N'{"DonThueId":7,"LoaiThanhToan":"TIEN_THUE","SoTien":299999}', N'::1', '2026-10-09T22:15:20.000'),
    (44, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 17, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"4.2F-DT7-FINAL"}', N'::1', '2026-10-09T22:15:21.000'),
    (45, 1, N'TAO_THANH_TOAN', N'ThanhToan', 18, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":100000}', N'::1', '2026-10-09T22:15:39.000'),
    (46, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 18, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"4.2F-DT4-CONCURRENCY-R2"}', N'::1', '2026-10-09T22:16:08.000'),
    (47, 1, N'TAO_THANH_TOAN', N'ThanhToan', 19, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":50000}', N'::1', '2026-10-09T22:27:02.000'),
    (48, 1, N'THAT_BAI_THANH_TOAN', N'ThanhToan', 19, NULL, N'{"LyDo":"4.2G cleanup: POST was misreported during backend reload"}', N'::1', '2026-10-09T22:30:10.000'),
    (49, 1, N'TAO_THANH_TOAN', N'ThanhToan', 20, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":50000}', N'::1', '2026-10-09T22:30:24.000'),
    (50, 1, N'THAT_BAI_THANH_TOAN', N'ThanhToan', 20, NULL, N'{"LyDo":"4.2G cleanup before retest of POST response"}', N'::1', '2026-10-09T22:33:57.000');
GO
INSERT INTO [dbo].[NhatKyHeThong] ([NhatKyId], [NguoiDungId], [HanhDong], [TenBang], [IdBanGhi], [DuLieuCu], [DuLieuMoi], [DiaChiIP], [ThoiGian]) VALUES
    (51, 1, N'TAO_THANH_TOAN', N'ThanhToan', 21, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":50000}', N'::1', '2026-10-09T22:34:14.000'),
    (52, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 21, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-09T22:34:14.000'),
    (53, 1, N'TAO_THANH_TOAN', N'ThanhToan', 22, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":10000}', N'::1', '2026-10-09T22:35:14.000'),
    (54, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 22, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"4.2G-CONCURRENT-1"}', N'::1', '2026-10-09T22:35:32.000'),
    (55, 1, N'TAO_THANH_TOAN', N'ThanhToan', 23, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":10000}', N'::1', '2026-10-09T22:36:31.000'),
    (56, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 23, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"4.2G-CONCURRENT-RETEST-1"}', N'::1', '2026-10-09T22:36:44.000'),
    (57, 1, N'TAO_THANH_TOAN', N'ThanhToan', 24, NULL, N'{"DonThueId":4,"LoaiThanhToan":"TIEN_THUE","SoTien":59999}', N'::1', '2026-10-09T22:37:02.000'),
    (58, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 24, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":"4.2G-DT4-FINAL"}', N'::1', '2026-10-09T22:37:02.000'),
    (59, 1, N'TAO_THANH_TOAN', N'ThanhToan', 25, NULL, N'{"DonThueId":6,"LoaiThanhToan":"TIEN_THUE","SoTien":800000}', N'::1', '2026-10-12T13:30:07.000'),
    (60, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 25, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-12T13:30:08.000'),
    (61, 1, N'TAO_THANH_TOAN', N'ThanhToan', 26, NULL, N'{"DonThueId":6,"LoaiThanhToan":"PHI_PHAT_SINH","SoTien":300000}', N'::1', '2026-10-12T13:30:11.000'),
    (62, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 26, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null}', N'::1', '2026-10-12T13:30:11.000'),
    (63, 1, N'DOI_SOAT_TIEN_COC', N'DonThue', 6, NULL, N'{"TienCocGocId":3,"TienCocBanDau":5000000,"KhauTru":0,"DuocHoan":5000000,"BienBanNhanId":6,"LyDo":"fdvcxcx"}', N'::1', '2026-10-12T13:30:18.000'),
    (64, 1, N'TAO_HOAN_COC', N'ThanhToan', 27, NULL, N'{"DonThueId":6,"TienCocGocId":3,"TienCocBanDau":5000000,"KhauTru":0,"SoTienHoan":5000000,"LyDo":"gdfg"}', N'::1', '2026-10-12T13:30:28.000'),
    (65, 1, N'DOI_SOAT_TIEN_COC', N'DonThue', 7, NULL, N'{"TienCocGocId":4,"TienCocBanDau":7000000,"KhauTru":0,"DuocHoan":7000000,"BienBanNhanId":8,"LyDo":"hgbv"}', N'::1', '2026-10-12T13:30:53.000'),
    (66, 1, N'TAO_HOAN_COC', N'ThanhToan', 28, NULL, N'{"DonThueId":7,"TienCocGocId":4,"TienCocBanDau":7000000,"KhauTru":0,"SoTienHoan":7000000,"LyDo":"vnbn"}', N'::1', '2026-10-12T13:30:56.000'),
    (67, 1, N'XAC_NHAN_HOAN_COC', N'ThanhToan', 28, NULL, N'{"TrangThai":"DA_HOAN","MaGiaoDich":null}', N'::1', '2026-10-12T13:31:02.000'),
    (104, 1, N'TAO_HOP_DONG', N'HopDongThue', 8, NULL, N'{"DonThueId":12,"DieuKhoan":"DEMO-G01 - HỢP ĐỒNG DEMO MÔ PHỎNG ĐỒ ÁN. Không phải thỏa thuận thuê xe thực tế. Đơn vị và khách hàng đều là dữ liệu mô phỏng. Thời hạn thuê dự kiến 2 ngày, giá 500000 đồng/ngày, cọc 3000000 đồng. Giao/nhận ghi nhận số km, nhiên liệu và tình trạng xe. Phí phát sinh phải được xác nhận và đối soát riêng. Không có chữ ký hoặc chứng từ tiền thật."}', N'::1', '2026-10-12T23:02:04.000'),
    (105, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 8, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"22E22BFBAAD5E8381FC70BBDD09F07E8F09CA9FE9C02E7ADFC0F94054C940981","NoiDung":{"SoHopDong":"HD17918209239077030798A","DonThueId":12,"HoTenKhachSnapshot":"DEMO-G01 - Khách mô phỏng","SoDienThoaiSnapshot":"0000000001","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-G01","ThoiGianNhan":"2026-10-12T16:07:02","ThoiGianTra":"2026-10-14T16:07:02","TongTien":1000000,"TienDatCoc":3000000,"DieuKhoan":"DEMO-G01 - HỢP ĐỒNG DEMO MÔ PHỎNG ĐỒ ÁN. Không phải thỏa thuận thuê xe thực tế. Đơn vị và khách hàng đều là dữ liệu mô phỏng. Thời hạn thuê dự kiến 2 ngày, giá 500000 đồng\/ngày, cọc 3000000 đồng. Giao\/nhận ghi nhận số km, nhiên liệu và tình trạng xe. Phí phát sinh phải được xác nhận và đối soát riêng. Không có chữ ký hoặc chứng từ tiền thật."}}', N'::1', '2026-10-12T23:02:04.000'),
    (106, 1, N'TAO_THANH_TOAN', N'ThanhToan', 41, NULL, N'{"DonThueId":12,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":3000000}', N'::1', '2026-10-12T23:02:05.000'),
    (107, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 41, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":12,"SoTien":3000000}', N'::1', '2026-10-12T23:02:05.000'),
    (108, 1, N'GIU_TIEN_COC', N'ThanhToan', 41, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":12,"SoTien":3000000}', N'::1', '2026-10-12T23:02:05.000'),
    (109, 1, N'TAO_HOP_DONG', N'HopDongThue', 9, NULL, N'{"DonThueId":13,"DieuKhoan":"DEMO-N01 - HỢP ĐỒNG DEMO MÔ PHỎNG ĐỒ ÁN. Không phải thỏa thuận thuê xe thực tế. Đơn vị và khách hàng đều là dữ liệu mô phỏng. Thời hạn thuê dự kiến 2 ngày, giá 600000 đồng/ngày, cọc 4000000 đồng. Giao/nhận ghi nhận số km, nhiên liệu và tình trạng xe. Phí phát sinh phải được xác nhận và đối soát riêng. Không có chữ ký hoặc chứng từ tiền thật."}', N'::1', '2026-10-12T23:02:55.000'),
    (110, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 9, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"AB35179EA9F6BD30EC8BF53DBA7CB067F8AE7B48E2677E10DD0115D6AD8F55DA","NoiDung":{"SoHopDong":"HD1791820975144F032F434","DonThueId":13,"HoTenKhachSnapshot":"DEMO-N01 - Khách mô phỏng","SoDienThoaiSnapshot":"0000000002","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-N01","ThoiGianNhan":"2026-10-12T16:07:55","ThoiGianTra":"2026-10-14T16:07:55","TongTien":1200000,"TienDatCoc":4000000,"DieuKhoan":"DEMO-N01 - HỢP ĐỒNG DEMO MÔ PHỎNG ĐỒ ÁN. Không phải thỏa thuận thuê xe thực tế. Đơn vị và khách hàng đều là dữ liệu mô phỏng. Thời hạn thuê dự kiến 2 ngày, giá 600000 đồng\/ngày, cọc 4000000 đồng. Giao\/nhận ghi nhận số km, nhiên liệu và tình trạng xe. Phí phát sinh phải được xác nhận và đối soát riêng. Không có chữ ký hoặc chứng từ tiền thật."}}', N'::1', '2026-10-12T23:02:56.000'),
    (111, 1, N'TAO_THANH_TOAN', N'ThanhToan', 42, NULL, N'{"DonThueId":13,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":4000000}', N'::1', '2026-10-12T23:02:56.000');
GO
INSERT INTO [dbo].[NhatKyHeThong] ([NhatKyId], [NguoiDungId], [HanhDong], [TenBang], [IdBanGhi], [DuLieuCu], [DuLieuMoi], [DiaChiIP], [ThoiGian]) VALUES
    (112, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 42, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":13,"SoTien":4000000}', N'::1', '2026-10-12T23:02:56.000'),
    (113, 1, N'GIU_TIEN_COC', N'ThanhToan', 42, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":13,"SoTien":4000000}', N'::1', '2026-10-12T23:02:56.000'),
    (114, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 15, NULL, N'{"DonThueId":13,"LoaiBienBan":"GIAO_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[]}', N'::1', '2026-10-12T23:02:57.000'),
    (115, 1, N'DANH_DAU_KHAU_TRU_COC', N'PhiPhatSinh', 4, NULL, N'{"loaiHuHong":"XUOC","moTa":"DEMO - phí xước mô phỏng, không có hư hỏng thực tế","chiPhiDuKien":100000,"khachChiuPhi":100000,"khauTruTienCoc":true}', N'::1', '2026-10-13T07:44:23.000'),
    (116, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 16, NULL, N'{"DonThueId":13,"LoaiBienBan":"NHAN_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[{"loaiHuHong":"XUOC","moTa":"DEMO - phí xước mô phỏng, không có hư hỏng thực tế","chiPhiDuKien":100000,"khachChiuPhi":100000,"khauTruTienCoc":true}]}', N'::1', '2026-10-13T07:44:23.000'),
    (117, 1, N'TAO_THANH_TOAN', N'ThanhToan', 43, NULL, N'{"DonThueId":13,"LoaiThanhToan":"TIEN_THUE","SoTien":100000}', N'::1', '2026-10-13T07:44:24.000'),
    (118, 1, N'THAT_BAI_THANH_TOAN', N'ThanhToan', 43, NULL, N'{"LyDo":"DEMO - mô phỏng chưa nhận được tiền"}', N'::1', '2026-10-13T07:44:24.000'),
    (119, 1, N'TAO_THANH_TOAN', N'ThanhToan', 44, NULL, N'{"DonThueId":13,"LoaiThanhToan":"TIEN_THUE","SoTien":1200000}', N'::1', '2026-10-13T07:44:24.000'),
    (120, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 44, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":13,"SoTien":1200000}', N'::1', '2026-10-13T07:44:25.000'),
    (121, 1, N'KHAU_TRU_TIEN_COC', N'ThanhToan', 45, NULL, N'{"DonThueId":13,"TienCocGocId":42,"BienBanId":16,"HuHongId":4,"PhiPhatSinhId":4,"SoTien":100000,"LyDo":"DEMO-N01 - đối soát mô phỏng, khấu trừ phí mô phỏng 100.000 đồng"}', N'::1', '2026-10-13T07:44:25.000'),
    (122, 1, N'DOI_SOAT_TIEN_COC', N'DonThue', 13, NULL, N'{"TienCocGocId":42,"TienCocBanDau":4000000,"KhauTru":100000,"DuocHoan":3900000,"BienBanNhanId":16,"LyDo":"DEMO-N01 - đối soát mô phỏng, khấu trừ phí mô phỏng 100.000 đồng"}', N'::1', '2026-10-13T07:44:25.000'),
    (123, 1, N'TAO_HOAN_COC', N'ThanhToan', 46, NULL, N'{"DonThueId":13,"TienCocGocId":42,"TienCocBanDau":4000000,"KhauTru":100000,"SoTienHoan":3900000,"LyDo":"DEMO-N01 - hoàn cọc mô phỏng, không chi tiền thực tế"}', N'::1', '2026-10-13T07:44:25.000'),
    (124, 1, N'XAC_NHAN_HOAN_COC', N'ThanhToan', 46, NULL, N'{"TrangThai":"DA_HOAN","MaGiaoDich":null,"DonThueId":13,"SoTien":3900000}', N'::1', '2026-10-13T07:44:26.000'),
    (125, 1, N'TAO_HOP_DONG', N'HopDongThue', 10, NULL, N'{"DonThueId":17,"DieuKhoan":"DEMO-E2E01 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế."}', N'::1', '2026-10-13T10:18:03.000'),
    (126, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 10, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"37554462753B54A47AA3CA506FF075EC712BE9622EC345F6E2D1DBDC4262F899","NoiDung":{"SoHopDong":"HD1791861483408C2DE2B47","DonThueId":17,"HoTenKhachSnapshot":"DEMO-E2E - Khách mô phỏng đồ án","SoDienThoaiSnapshot":"0000000013","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-E2E01","ThoiGianNhan":"2026-10-13T10:20:02","ThoiGianTra":"2026-10-14T10:20:02","TongTien":650000,"TienDatCoc":5000000,"DieuKhoan":"DEMO-E2E01 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế."}}', N'::1', '2026-10-13T10:18:04.000'),
    (127, 1, N'TAO_THANH_TOAN', N'ThanhToan', 47, NULL, N'{"DonThueId":17,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":5000000}', N'::1', '2026-10-13T10:18:04.000'),
    (128, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 47, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":17,"SoTien":5000000}', N'::1', '2026-10-13T10:18:04.000'),
    (129, 1, N'GIU_TIEN_COC', N'ThanhToan', 47, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":17,"SoTien":5000000}', N'::1', '2026-10-13T10:18:04.000'),
    (130, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 17, NULL, N'{"DonThueId":17,"LoaiBienBan":"GIAO_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[]}', N'::1', '2026-10-13T10:18:04.000'),
    (131, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 18, NULL, N'{"DonThueId":17,"LoaiBienBan":"NHAN_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[]}', N'::1', '2026-10-13T10:18:04.000'),
    (132, 1, N'TAO_THANH_TOAN', N'ThanhToan', 48, NULL, N'{"DonThueId":17,"LoaiThanhToan":"TIEN_THUE","SoTien":650000}', N'::1', '2026-10-13T10:18:05.000'),
    (133, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 48, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":17,"SoTien":650000}', N'::1', '2026-10-13T10:18:05.000'),
    (134, 1, N'DOI_SOAT_TIEN_COC', N'DonThue', 17, NULL, N'{"TienCocGocId":47,"TienCocBanDau":5000000,"KhauTru":0,"DuocHoan":5000000,"BienBanNhanId":18,"LyDo":"DEMO-E2E01 - đối soát mô phỏng"}', N'::1', '2026-10-13T10:18:05.000'),
    (135, 1, N'TAO_HOAN_COC', N'ThanhToan', 49, NULL, N'{"DonThueId":17,"TienCocGocId":47,"TienCocBanDau":5000000,"KhauTru":0,"SoTienHoan":5000000,"LyDo":"DEMO-E2E01 - hoàn cọc mô phỏng, không chi tiền thực tế"}', N'::1', '2026-10-13T10:18:05.000'),
    (136, 1, N'XAC_NHAN_HOAN_COC', N'ThanhToan', 49, NULL, N'{"TrangThai":"DA_HOAN","MaGiaoDich":null,"DonThueId":17,"SoTien":5000000}', N'::1', '2026-10-13T10:18:05.000');
GO
INSERT INTO [dbo].[NhatKyHeThong] ([NhatKyId], [NguoiDungId], [HanhDong], [TenBang], [IdBanGhi], [DuLieuCu], [DuLieuMoi], [DiaChiIP], [ThoiGian]) VALUES
    (137, 1, N'TAO_HOP_DONG', N'HopDongThue', 11, NULL, N'{"DonThueId":18,"DieuKhoan":"DEMO-E2E02 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế."}', N'::1', '2026-10-13T10:18:06.000'),
    (138, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 11, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"31392D5776D76F67E6358B91391EA562C4BECAAF21B0D1C843B849CB1313E3D9","NoiDung":{"SoHopDong":"HD17918614862547DCC61BD","DonThueId":18,"HoTenKhachSnapshot":"DEMO-E2E - Khách mô phỏng đồ án","SoDienThoaiSnapshot":"0000000013","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-E2E02","ThoiGianNhan":"2026-10-13T10:20:06","ThoiGianTra":"2026-10-14T10:20:06","TongTien":650000,"TienDatCoc":5000000,"DieuKhoan":"DEMO-E2E02 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế."}}', N'::1', '2026-10-13T10:18:06.000'),
    (139, 1, N'TAO_THANH_TOAN', N'ThanhToan', 50, NULL, N'{"DonThueId":18,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":5000000}', N'::1', '2026-10-13T10:18:06.000'),
    (140, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 50, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":18,"SoTien":5000000}', N'::1', '2026-10-13T10:18:07.000'),
    (141, 1, N'GIU_TIEN_COC', N'ThanhToan', 50, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":18,"SoTien":5000000}', N'::1', '2026-10-13T10:18:07.000'),
    (142, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 19, NULL, N'{"DonThueId":18,"LoaiBienBan":"GIAO_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[]}', N'::1', '2026-10-13T10:18:07.000'),
    (143, 1, N'DANH_DAU_KHAU_TRU_COC', N'PhiPhatSinh', 5, NULL, N'{"loaiHuHong":"XUOC","moTa":"DEMO-E2E02 - vết xước mô phỏng","chiPhiDuKien":100000,"khachChiuPhi":100000,"khauTruTienCoc":true}', N'::1', '2026-10-13T10:19:05.000'),
    (144, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 20, NULL, N'{"DonThueId":18,"LoaiBienBan":"NHAN_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[{"loaiHuHong":"XUOC","moTa":"DEMO-E2E02 - vết xước mô phỏng","chiPhiDuKien":100000,"khachChiuPhi":100000,"khauTruTienCoc":true}]}', N'::1', '2026-10-13T10:19:06.000'),
    (145, 1, N'TAO_THANH_TOAN', N'ThanhToan', 51, NULL, N'{"DonThueId":18,"LoaiThanhToan":"TIEN_THUE","SoTien":650000}', N'::1', '2026-10-13T10:19:06.000'),
    (146, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 51, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":18,"SoTien":650000}', N'::1', '2026-10-13T10:19:06.000'),
    (147, 1, N'KHAU_TRU_TIEN_COC', N'ThanhToan', 52, NULL, N'{"DonThueId":18,"TienCocGocId":50,"BienBanId":20,"HuHongId":5,"PhiPhatSinhId":5,"SoTien":100000,"LyDo":"DEMO-E2E02 - đối soát mô phỏng"}', N'::1', '2026-10-13T10:19:06.000'),
    (148, 1, N'DOI_SOAT_TIEN_COC', N'DonThue', 18, NULL, N'{"TienCocGocId":50,"TienCocBanDau":5000000,"KhauTru":100000,"DuocHoan":4900000,"BienBanNhanId":20,"LyDo":"DEMO-E2E02 - đối soát mô phỏng"}', N'::1', '2026-10-13T10:19:06.000'),
    (149, 1, N'TAO_HOAN_COC', N'ThanhToan', 53, NULL, N'{"DonThueId":18,"TienCocGocId":50,"TienCocBanDau":5000000,"KhauTru":100000,"SoTienHoan":4900000,"LyDo":"DEMO-E2E02 - hoàn cọc mô phỏng, không chi tiền thực tế"}', N'::1', '2026-10-13T10:19:06.000'),
    (150, 1, N'XAC_NHAN_HOAN_COC', N'ThanhToan', 53, NULL, N'{"TrangThai":"DA_HOAN","MaGiaoDich":null,"DonThueId":18,"SoTien":4900000}', N'::1', '2026-10-13T10:19:06.000'),
    (151, 1, N'TAO_HOP_DONG', N'HopDongThue', 12, NULL, N'{"DonThueId":19,"DieuKhoan":"DEMO-E2E03 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế."}', N'::1', '2026-10-13T10:19:07.000'),
    (152, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 12, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"8C2CBF5C639D22987353250A41B975EFF10A9528252C731B68D769CE605AB850","NoiDung":{"SoHopDong":"HD179186154731603756DA4","DonThueId":19,"HoTenKhachSnapshot":"DEMO-E2E - Khách mô phỏng đồ án","SoDienThoaiSnapshot":"0000000013","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-E2E03","ThoiGianNhan":"2026-10-13T10:21:07","ThoiGianTra":"2026-10-14T10:21:07","TongTien":650000,"TienDatCoc":5000000,"DieuKhoan":"DEMO-E2E03 - Điều khoản mô phỏng đồ án. Thuê 1 ngày, 650.000 đồng; cọc 5.000.000 đồng. Phí phải có biên bản và đối soát. Không phải hợp đồng hay giao dịch thực tế."}}', N'::1', '2026-10-13T10:19:07.000'),
    (153, 1, N'TAO_THANH_TOAN', N'ThanhToan', 54, NULL, N'{"DonThueId":19,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":5000000}', N'::1', '2026-10-13T10:19:08.000'),
    (154, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 54, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":19,"SoTien":5000000}', N'::1', '2026-10-13T10:19:08.000'),
    (155, 1, N'GIU_TIEN_COC', N'ThanhToan', 54, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":19,"SoTien":5000000}', N'::1', '2026-10-13T10:19:08.000'),
    (156, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 21, NULL, N'{"DonThueId":19,"LoaiBienBan":"GIAO_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[]}', N'::1', '2026-10-13T10:19:08.000'),
    (157, 1, N'TAO_BIEN_BAN', N'BienBanGiaoNhan', 22, NULL, N'{"DonThueId":19,"LoaiBienBan":"NHAN_XE","PhuongThuc":"Nhân viên xác nhận trên hệ thống","HuHong":[]}', N'::1', '2026-10-13T10:19:08.000'),
    (158, 1, N'TAO_THANH_TOAN', N'ThanhToan', 55, NULL, N'{"DonThueId":19,"LoaiThanhToan":"TIEN_THUE","SoTien":100000}', N'::1', '2026-10-13T10:19:08.000'),
    (159, 1, N'THAT_BAI_THANH_TOAN', N'ThanhToan', 55, NULL, N'{"LyDo":"DEMO-E2E03 - chưa thu được tiền mô phỏng"}', N'::1', '2026-10-13T10:19:08.000'),
    (160, 1, N'TAO_THANH_TOAN', N'ThanhToan', 56, NULL, N'{"DonThueId":19,"LoaiThanhToan":"TIEN_THUE","SoTien":300000}', N'::1', '2026-10-13T10:19:09.000'),
    (161, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 56, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":19,"SoTien":300000}', N'::1', '2026-10-13T10:19:09.000');
GO
INSERT INTO [dbo].[NhatKyHeThong] ([NhatKyId], [NguoiDungId], [HanhDong], [TenBang], [IdBanGhi], [DuLieuCu], [DuLieuMoi], [DiaChiIP], [ThoiGian]) VALUES
    (162, 1, N'TAO_HOP_DONG', N'HopDongThue', 13, NULL, N'{"DonThueId":20,"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn."}', N'::1', '2026-10-13T10:51:55.000'),
    (163, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 13, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"0C9E827743F429F30FD21A6EE123BE6882BD9C2DD4CC59B07F337E78E35EC0EF","NoiDung":{"SoHopDong":"HD1791863515101CF2239DC","DonThueId":20,"HoTenKhachSnapshot":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoaiSnapshot":"0000000014","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-HD01","ThoiGianNhan":"2026-10-15T10:51:54","ThoiGianTra":"2026-10-16T10:51:54","TongTien":700000,"TienDatCoc":3000000,"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn."}}', N'::1', '2026-10-13T10:51:55.000'),
    (164, 1, N'TAO_PHIEN_BAN_KY', N'HopDongThue', 13, NULL, N'{"PhienBan":1,"MaNoiDung":"DA7BCE565440E223BE4617343DF1ABC0A362E4391611C0426BB8E49534C1ABBF","LyDo":"DEMO-HD01 - chuẩn bị hồ sơ để người dùng tự ký"}', N'::1', '2026-10-13T10:51:56.000'),
    (165, 1, N'TAO_HOP_DONG', N'HopDongThue', 14, NULL, N'{"DonThueId":21,"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn."}', N'::1', '2026-10-13T10:51:56.000'),
    (166, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 14, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"BE6AD0B266774944ED2FFBB56B30D5951DE30071B27EB86F8EE6F566F9CD8D72","NoiDung":{"SoHopDong":"HD1791863516198898BF13A","DonThueId":21,"HoTenKhachSnapshot":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoaiSnapshot":"0000000014","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-HD02","ThoiGianNhan":"2026-10-15T10:51:56","ThoiGianTra":"2026-10-16T10:51:56","TongTien":700000,"TienDatCoc":3000000,"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn."}}', N'::1', '2026-10-13T10:51:56.000'),
    (167, 1, N'TAO_PHIEN_BAN_KY', N'HopDongThue', 14, NULL, N'{"PhienBan":1,"MaNoiDung":"3352E02B9DAB5E854E6E1389D918EF950A6707C081ADBA542224EE0DB9DD8633","LyDo":"DEMO-HD02 - chuẩn bị hồ sơ để người dùng tự ký"}', N'::1', '2026-10-13T10:51:57.000'),
    (168, 1, N'TAO_HOP_DONG', N'HopDongThue', 15, NULL, N'{"DonThueId":22,"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn."}', N'::1', '2026-10-13T10:51:57.000'),
    (169, 1, N'XAC_NHAN_HOP_DONG', N'HopDongThue', 15, NULL, N'{"TrangThai":"DA_KY","PhuongThuc":"Nhân viên xác nhận trên hệ thống","PhienBan":"1","MaNoiDung":"70E1FE2A70096B2EAE3C7DA9542ACB3F1030B458E4B1FC731E12AC8FF0D5BFCA","NoiDung":{"SoHopDong":"HD17918635172451A18CA0F","DonThueId":22,"HoTenKhachSnapshot":"DEMO-HD - Khách mô phỏng hợp đồng","SoDienThoaiSnapshot":"0000000014","CCCDSnapshot":null,"GPLXSnapshot":null,"TenXeSnapshot":"Toyota Vios","BienSoSnapshot":"DEMO-HD03","ThoiGianNhan":"2026-10-15T10:51:57","ThoiGianTra":"2026-10-16T10:51:57","TongTien":700000,"TienDatCoc":3000000,"DieuKhoan":"1. PHẠM VI: Đây là hợp đồng mô phỏng đồ án CarRental, không có thuê xe, giao xe hoặc thu chi tiền thực tế.\n2. BÊN CHO THUÊ: Cung cấp xe theo thông tin đã ghi nhận; lập biên bản bàn giao số km, nhiên liệu, tình trạng xe và phụ kiện. Không bổ sung giấy tờ hoặc chữ ký chưa có.\n3. BÊN THUÊ: Sử dụng xe theo thỏa thuận; bảo quản xe, thông báo sự cố và trả xe đúng thời hạn, địa điểm trong hợp đồng.\n4. GIAO NHẬN VÀ PHÍ: Tình trạng xe, số km, nhiên liệu và hư hỏng được ghi nhận bằng biên bản. Phí hư hỏng, trả muộn, vượt km, thiếu nhiên liệu hoặc vệ sinh phải có căn cứ và mức tiền được thống nhất; không tự áp mức phạt chưa thỏa thuận.\n5. THANH TOÁN VÀ CỌC: Tiền thuê, phí và cọc được ghi nhận riêng. Sau khi nhận xe và thu đủ hóa đơn, đối soát các khoản khấu trừ có căn cứ; hoàn phần cọc còn lại qua giao dịch có xác nhận. Tiền cọc không mặc định là doanh thu.\n6. HỦY VÀ THAY ĐỔI: Điều kiện hủy, khoản hoàn và chi phí phải được hai bên thống nhất. Thay đổi trước khi thu cọc phải tạo phiên bản mới và yêu cầu ký lại; giữ bản cũ để đối chiếu.\n7. XÁC NHẬN: Chữ ký vẽ qua tài khoản đăng nhập không phải chữ ký số có chứng thư số. Mỗi bên tự thao tác ký, không dùng chữ ký tạo sẵn."}}', N'::1', '2026-10-13T10:51:57.000'),
    (170, 1, N'TAO_PHIEN_BAN_KY', N'HopDongThue', 15, NULL, N'{"PhienBan":1,"MaNoiDung":"7B9B4EFEAB7E34970AD546AE3E0829B1E92BC3CC1125F2C583A6E178533B3063","LyDo":"DEMO-HD03 - chuẩn bị hồ sơ để người dùng tự ký"}', N'::1', '2026-10-13T10:51:57.000'),
    (171, 1, N'TAO_PHIEN_BAN_KY', N'HopDongThue', 15, NULL, N'{"PhienBan":2,"MaNoiDung":"4963C989B3FFA5AD82BDE2723562D07D077DE6F1CBD709C79B0194DBD9A5BBBE","LyDo":"DEMO-HD03 - minh họa bản mới và lưu nguyên bản 1"}', N'::1', '2026-10-13T10:51:58.000'),
    (172, 1, N'KY_HOP_DONG_DIEN_TU', N'HopDongThue', 15, NULL, N'{"PhienBanId":4,"Ben":"BEN_A","MaNoiDung":"4963C989B3FFA5AD82BDE2723562D07D077DE6F1CBD709C79B0194DBD9A5BBBE","DongY":true}', N'::1', '2026-10-14T23:08:56.000'),
    (173, 7, N'KY_HOP_DONG_DIEN_TU', N'HopDongThue', 15, NULL, N'{"PhienBanId":4,"Ben":"BEN_B","MaNoiDung":"4963C989B3FFA5AD82BDE2723562D07D077DE6F1CBD709C79B0194DBD9A5BBBE","DongY":true}', N'::1', '2026-10-14T23:12:31.000'),
    (174, 1, N'TAO_THANH_TOAN', N'ThanhToan', 57, NULL, N'{"DonThueId":22,"LoaiThanhToan":"TIEN_DAT_COC","SoTien":3000000}', N'::1', '2026-10-14T23:18:44.000'),
    (175, 1, N'XAC_NHAN_THANH_TOAN', N'ThanhToan', 57, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":22,"SoTien":3000000}', N'::1', '2026-10-14T23:19:10.000'),
    (176, 1, N'GIU_TIEN_COC', N'ThanhToan', 57, NULL, N'{"TrangThai":"THANH_CONG","MaGiaoDich":null,"DonThueId":22,"SoTien":3000000}', N'::1', '2026-10-14T23:19:11.000'),
    (177, 1, N'KY_HOP_DONG_DIEN_TU', N'HopDongThue', 14, NULL, N'{"PhienBanId":2,"Ben":"BEN_A","MaNoiDung":"3352E02B9DAB5E854E6E1389D918EF950A6707C081ADBA542224EE0DB9DD8633","DongY":true}', N'::1', '2026-10-14T23:22:03.000');
GO
SET IDENTITY_INSERT [dbo].[NhatKyHeThong] OFF;
GO

-- ------------------------------------------------------------------------------
-- 5. KIEM TRA SO LUONG BAN GHI SAU KHI NAP
-- ------------------------------------------------------------------------------
SELECT 
    t.name AS [TenBang],
    p.rows AS [SoLuongBanGhi]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.OBJECT_ID
WHERE p.index_id < 2
ORDER BY t.name;
GO

PRINT N'==============================================================================';
PRINT N'>>> HOAN TAT NAP TOAN BO CO SO DU LIEU QuanLyChoThueOto VOI 29 BANG CHUAN!';
PRINT N'==============================================================================';
GO
