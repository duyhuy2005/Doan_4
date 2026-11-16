import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Star,
  Sparkles,
  Gift,
  CheckCircle2,
  Car,
  MessageSquare,
  ThumbsUp,
  Award,
} from 'lucide-react';

export default function TripReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [rating, setRating] = useState(5);
  const [staffRating, setStaffRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [comment, setComment] = useState('Xe chạy rất êm, máy lạnh mát sâu, nhân viên giao nhận xe cực kỳ nhiệt tình và đúng giờ!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId));
    if (b.review) {
      setIsDone(true);
      setRating(b.review.rating);
      setComment(b.review.comment);
    }
  }, [bookingId, navigate]);

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang chuẩn bị trang đánh giá...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      storageService.addReview(booking.id, {
        rating,
        comment,
      });

      toast.success('Cảm ơn bạn! Đã ghi nhận đánh giá và cộng +100 điểm thưởng thành viên.');
      setIsSubmitting(false);
      setIsDone(true);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Stepper */}
      <JourneyStepper currentStepId={11} bookingId={booking.id} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Bước 11 trong hành trình: Đánh giá & Tích lũy
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
              <Star className="w-7 h-7 text-amber-500 fill-amber-500" /> Đánh Giá Chất Lượng Chuyến Đi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Phản hồi của bạn giúp AutoRental không ngừng nâng cao chất lượng dịch vụ và kho xe.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            <Gift className="w-4 h-4 text-emerald-600" /> +100 Điểm Thưởng
          </div>
        </div>
      </div>

      {/* THẺ ĐÁNH GIÁ & PHẢN HỒI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-center pb-6 border-b border-slate-100">
          <img
            src={car.thumbnail}
            alt={car.name}
            className="w-full sm:w-40 aspect-16/10 rounded-2xl object-cover"
          />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase">{car.brandName} • {car.categoryName}</span>
            <h3 className="text-lg font-bold text-slate-900">{car.name}</h3>
            <div className="text-xs text-slate-500">Mã đơn thuê: <strong className="font-mono text-slate-800">{booking.bookingCode}</strong></div>
          </div>
        </div>

        {isDone ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Bạn đã hoàn tất toàn bộ chu trình thuê xe 11 chặng!
            </h2>
            <div className="flex justify-center gap-1 text-amber-500">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto italic">
              "{comment}"
            </p>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-md mx-auto text-xs text-amber-900 font-medium">
              🎁 Quà tặng tri ân: Bạn nhận được mã giảm giá <strong>LOYALTY10</strong> giảm ngay 10% cho lần thuê tiếp theo!
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Link to="/history">
                <Button variant="outline" size="md">
                  Xem Lịch sử thuê xe
                </Button>
              </Link>
              <Link to="/cars">
                <Button variant="primary" size="md">
                  Tiếp tục thuê xe mới
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 3 Tiêu chí đánh giá sao */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-800">1. Đánh giá chất lượng vận hành của xe:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-2 w-12">{rating} sao</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-800">2. Thái độ phục vụ của nhân viên giao nhận:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStaffRating(s)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= staffRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-2 w-12">{staffRating} sao</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-800">3. Độ sạch sẽ và tiện nghi nội thất:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCleanlinessRating(s)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= cleanlinessRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-2 w-12">{cleanlinessRating} sao</span>
                </div>
              </div>
            </div>

            {/* Ô nhập nhận xét */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lời nhận xét & góp ý chi tiết của bạn *
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link to={`/refund/${booking.id}`} className="text-xs text-slate-500 hover:text-slate-800">
                ← Quay lại bước Hoàn cọc
              </Link>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={isSubmitting}
                icon={CheckCircle2}
                className="font-bold shadow-lg shadow-red-600/20"
              >
                Gửi đánh giá & Hoàn tất chu trình
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
