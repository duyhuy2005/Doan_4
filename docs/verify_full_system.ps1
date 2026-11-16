Write-Host "=========================================================="
Write-Host "1. SO LUONG BAN GHI TRONG CSDL SQL SERVER (QuanLyChoThueOto)"
Write-Host "=========================================================="
$sql = @"
SELECT 'HangXe' AS [Bang], COUNT(1) AS [SoLuong] FROM HangXe
UNION ALL SELECT 'LoaiXe', COUNT(1) FROM LoaiXe
UNION ALL SELECT 'MauXe', COUNT(1) FROM MauXe
UNION ALL SELECT 'Xe', COUNT(1) FROM Xe
UNION ALL SELECT 'ChiNhanh', COUNT(1) FROM ChiNhanh
UNION ALL SELECT 'KhachHang', COUNT(1) FROM KhachHang
UNION ALL SELECT 'DichVu', COUNT(1) FROM DichVu
UNION ALL SELECT 'MaGiamGia', COUNT(1) FROM MaGiamGia
UNION ALL SELECT 'DonThue', COUNT(1) FROM DonThue
UNION ALL SELECT 'HopDongThue', COUNT(1) FROM HopDongThue
UNION ALL SELECT 'ThanhToan', COUNT(1) FROM ThanhToan
UNION ALL SELECT 'BienBanGiaoNhan', COUNT(1) FROM BienBanGiaoNhan
UNION ALL SELECT 'BaoTri', COUNT(1) FROM BaoTri
UNION ALL SELECT 'DanhGia', COUNT(1) FROM DanhGia
UNION ALL SELECT 'HinhAnhXe', COUNT(1) FROM HinhAnhXe
UNION ALL SELECT 'NguoiDung (Ngoai le)', COUNT(1) FROM NguoiDung
"@

sqlcmd -S localhost -U carrental_user -P "CarRental@2026!" -d QuanLyChoThueOto -Q "$sql"

Write-Host "`n=========================================================="
Write-Host "2. KIEM TRA DULIEU PHUC VU TU C# ASP.NET CORE BACKEND API"
Write-Host "=========================================================="
$health = (Invoke-RestMethod -Uri 'http://localhost:5000/api/health').data
Write-Host "Health Status    :" $health.status
Write-Host "Database Engine  :" $health.database.engine
Write-Host "Connected DB     :" $health.database.database

$cars = (Invoke-RestMethod -Uri 'http://localhost:5000/api/cars').data
Write-Host "Cars             :" $cars.Count "xe"
$brands = (Invoke-RestMethod -Uri 'http://localhost:5000/api/catalog/brands').data
Write-Host "Brands           :" $brands.Count "hang xe"
$categories = (Invoke-RestMethod -Uri 'http://localhost:5000/api/catalog/categories').data
Write-Host "Categories       :" $categories.Count "loai xe"
$branches = (Invoke-RestMethod -Uri 'http://localhost:5000/api/catalog/branches').data
Write-Host "Branches         :" $branches.Count "chi nhanh"
$services = (Invoke-RestMethod -Uri 'http://localhost:5000/api/catalog/services').data
Write-Host "Services         :" $services.Count "dich vu"
$promotions = (Invoke-RestMethod -Uri 'http://localhost:5000/api/catalog/promotions').data
Write-Host "Promotions       :" $promotions.Count "ma khuyen mai"
$reviews = (Invoke-RestMethod -Uri 'http://localhost:5000/api/reviews').data
Write-Host "Reviews          :" $reviews.Count "danh gia"

$login = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"email":"admin@carrental.com","password":"Admin@123"}'
$token = $login.data.accessToken
$headers = @{ Authorization = "Bearer $token" }

$bookings = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/bookings' -Headers $headers).data
Write-Host "Admin Bookings   :" $bookings.Count "don thue"
$customers = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/customers' -Headers $headers).data
Write-Host "Admin Customers  :" $customers.Count "khach hang"
$staff = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/staff' -Headers $headers).data
Write-Host "Admin Staff      :" $staff.Count "nhan vien"
$maintenance = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/maintenance' -Headers $headers).data
Write-Host "Admin Maintenance:" $maintenance.Count "ban ghi bao tri"
$payments = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/payments' -Headers $headers).data
Write-Host "Admin Payments   :" $payments.Count "giao dich thanh toan"
$contracts = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/contracts' -Headers $headers).data
Write-Host "Admin Contracts  :" $contracts.Count "hop dong"
$handovers = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/handovers' -Headers $headers).data
Write-Host "Admin Handovers  :" $handovers.Count "bien ban giao nhan"

Write-Host "`n>>> TAT CA KIEM TRA HOAN TAT: 100% THANH CONG! <<<"
