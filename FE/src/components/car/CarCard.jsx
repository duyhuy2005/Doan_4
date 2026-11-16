import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Fuel, Gauge, Star, ShieldCheck, Zap, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useBookingDraftStore } from '../../store/bookingDraftStore';

export default function CarCard({ car }) {
  const navigate = useNavigate();
  const { setSelectedCarId } = useBookingDraftStore();

  if (!car) return null;

  const handleBookNow = (e) => {
    e.preventDefault();
    setSelectedCarId(car.id);
    navigate(`/checkout?carId=${car.id}`);
  };

  const transmissionLabel =
    car.transmission === 'AUTOMATIC' || car.transmission === 'TU_DONG'
      ? 'Số tự động'
      : 'Số sàn';

  const fuelLabel =
    car.fuelType === 'ELECTRIC' || car.fuelType === 'DIEN'
      ? 'Điện'
      : car.fuelType === 'DIESEL' || car.fuelType === 'DAU'
      ? 'Dầu'
      : car.fuelType === 'HYBRID'
      ? 'Hybrid'
      : 'Xăng';

  const thumbnailSrc =
    car.thumbnail ||
    car.thumbnailUrl ||
    (Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : null) ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800';

  const carTitle = car.name || car.carName || 'Xe ô tô';
  const brandTitle = car.brandName || car.brand?.name || 'AutoRental';
  const categoryTitle = car.categoryName || car.category?.name || 'Sedan';
  const locationText = car.location || car.branchName || 'Quận 1, TP. Hồ Chí Minh';
  const tripsCount = car.tripCount || (Math.floor((car.id * 17) % 80) + 12);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail image & Badges */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={thumbnailSrc}
          alt={carTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
            {brandTitle}
          </span>
          <Badge status={car.status || 'AVAILABLE'} type="car" />
        </div>

        {/* Mioto-style Bottom Badges */}
        <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
          {(car.fuelType === 'ELECTRIC' || car.fuelType === 'DIEN') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md">
              <Zap className="w-3 h-3 fill-white" /> Xe điện EV
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/85 backdrop-blur-md text-amber-300 shadow-md">
            <Sparkles className="w-3 h-3" /> Giao xe tận nơi
          </span>
        </div>
      </div>

      {/* Car Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Star rating & Trip Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {categoryTitle}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 font-bold text-slate-900">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{car.rating || 5.0}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-medium">• {tripsCount} chuyến</span>
            </div>
          </div>

          {/* Car Name */}
          <Link to={`/cars/${car.id}`} className="block">
            <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {carTitle}
            </h3>
          </Link>

          {/* Location tag */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          {/* Specifications Pills */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 py-2 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1 justify-center bg-slate-50 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.seats || 5} chỗ</span>
            </div>
            <div className="flex items-center gap-1 justify-center bg-slate-50 py-1 rounded-lg">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{transmissionLabel}</span>
            </div>
            <div className="flex items-center gap-1 justify-center bg-slate-50 py-1 rounded-lg">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              <span>{fuelLabel}</span>
            </div>
          </div>

          {/* Mioto Perks Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
              ✓ Miễn thế chấp
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
              ⚡ Đặt xe nhanh
            </span>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Bảo hiểm chuyến đi
            </span>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Giá thuê</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 font-mono">
                {formatCurrency(car.dailyPrice || 600000)}
              </span>
              <span className="text-xs text-slate-500">/ngày</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link to={`/cars/${car.id}`}>
              <Button variant="outline" size="sm">
                Chi tiết
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBookNow}
              disabled={car.status !== 'AVAILABLE' && car.status !== 'HOAT_DONG'}
            >
              {(car.status === 'AVAILABLE' || car.status === 'HOAT_DONG') ? 'Thuê ngay' : 'Đã bận'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
