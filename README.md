# AutoRental - Hệ Thống Quản Lý Và Cho Thuê Xe Ô Tô Trực Tuyến
*(Online Car Rental Management System)*

Hệ thống toàn diện phục vụ hoạt động kinh doanh cho thuê xe tự lái và có tài xế, được thiết kế theo tiêu chuẩn công nghiệp với kiến trúc phân tầng (Layered Architecture), bảo mật JWT, chuẩn hóa cơ sở dữ liệu và luồng trải nghiệm khách hàng 11 bước xuyên suốt không đứt gãy.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **State Management:** Zustand
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **HTTP Client:** Axios với Base URL & JWT Bearer Interceptors

### Backend & API
- **Framework:** **C# .NET 8.0 (ASP.NET Core Web API)**
- **ORM / Data Access:** Entity Framework Core 8.0 (`Microsoft.EntityFrameworkCore.SqlServer`)
- **Database:** **Microsoft SQL Server 2019** (Cơ sở dữ liệu: `QuanLyChoThueOto` - 29 bảng dữ liệu quan hệ)
- **Authentication:** JWT Bearer Authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- **Security:** BCrypt.Net-Next (băm mật khẩu đa vòng), CORS, Exception Handlers
- **API Documentation:** Swagger / OpenAPI UI tương tác trực quan tại `/swagger`

---

## 🚗 Luồng Nghiệp Vụ Khách Hàng (11-Step Continuous Journey)

Hệ thống loại bỏ hoàn toàn các ngõ cụt nghiệp vụ, kết nối liền mạch từ bước tìm xe đến khi nhận lại tiền cọc và đánh giá chuyến đi:

```
[1. Tìm xe] ──► [2. Chi tiết xe] ──► [3. Đặt xe 5 bước] ──► [4. Thanh toán cọc VietQR/VNPay]
                                                                        │
┌───────────────────────────────────────────────────────────────────────┘
▼
[5. Ký hợp đồng điện tử] ──► [6. Nhận xe (Check-in ODO/Xăng)] ──► [7. Theo dõi hành trình 24/7]
                                                                                │
┌───────────────────────────────────────────────────────────────────────────────┘
▼
[8. Trả xe & Nghiệm thu] ──► [9. Quyết toán hóa đơn] ──► [10. Hoàn cọc STK] ──► [11. Đánh giá]
```

### Chi tiết 5 bước tại Trang Đặt Xe:
1. **Thông tin thuê xe:** Chọn xe, chi nhánh nhận/trả, ngày giờ nhận/trả, tự động tính số ngày thuê.
2. **Thông tin khách hàng:** Họ tên, SĐT, Email, Số GPLX (B2/C), CCCD, Ghi chú nhận xe.
3. **Dịch vụ bổ sung:** Thêm/bớt số lượng (Giao nhận tận nơi, Ghế ISOFIX, Bảo hiểm VIP, Tài xế riêng).
4. **Mã giảm giá:** Kiểm tra hạn sử dụng, điều kiện đơn tối thiểu và tính mức chiết khấu tối đa.
5. **Bảng tổng tiền chuẩn mực:**
   - Tiền thuê = $\text{Đơn giá ngày} \times \text{Số ngày}$
   - Dịch vụ = $\sum \text{Phí dịch vụ chọn}$
   - Giảm giá = $\text{Chiết khấu voucher}$
   - Tổng tiền thuê dự kiến = $\text{Tiền thuê} + \text{Dịch vụ} - \text{Giảm giá}$
   - Tiền đặt cọc bảo đảm (theo chính sách xe)
   - Cần thanh toán ban đầu (để xác nhận đặt giữ xe)

---

## 📋 14 Phân Hệ Quản Trị Admin

