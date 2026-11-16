/**
 * Dữ liệu tĩnh đã được xóa hoàn toàn theo yêu cầu hệ thống.
 * 100% dữ liệu (Xe, Hãng xe, Loại xe, Chi nhánh, Khách hàng, Dịch vụ, Mã giảm giá, Đơn thuê, Hợp đồng, Giao nhận, Bảo trì, Đánh giá)
 * được nạp trực tiếp từ cơ sở dữ liệu Microsoft SQL Server (QuanLyChoThueOto) thông qua C# .NET 8.0 Backend Web API.
 */

export const INITIAL_BRANDS = [];
export const INITIAL_CATEGORIES = [];
export const INITIAL_FEATURES = [];
export const INITIAL_SERVICES = [];
export const INITIAL_PROMOTIONS = [];
export const INITIAL_CARS = [];
export const INITIAL_BOOKINGS = [];
export const INITIAL_BRANCHES = [];
export const INITIAL_CUSTOMERS = [];
export const INITIAL_STAFF = [];
export const INITIAL_MAINTENANCE = [];
export const INITIAL_SYSTEM_SETTINGS = {
  companyName: 'CarRental Việt Nam',
  slogan: 'Hệ thống quản lý và cho thuê xe ô tô trực tuyến',
  email: 'support@carrental.com',
  hotline: '0123 456 789',
  emergencyPhone: '1900 8899',
  headquarters: 'Số 123, đường ABC, Hà Nội',
  dailyMileageLimit: 300,
  extraMileageCharge: 5000,
  depositRatePercentage: 100,
  enableVietQR: true,
  enableVnpay: true
};
