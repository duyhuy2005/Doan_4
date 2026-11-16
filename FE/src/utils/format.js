/**
 * Format số tiền sang định dạng tiền tệ Việt Nam Đồng (VND)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ngày tháng định dạng hiển thị tiếng Việt DD/MM/YYYY
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format ngày giờ hiển thị DD/MM/YYYY HH:mm
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Tính số ngày thuê giữa 2 mốc thời gian (làm tròn lên tối thiểu 1 ngày)
 */
export function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Thông tin hiển thị của Trạng thái Đơn thuê
 */
export const BOOKING_STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  DEPOSIT_PAID: { label: 'Đã cọc - Chờ duyệt', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  CONFIRMED: { label: 'Đã duyệt - Chờ giao xe', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ACTIVE: { label: 'Đang lưu hành', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  COMPLETED: { label: 'Hoàn tất', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-800 border-red-200' },
};

/**
 * Thông tin hiển thị của Trạng thái Xe
 */
export const CAR_STATUS_MAP = {
  AVAILABLE: { label: 'Sẵn sàng', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  RESERVED: { label: 'Đã được đặt', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  RENTED: { label: 'Đang cho thuê', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  MAINTENANCE: { label: 'Đang bảo dưỡng', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  INACTIVE: { label: 'Ngừng hoạt động', color: 'bg-slate-200 text-slate-700 border-slate-300' },
};

/**
 * Thông tin hiển thị của Trạng thái Thanh toán
 */
export const PAYMENT_STATUS_MAP = {
  UNPAID: { label: 'Chưa thanh toán', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  PARTIALLY_PAID: { label: 'Đã cọc (1 phần)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  PAID: { label: 'Đã thanh toán đủ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REFUND_PENDING: { label: 'Chờ hoàn cọc', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  REFUNDED: { label: 'Đã hoàn cọc', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  FAILED: { label: 'Giao dịch lỗi', color: 'bg-red-100 text-red-800 border-red-200' },
};