1. **Dashboard:** 4 KPI Cards (Doanh thu, Đơn thuê, Xe đang thuê, Khách hàng), biểu đồ doanh thu 12 tháng, donut tỷ lệ trạng thái xe, bảng đơn thuê gần đây.
2. **Quản lý xe:** CRUD danh sách xe, tích hợp chọn Hãng xe & Loại xe ngay trong form thêm/sửa xe.
3. **Quản lý chi nhánh:** Showroom, trạm giao nhận xe, số điện thoại, vị trí Google Maps.
4. **Quản lý khách hàng:** Hồ sơ CCCD gắn chip, hạng GPLX, lịch sử đơn thuê, khóa/mở khóa tài khoản.
5. **Quản lý nhân viên:** Phân quyền, nhân viên giao nhận, CSKH, quản lý chi nhánh.
6. **Quản lý đơn thuê:** Bộ lọc 6 trạng thái (`Chờ xác nhận`, `Đã cọc`, `Đang thuê`, `Đã trả`, `Đã hủy`), duyệt và từ chối đơn.
7. **Quản lý hợp đồng:** Danh sách hợp đồng điện tử, xem chi tiết điều khoản pháp lý, in ấn xuất PDF.
8. **Quản lý giao nhận (Check-in & Check-out):** Biên bản bàn giao, ODO, mức nhiên liệu %, chụp ảnh kiểm tra ngoại thất.
9. **Quản lý thanh toán:** Nhật ký dòng tiền cọc, tiền thuê, hoàn cọc ngân hàng và phụ phí phát sinh.
10. **Quản lý bảo trì:** Lịch bảo dưỡng xe định kỳ 20.000km, thay lốp, kiểm tra pin, chi phí xưởng dịch vụ.
11. **Quản lý khuyến mãi:** Tạo mã voucher, % giảm giá, giảm tối đa, đơn tối thiểu, bật/tắt kích hoạt.
12. **Quản lý đánh giá:** Kiểm duyệt review 1-5 sao của khách hàng (Vệ sinh, nhân viên, chất lượng xe).
13. **Báo cáo thống kê:** Biểu đồ doanh thu theo phân khúc xe và theo chi nhánh.
14. **Cấu hình hệ thống:** Tên công ty, slogan, hotline, số cứu hộ SOS 24/7, định mức km/ngày (300km), phụ phí vượt km (5.000đ/km).

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi tạo Cơ sở dữ liệu (Microsoft SQL Server)
- Mở **SQL Server Management Studio (SSMS)** hoặc **Azure Data Studio**.
- Mở và thực thi (Execute `F5`) duy nhất file kịch bản SQL hoàn chỉnh tại:
  `docs/database.sql`
- Kịch bản tự động:
  - Tạo Database `QuanLyChoThueOto` chuẩn hóa 3NF với 29 bảng dữ liệu.
  - Thiết lập đầy đủ Primary Key, Foreign Key, Unique Constraints và Indexes.
  - Tự động nạp sẵn dữ liệu mẫu (Seed Data 20+ bản ghi chuẩn tiếng Việt Unicode có dấu `N'...'` cho mỗi bảng chính: Xe, Đơn thuê, Hợp đồng, Khách hàng, Chi nhánh, Thanh toán,...).
  - Hoàn tất trong 1 lần chạy, không cần chạy thêm file vá phụ.

### 2. Khởi chạy C# .NET Backend
```bash
# Di chuyển vào thư mục backend
cd BE

# Chạy ứng dụng ASP.NET Core Web API (Port 5000)
dotnet run --project CarRental.Api.csproj
```
- API Root: `http://localhost:5000`
- Swagger UI (tài liệu & test API trực quan): `http://localhost:5000/swagger`
- Kiểm tra kết nối Database: `http://localhost:5000/api/health`

### 3. Khởi chạy Frontend ReactJS
```bash
# Mở một cửa sổ terminal mới
cd FE

# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi chạy Vite Dev Server (Port 5173)
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`

---

## 🔐 Tài Khoản Đăng Nhập Mẫu

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
|:---|:---|:---|:---|
| **Quản trị viên (Admin)** | `admin@autorental.vn` | `Admin@123` | Toàn quyền 14 phân hệ Admin |
| **Nhân viên (Staff)** | `staff@autorental.vn` | `Staff@123` | Quản lý đơn, bàn giao & nhận lại xe |
| **Khách hàng (Customer)** | `customer@autorental.vn` | `Customer@123` | Thuê xe, ký hợp đồng, theo dõi đơn |
