# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) & THIẾT KẾ KIẾN TRÚC HỆ THỐNG
## HỆ THỐNG QUẢN LÝ VÀ CHO THUÊ XE Ô TÔ TRỰC TUYẾN (ONLINE CAR RENTAL MANAGEMENT SYSTEM)

- **Vai trò:** Senior Business Analyst (BA) & System Analyst (SA) & Senior Full-Stack Architect
- **Phiên bản:** 1.0.0
- **Trạng thái:** Giai đoạn 1 - Phân tích nghiệp vụ & Thiết kế kiến trúc hoàn tất

---

## 1. TỔNG QUAN HỆ THỐNG & ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)

### 1.1. Phạm vi dự án (Scope of Work)
Hệ thống là một nền tảng Web Application trọn gói phục vụ 3 phân hệ người dùng:
1. **Khách hàng (Customer):** Tìm kiếm danh mục xe đa tiêu chí, tra cứu tính khả dụng theo thời gian thực (real-time availability), đặt cọc trực tuyến, theo dõi tiến độ đơn thuê, nhận bàn giao xe và đánh giá chất lượng.
2. **Nhân viên (Staff):** Thẩm định hồ sơ thuê (bằng lái GPLX, CCCD), tiếp nhận và xử lý đơn đặt xe, thực hiện quy trình Check-in (bàn giao xe ghi nhận ODO, mức nhiên liệu, ảnh trầy xước) và Check-out (nghiệm thu hoàn trả xe, tính phụ phí phát sinh, hoàn tiền cọc).
3. **Quản trị viên (Admin):** Quản trị kho xe (Car Fleet Management), cấu hình bảng giá & chính sách phụ thu, quản trị người dùng & phân quyền RBAC, theo dõi dòng tiền & doanh thu trực quan, quản trị khuyến mãi & bảo dưỡng kỹ thuật.

### 1.2. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)
- **Hiệu năng (Performance):** 
  - Thời gian phản hồi API trung bình dưới 250ms cho các tác vụ tra cứu xe thông thường.
  - Tối ưu truy vấn kiểm tra trùng lịch đặt xe bằng B-Tree Index trên các cột `(car_id, start_date, end_date, booking_status)`.
  - Frontend First Contentful Paint (FCP) dưới 1.2s; điểm Google Lighthouse Performance >= 90.
- **Bảo mật (Security):**
  - Mật khẩu mã hóa 1 chiều bằng thuật toán `bcrypt` với cost factor = 10.
  - Cơ chế xác thực stateless qua JWT (Access Token hạn 15 phút, Refresh Token lưu HttpOnly Cookie hạn 7 ngày).
  - Phân quyền nghiêm ngặt theo vai trò (Role-Based Access Control - RBAC) tại mọi tầng API Backend.
  - Chống OWASP Top 10: Chống SQL Injection bằng Parameterized Queries (Prisma/Sequelize ORM), XSS Sanitization, CORS Whitelisting, Helmet HTTP headers, Rate Limiting.
- **Tính toàn vẹn dữ liệu (Data Consistency):**
  - Sử dụng ACID Transactions của MySQL (InnoDB Engine) cho quy trình Tạo đơn - Giữ xe - Thanh toán cọc để ngăn chặn triệt để tình trạng Race Condition (2 khách cùng thanh toán 1 xe trong cùng 1 thời điểm).
- **Khả năng mở rộng & tính khả dụng (Scalability & Availability):**
  - Hệ thống kiến trúc dạng Modular Monolith, tách biệt Service Layer, sẵn sàng tách thành Microservices khi lưu lượng xe và giao dịch tăng cao.
  - Tỷ lệ khả dụng (Uptime) mục tiêu: 99.9%.

---

## 2. DANH SÁCH ACTOR & MA TRẬN USE CASE

