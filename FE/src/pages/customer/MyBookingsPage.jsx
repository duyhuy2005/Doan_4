import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarCheck2,
  Calendar,
  MapPin,
  Clock,
  Star,
  XCircle,
  FileText,
  Car,
  ChevronRight,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuthStore();
  const toast = useToastStore();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const loadBookings = () => {
    const list = storageService.getBookings({ userId: user?.id || 3 });
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return b.bookingStatus === 'ACTIVE';
    if (activeTab === 'PENDING') return b.bookingStatus === 'PENDING' || b.bookingStatus === 'DEPOSIT_PAID';
    if (activeTab === 'COMPLETED') return b.bookingStatus === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED';
    return true;
  });

  const handleOpenCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;
    try {
      storageService.updateBookingStatus(bookingToCancel.id, 'CANCELLED', 'Khách hàng tự hủy đơn');
      toast.success('Đã hủy đơn thuê xe thành công. Tiền cọc sẽ được hoàn lại theo chính sách.');
      setIsCancelModalOpen(false);
      loadBookings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    try {
      storageService.addReview(selectedBookingForReview.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Cảm ơn bạn đã gửi đánh giá trải nghiệm chuyến đi!');
      setSelectedBookingForReview(null);
      setReviewComment('');
      loadBookings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <CalendarCheck2 className="w-7 h-7 text-blue-600" /> Đơn Thuê Xe Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi tiến độ duyệt, lịch bàn giao xe và lịch sử các chuyến đi của bạn.
          </p>
        </div>
        <Link to="/cars">
          <Button variant="primary" size="sm">
            Thuê thêm xe mới
          </Button>
        </Link>
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs sm:text-sm font-semibold">
        {[
          { key: 'ALL', label: 'Tất cả đơn' },
          { key: 'ACTIVE', label: 'Đang lưu hành' },
          { key: 'PENDING', label: 'Chờ duyệt & Đã cọc' },
          { key: 'COMPLETED', label: 'Đã hoàn tất' },
          { key: 'CANCELLED', label: 'Đã hủy / Từ chối' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách đơn */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6 space-y-4"
            >
              {/* Header đơn: Mã đơn, Thời gian tạo, Trạng thái */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-mono text-slate-900">{b.bookingCode}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Đặt lúc: {formatDateTime(b.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={b.paymentStatus} type="payment" />
                  <Badge status={b.bookingStatus} type="booking" />
                </div>
              </div>

              {/* Thông tin chuyến xe */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                  <img
                    src={b.carThumbnail}
                    alt={b.carName}
                    className="w-full h-32 rounded-2xl object-cover bg-slate-100"
                  />
                </div>

                <div className="md:col-span-2 space-y-2 text-left">
                  <h3 className="text-base font-bold text-slate-900">{b.carName}</h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Từ <strong>{formatDateTime(b.startDate)}</strong> đến <strong>{formatDateTime(b.endDate)}</strong> (
                        <strong>{b.totalDays} ngày</strong>)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Nhận tại: <strong>{b.pickupLocation}</strong></span>
                    </div>
                  </div>

                  {b.selectedServices && b.selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {b.selectedServices.map((svc, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          +{svc.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 md:text-right space-y-1">
                  <div className="text-xs text-slate-500">Tổng thanh toán</div>
                  <div className="text-lg font-black text-blue-600">
                    {formatCurrency(b.totalPrice)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Đã cọc: <strong className="text-slate-800">{formatCurrency(b.depositAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Thông tin biên bản bàn giao & nghiệm thu nếu có */}
              {b.handoverCheckIn && (
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Biên bản Check-in giao xe:
                  </div>
                  <div className="text-slate-600">
                    ODO xuất phát: <strong>{b.handoverCheckIn.currentMileage} km</strong> | Nhiên liệu: <strong>{b.handoverCheckIn.fuelPercentage}%</strong> | Ghi chú: {b.handoverCheckIn.conditionNotes}
                  </div>
                </div>
              )}

              {b.handoverCheckOut && (
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Biên bản Check-out nhận lại xe:
                  </div>
                  <div className="text-slate-600">
                    ODO lúc trả: <strong>{b.handoverCheckOut.currentMileage} km</strong> | Phụ phí phát sinh: <strong>{formatCurrency(b.handoverCheckOut.totalExtraCharge)}</strong> | Tiền cọc đã hoàn: <strong>{formatCurrency(b.handoverCheckOut.depositRefundAmount)}</strong>
                  </div>
                </div>
              )}

              {/* Đánh giá nếu có */}
              {b.review && (
                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  <div className="flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Đánh giá của bạn: {b.review.rating} / 5 sao</span>
                  </div>
                  <p className="italic text-slate-600 mt-1">"{b.review.comment}"</p>
                </div>
              )}

              {/* Actions Button theo đúng luồng 11 chặng */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-end items-center gap-2">
                {b.bookingStatus === 'PENDING' && (
                  <Link to={`/payment/${b.id}`}>
                    <Button variant="accent" size="sm">
                      1. Thanh toán cọc ngay
                    </Button>
                  </Link>
                )}

                {b.bookingStatus === 'DEPOSIT_PAID' && (
                  <Link to={`/contract/${b.id}`}>
                    <Button variant="primary" size="sm" icon={FileText}>
                      2. Ký hợp đồng điện tử
                    </Button>
                  </Link>
                )}

                {b.bookingStatus === 'CONFIRMED' && (
                  <Link to={`/pickup/${b.id}`}>
                    <Button variant="accent" size="sm" className="font-bold">
                      3. Bàn giao & Nhận xe
                    </Button>
                  </Link>
                )}

                {b.bookingStatus === 'ACTIVE' && (
                  <>
                    <Link to={`/tracking/${b.id}`}>
                      <Button variant="secondary" size="sm" icon={Clock}>
                        Theo dõi thuê & SOS
                      </Button>
                    </Link>
                    <Link to={`/return/${b.id}`}>
                      <Button variant="accent" size="sm" className="font-bold">
                        Bàn giao trả xe
                      </Button>
                    </Link>
                  </>
                )}

                {b.bookingStatus === 'COMPLETED' && (
                  <>
                    <Link to={`/settlement/${b.id}`}>
                      <Button variant="outline" size="sm">
                        Chốt hóa đơn
                      </Button>
                    </Link>
                    <Link to={`/refund/${b.id}`}>
                      <Button variant="outline" size="sm">
                        Biên nhận hoàn cọc
                      </Button>
                    </Link>
                    <Link to={`/review-trip/${b.id}`}>
                      <Button variant="primary" size="sm" icon={Star}>
                        {b.review ? 'Xem đánh giá' : 'Đánh giá chuyến đi'}
                      </Button>
                    </Link>
                  </>
                )}

                <Link to={`/tracking/${b.id}`}>
                  <Button variant="outline" size="sm" icon={Clock} className="font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
                    Theo dõi tiến trình
                  </Button>
                </Link>

                <Link to={`/contract/${b.id}`}>
                  <Button variant="outline" size="sm">
                    Xem HĐ
                  </Button>
                </Link>

                {(b.bookingStatus === 'PENDING' || b.bookingStatus === 'DEPOSIT_PAID') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenCancel(b)}
                  >
                    Hủy đơn
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Bạn chưa có đơn thuê xe nào"
          description="Hãy khám phá các dòng xe đời mới của AutoRental và bắt đầu chuyến hành trình của bạn ngay hôm nay!"
          actionLabel="Tìm xe ngay"
          onAction={() => {}}
        />
      )}

      {/* Modal Đánh giá xe */}
      <Modal
        isOpen={Boolean(selectedBookingForReview)}
        onClose={() => setSelectedBookingForReview(null)}
        title="Đánh giá chất lượng xe & dịch vụ"
      >
        {selectedBookingForReview && (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="text-xs text-slate-500">
              Bạn đang đánh giá cho chuyến đi xe: <strong>{selectedBookingForReview.carName}</strong> (Mã đơn: {selectedBookingForReview.bookingCode})
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Mức độ hài lòng của bạn
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= reviewRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-slate-800 ml-2">
                  {reviewRating} sao
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhận xét & Trải nghiệm thực tế của bạn
              </label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="vd: Xe chạy rất êm, máy lạnh mát sâu, nhân viên nhiệt tình chu đáo..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBookingForReview(null)}
              >
                Đóng
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Gửi đánh giá
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Xác nhận hủy đơn */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Xác nhận hủy đơn thuê xe"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn hủy đơn thuê xe{' '}
            <strong>{bookingToCancel?.bookingCode}</strong> ({bookingToCancel?.carName}) không?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            Tiền đặt cọc sẽ được hoàn trả về tài khoản của bạn trong 24 giờ làm việc theo chính sách của AutoRental.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Quay lại
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Xác nhận hủy đơn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
