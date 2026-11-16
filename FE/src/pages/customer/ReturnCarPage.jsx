import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  RotateCcw,
  Gauge,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ReturnCarPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [returnMileage, setReturnMileage] = useState('');
  const [returnFuel, setReturnFuel] = useState(90);
  const [damageNotes, setDamageNotes] = useState('Xe hoàn trả sạch sẽ, không có va quẹt hay trầy xước sơn mới.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    const foundCar = storageService.getCarById(b.carId);
    setCar(foundCar);

    const startKm = b.handoverCheckIn ? b.handoverCheckIn.currentMileage : (foundCar?.currentMileage || 12000);
    // Gợi ý số ODO lúc trả
    setReturnMileage(String(startKm + 280));
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang chuẩn bị thủ tục trả xe...</div>;
  }

  const startKm = booking.handoverCheckIn ? booking.handoverCheckIn.currentMileage : (car.currentMileage || 12000);
  const endKm = Number(returnMileage) || startKm;
  const actualDrivenKm = Math.max(0, endKm - startKm);
  const maxAllowedKm = (car.mileageLimitPerDay || 300) * booking.totalDays;
  const extraKm = Math.max(0, actualDrivenKm - maxAllowedKm);
  const extraKmCost = extraKm * (car.extraMileageCharge || 5000);

  const handleConfirmReturn = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      storageService.customerSubmitReturn(booking.id, {
        returnMileage: endKm,
        returnFuel,
        damageNotes,
      });

      toast.success('Bàn giao trả xe thành công! Chuyển sang bước chốt hóa đơn thanh quyết toán.');
      setIsSubmitting(false);
      // Chuyển tiếp liền mạch sang Bước 9: Chốt hóa đơn
      navigate(`/settlement/${booking.id}`);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Stepper */}
      <JourneyStepper currentStepId={8} bookingId={booking.id} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Bước 8 trong hành trình: Trả xe
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
              <RotateCcw className="w-7 h-7 text-blue-600" /> Bàn Giao Trả Xe & Nghiệm Thu ODO
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Khách hàng hoàn trả chìa khóa xe tại điểm hẹn và cùng nhân viên ghi nhận số km đã di chuyển.
            </p>
          </div>

          <Badge status={booking.bookingStatus} type="booking" />
        </div>
      </div>

      {/* Form bàn giao trả xe */}
      <form onSubmit={handleConfirmReturn} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số công tơ mét ODO lúc hoàn trả (km) *
            </label>
            <input
              type="number"
              value={returnMileage}
              onChange={(e) => setReturnMileage(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mức nhiên liệu / Pin lúc hoàn trả (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={returnFuel}
              onChange={(e) => setReturnFuel(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 font-mono font-bold"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú tình trạng ngoại thất lúc hoàn trả
            </label>
            <textarea
              rows={2}
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Bảng tính toán nhanh số km chạy */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase">Đối chiếu công tơ mét ODO:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">ODO nhận xe:</span>
              <strong className="font-mono text-slate-900">{startKm.toLocaleString()} km</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">ODO lúc trả:</span>
              <strong className="font-mono text-slate-900">{endKm.toLocaleString()} km</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Thực tế đã chạy:</span>
              <strong className="font-mono text-blue-600">{actualDrivenKm} km</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Định mức cho phép:</span>
              <strong className="font-mono text-slate-900">{maxAllowedKm} km</strong>
            </div>
          </div>

          {extraKm > 0 ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
              <span>Chạy vượt định mức: <strong>{extraKm} km</strong></span>
              <span>Phụ thu vượt km: <strong className="font-bold">{formatCurrency(extraKmCost)}</strong></span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              ✓ Quãng đường di chuyển nằm trong định mức miễn phí ({maxAllowedKm} km). Không phát sinh phụ phí!
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Link to={`/tracking/${booking.id}`} className="text-xs text-slate-500 hover:text-slate-800">
            ← Quay lại Theo dõi thuê
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={CheckCircle2}
            className="font-bold shadow-lg"
          >
            Tiếp tục: Chốt hóa đơn thanh quyết toán →
          </Button>
        </div>
      </form>
    </div>
  );
}