### 2.1. Danh sách tác nhân (Actors)
1. **Guest (Khách vãng lai):** Xem trang chủ, tìm kiếm danh mục xe, tra cứu thông tin chi tiết xe, xem chính sách thuê xe, đăng ký/đăng nhập.
2. **Customer (Khách hàng đã đăng nhập):** Đặt xe, chọn dịch vụ bổ sung, thanh toán cọc, xem trạng thái đơn cá nhân, hủy đơn theo chính sách, nhận biên nhận và đánh giá xe.
3. **Staff (Nhân viên vận hành):** Tiếp nhận danh sách đơn, thẩm định tính hợp lệ hồ sơ khách, duyệt/từ chối đơn, lập biên bản bàn giao (Check-in) và nghiệm thu thu hồi xe (Check-out), xác nhận thu tiền mặt/chuyển khoản và hoàn tiền cọc.
4. **Admin (Quản trị viên hệ thống):** Toàn quyền kiểm soát tài nguyên, quản lý danh mục xe, cấu hình giá, quản lý tài khoản nhân viên & khách hàng, quản trị mã ưu đãi, giám sát bảo trì xe định kỳ, xem báo cáo thống kê chuyên sâu.
5. **System / Cron Job:** Tự động hủy các đơn thuê chưa thanh toán cọc sau 30 phút kể từ lúc đặt, tự động chuyển trạng thái nhắc lịch bảo dưỡng xe.

---

## 3. QUY TRÌNH NGHIỆP VỤ & ACTIVITY FLOW

1. **Khách hàng tìm kiếm xe:** Chọn địa điểm, ngày giờ nhận và trả xe.
2. **Hệ thống lọc xe khả dụng:** Sử dụng giải thuật Overlap: `(start_date < existing_end AND end_date > existing_start)` loại bỏ xe đã có lịch `PENDING, DEPOSIT_PAID, CONFIRMED, ACTIVE`.
3. **Khách chọn dịch vụ & áp mã Voucher:** Hệ thống tính tự động: Tiền thuê + Dịch vụ - Voucher + Cọc quy định.
4. **Xác nhận đặt đơn:** Hệ thống tạo đơn trạng thái `PENDING` và tạm giữ chỗ trong 30 phút.
5. **Thanh toán tiền cọc:** Khách thanh toán qua cổng VNPAY/MoMo hoặc chuyển khoản. Khi thanh toán thành công -> trạng thái `DEPOSIT_PAID`.
6. **Nhân viên thẩm định hồ sơ:** Kiểm tra bằng lái GPLX và CCCD. Nếu đạt -> `CONFIRMED`. Nếu không đạt -> `REJECTED` và hoàn tiền cọc tự động.
7. **Bàn giao xe (Check-in):** Nhân viên chụp ảnh 4 góc xe, ghi chỉ số ODO ban đầu và lượng nhiên liệu -> chuyển đơn thành `ACTIVE` và xe thành `RENTED`.
8. **Khách sử dụng xe:** Lưu thông an toàn theo thời gian hợp đồng.
9. **Thu hồi xe (Check-out):** Nhân viên kiểm tra ODO thực tế (tính phí vượt km nếu có), kiểm tra trầy xước/hư tổn mới, kiểm tra mức nhiên liệu.
10. **Quyết toán & Hoàn cọc:** Bù trừ tiền cọc với chi phí thuê còn lại và phụ phí phát sinh -> đơn chuyển `COMPLETED` và xe thành `AVAILABLE`.
11. **Đánh giá dịch vụ:** Khách hàng đánh giá số sao (1-5★) và để lại nhận xét.

---

## 4. BẢNG MÔ HÌNH TRẠNG THÁI NGHIỆP VỤ (STATE MACHINE)

### 4.1. Đơn thuê xe (Booking Status)
- `PENDING`: Vừa tạo đơn, chờ khách thanh toán tiền cọc trong 30 phút.
- `DEPOSIT_PAID`: Đã thanh toán tiền cọc, chờ nhân viên duyệt hồ sơ.
- `CONFIRMED`: Nhân viên đã phê duyệt, sẵn sàng bàn giao xe theo lịch.
- `ACTIVE`: Đã bàn giao xe cho khách (khách đang lưu thông).
- `COMPLETED`: Đã trả xe, nghiệm thu xong và hoàn tất quyết toán.
- `CANCELLED`: Đơn bị hủy (bởi khách hoặc do timeout).
- `REJECTED`: Bị từ chối bởi nhân viên (hồ sơ không đủ điều kiện).

