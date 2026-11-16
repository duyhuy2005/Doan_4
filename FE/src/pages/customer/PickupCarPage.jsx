import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  Car,
  Gauge,
  Fuel,
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function PickupCarPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [hasInspected, setHasInspected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId));
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang chuẩn bị biên bản nhận xe...</div>;
  }

  const handleConfirmPickup = (e) => {
    e.preventDefault();
    if (!hasInspected) {
      toast.warning('Vui lòng tích xác nhận bạn đã cùng nhân viên kiểm tra tình trạng xe.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      storageService.customerConfirmPickup(booking.id);
      toast.success('Xác nhận nhận xe thành công! Chúc bạn có một hành trình an toàn và trọn vẹn.');
      setIsSubmitting(false);
      // Chuyển tiếp liền mạch sang Bước 7: Theo dõi thuê
      navigate(`/tracking/${booking.id}`);
    }, 600);
  };

  const startMileage = booking.handoverCheckIn ? booking.handoverCheckIn.currentMileage : (car.currentMileage || 12000);
  const fuelPercent = booking.handoverCheckIn ? booking.handoverCheckIn.fuelPercentage : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Progress Stepper */}
      <JourneyStepper currentStepId={6} bookingId={booking.id} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Bước 6 trong hành trình: Nhận xe
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
              <Key className="w-7 h-7 text-blue-600" /> Bàn Giao & Nhận Chìa Khóa Xe
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Đồng kiểm tra ngoại quan, chỉ số đồng hồ ODO và nhận bàn giao xe từ nhân viên AutoRental.
            </p>
          </div>

          <Badge status={booking.bookingStatus} type="booking" />
        </div>
      </div>

      {/* Thông tin Xe & Nhân viên giao xe */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-center pb-6 border-b border-slate-100">
          <img
            src={car.thumbnail}
            alt={car.name}
            className="w-full sm:w-48 aspect-16/10 rounded-2xl object-cover"
          />
          <div className="flex-1 space-y-1.5 text-left">
            <span className="text-xs font-bold text-blue-600 uppercase">{car.brandName} • {car.categoryName}</span>
            <h3 className="text-xl font-bold text-slate-900">{car.name}</h3>
            <div className="text-xs text-slate-500">Biển số: <strong className="font-mono text-slate-800">{car.licensePlate}</strong></div>
            <div className="text-xs text-slate-500">Điểm bàn giao: <strong>{booking.pickupLocation}</strong></div>
          </div>
        </div>

        {/* Biên bản kiểm tra ngoại quan (Check-in Checklist) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Chỉ số hiện trạng xe lúc bàn giao
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <Gauge className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500">Chỉ số ODO xuất phát</div>
              <div className="text-xl font-black font-mono text-slate-900 mt-1">
                {startMileage.toLocaleString()} km
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <Fuel className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500">Mức nhiên liệu / Pin</div>
              <div className="text-xl font-black font-mono text-emerald-600 mt-1">
                {fuelPercent}% (Đầy bình)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <UserCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500">Nhân viên bàn giao</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {booking.handoverCheckIn?.staffName || 'Lê Hoàng Long'}
              </div>
            </div>
          </div>

          {/* Ảnh chụp ngoại quan 4 góc xe */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" /> Ảnh chụp hiện trạng xe trước khi lăn bánh
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(booking.handoverCheckIn?.damagePhotos || [
                car.thumbnail,
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&fit=crop&q=80',
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&fit=crop&q=80',
                'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&fit=crop&q=80',
              ]).map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-16/10 border border-slate-200 bg-slate-100">
                  <img src={photo} alt="Hiện trạng" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              * Hình ảnh được lưu trên hệ thống làm căn cứ đối chiếu khi trả xe, bảo vệ quyền lợi không bị phạt oan cho khách hàng.
            </p>
          </div>
        </div>

        {/* Form xác nhận nhận xe */}
        <form onSubmit={handleConfirmPickup} className="pt-4 border-t border-slate-100 space-y-4">
          <label className="flex items-start gap-2.5 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl cursor-pointer">
            <input
              type="checkbox"
              checked={hasInspected}
              onChange={(e) => setHasInspected(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-blue-950 leading-relaxed font-medium">
              Tôi xác nhận đã nhận chìa khóa, giấy tờ xe (bản sao công chứng + bảo hiểm) và đồng ý với chỉ số ODO xuất phát là <strong>{startMileage.toLocaleString()} km</strong>.
            </span>
          </label>

          <div className="flex justify-between items-center pt-2">
            <Link to={`/contract/${booking.id}`} className="text-xs text-slate-500 hover:text-slate-800">
              ← Xem lại hợp đồng
            </Link>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              icon={CheckCircle2}
              className="font-bold shadow-lg shadow-red-600/20"
            >
              Tiếp tục: Bắt đầu hành trình lưu hành →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
