using Microsoft.EntityFrameworkCore;
using CarRental.Api.Models;

namespace CarRental.Api.Data;

public class CarRentalDbContext : DbContext
{
    public CarRentalDbContext(DbContextOptions<CarRentalDbContext> options) : base(options)
    {
    }

    public DbSet<VaiTro> VaiTros { get; set; } = null!;
    public DbSet<NguoiDung> NguoiDungs { get; set; } = null!;
    public DbSet<KhachHang> KhachHangs { get; set; } = null!;
    public DbSet<ChiNhanh> ChiNhanhs { get; set; } = null!;
    public DbSet<HangXe> HangXes { get; set; } = null!;
    public DbSet<LoaiXe> LoaiXes { get; set; } = null!;
    public DbSet<MauXe> MauXes { get; set; } = null!;
    public DbSet<Xe> Xes { get; set; } = null!;
    public DbSet<HinhAnhXe> HinhAnhXes { get; set; } = null!;
    public DbSet<DichVu> DichVus { get; set; } = null!;
    public DbSet<MaGiamGia> MaGiamGias { get; set; } = null!;
    public DbSet<DonThue> DonThues { get; set; } = null!;
    public DbSet<HopDongThue> HopDongThues { get; set; } = null!;
    public DbSet<BienBanGiaoNhan> BienBanGiaoNhans { get; set; } = null!;
    public DbSet<ThanhToan> ThanhToans { get; set; } = null!;
    public DbSet<BaoTri> BaoTris { get; set; } = null!;
    public DbSet<DanhGia> DanhGias { get; set; } = null!;
    public DbSet<LichSuTrangThaiDon> LichSuTrangThaiDons { get; set; } = null!;
    public DbSet<ThongBao> ThongBaos { get; set; } = null!;
    public DbSet<HinhAnhGiaoNhan> HinhAnhGiaoNhans { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map relationships
        modelBuilder.Entity<Xe>()
            .HasOne(x => x.MauXe)
            .WithMany()
            .HasForeignKey(x => x.MauXeId);

        modelBuilder.Entity<Xe>()
            .HasOne(x => x.ChiNhanh)
            .WithMany()
            .HasForeignKey(x => x.ChiNhanhId);

        modelBuilder.Entity<MauXe>()
            .HasOne(m => m.HangXe)
            .WithMany()
            .HasForeignKey(m => m.HangXeId);

        modelBuilder.Entity<MauXe>()
            .HasOne(m => m.LoaiXe)
            .WithMany()
            .HasForeignKey(m => m.LoaiXeId);

        modelBuilder.Entity<DonThue>()
            .HasOne(d => d.Xe)
            .WithMany()
            .HasForeignKey(d => d.XeId);

        modelBuilder.Entity<DonThue>()
            .HasOne(d => d.KhachHang)
            .WithMany()
            .HasForeignKey(d => d.KhachHangId);

        // Configure tables with database triggers to disable EF Core OUTPUT clause
        modelBuilder.Entity<DonThue>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<BaoTri>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<HopDongThue>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<ThanhToan>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<BienBanGiaoNhan>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<LichSuTrangThaiDon>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<ThongBao>().ToTable(tb => tb.UseSqlOutputClause(false));
        modelBuilder.Entity<HinhAnhGiaoNhan>().ToTable(tb => tb.UseSqlOutputClause(false));
    }
}