### 4.2. Thanh toán (Payment Status)
- `UNPAID`: Chưa thực hiện thanh toán.
- `PARTIALLY_PAID`: Đã thanh toán tiền cọc.
- `PAID`: Đã quyết toán đầy đủ 100% tiền thuê và phụ phí.
- `REFUND_PENDING`: Đang chờ chuyển khoản hoàn trả cọc.
- `REFUNDED`: Đã hoàn tất hoàn cọc cho khách.
- `FAILED`: Giao dịch thanh toán thất bại.

### 4.3. Xe (Car Status)
- `AVAILABLE`: Xe sẵn sàng đón khách.
- `RESERVED`: Xe đã được đặt cọc cho chuyến sắp tới.
- `RENTED`: Xe đang trong chuyến hành trình với khách.
- `MAINTENANCE`: Xe đang trong xưởng bảo dưỡng, sửa chữa.
- `INACTIVE`: Tạm thời ngừng kinh doanh.

---

## 4. QUY CHUẨN TRANG THEO DÕI TRẠNG THÁI THUÊ (RENTAL PROGRESS TRACKING)

### 4.1. Mục đích
Theo dõi tiến trình chi tiết của một đơn thuê từ khi đặt xe đến khi hoàn tất chuyến đi và tất toán cọc, đảm bảo khách hàng và nhân viên vận hành luôn đồng bộ thông tin theo thời gian thực.

### 4.2. Thanh tiến trình 11 bước chuẩn hóa
1. **Đặt xe:** Khách hàng tạo đơn thuê thành công trên hệ thống.
2. **Xác nhận đơn:** Hệ thống & nhân viên tiếp nhận, kiểm tra tính khả dụng của xe và duyệt đơn.
3. **Tạo và xác nhận hợp đồng:** Soạn thảo hợp đồng điện tử và khách hàng ký xác nhận trực tuyến.
4. **Đặt cọc:** Khách hàng thanh toán tiền cọc bảo đảm qua VietQR / VNPay Sandbox.
5. **Sẵn sàng giao xe:** Kỹ thuật viên kiểm tra 30 hạng mục, rửa xe, khử khuẩn và nạp 100% nhiên liệu.
6. **Giao xe:** Nhân viên và khách hàng đối chiếu ODO, mức xăng, kiểm tra 4 góc xe và bàn giao chìa khóa.
7. **Đang thuê:** Xe đang lưu thông phục vụ hành trình của khách hàng.
8. **Nhận lại xe:** Khách trả xe tại điểm hẹn, nhân viên đối chiếu số km và mức nhiên liệu.
9. **Chốt hóa đơn và thanh toán:** Chốt bảng kê chi phí thực tế, khấu trừ phụ phí vượt km/xăng nếu có.
10. **Đối soát và hoàn cọc:** Kế toán đối soát và chuyển khoản hoàn cọc bảo đảm về tài khoản khách hàng.
11. **Hoàn thành:** Kết thúc chuyến đi, khách hàng gửi đánh giá và nhận điểm thưởng hội viên.

### 4.3. Thông tin bổ sung bắt buộc
- **Mã đơn và trạng thái hiện tại:** Hiển thị nổi bật dạng font monospace, badge trạng thái với đèn tín hiệu nhấp nháy (pulsing beacon dot), thanh % tiến độ tổng thể.
- **Thời gian cập nhật gần nhất:** Hiển thị timestamp chính xác lần cập nhật dữ liệu mới nhất kèm nút làm mới (Refresh).
- **Chi nhánh, địa chỉ nhận/trả:** Chi tiết điểm nhận và trả xe, giờ hẹn đón xe, tích hợp nút dẫn đường Google Maps.
- **Thông tin liên hệ hỗ trợ:** Hotline CSKH 24/7 (1900 8899), cứu hộ khẩn cấp SOS phím 1, tên và số điện thoại của chuyên viên phụ trách giao nhận xe.
- **Ghi chú của nhân viên:** Ghi chú thực tế về tình trạng chuẩn bị phương tiện, phụ kiện kèm theo (bơm lốp, bộ sơ cứu) và lưu ý xuất trình CCCD/GPLX gốc.

