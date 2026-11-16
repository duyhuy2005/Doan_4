import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Zap,
  Heart,
  Crown,
  MapPin,
  Clock,
  ShieldCheck,
  Fuel,
  Users,
  Gauge,
  Sliders,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useBookingDraftStore } from '../../store/bookingDraftStore';

export default function MiotoCarCard({ car }) {
  const navigate = useNavigate();
  const { setSelectedCarId } = useBookingDraftStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!car) return null;

  const handleCardClick = () => {
    setSelectedCarId(car.id);
    navigate(`/cars/${car.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Tính toán nhãn hộp số
  const transmissionText =
    car.transmission === 'MANUAL' || car.transmission === 'SO_SAN'
      ? 'Số sàn'
      : 'Số tự động';

  // Tính toán nhãn nhiên liệu
  const fuelText =
    car.fuelType === 'ELECTRIC' || car.fuelType === 'DIEN'
      ? 'Điện EV'
      : car.fuelType === 'DIESEL' || car.fuelType === 'DAU'
      ? 'Dầu diesel'
      : car.fuelType === 'HYBRID'
      ? 'Hybrid'
      : 'Xăng';

  // Hình ảnh
  const images = Array.isArray(car.images) && car.images.length > 0
    ? car.images
    : [
        car.thumbnailUrl ||
          car.thumbnail ||
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
      ];

  const currentImage = images[currentImgIndex] || images[0];

  // Giá và chiết khấu chuẩn Mioto
  const dailyPrice = car.dailyPrice || 609000;
  const originalPrice = car.originalPrice || Math.round((dailyPrice * 1.2) / 1000) * 1000;
  const discountPercent =
    car.discountPercent ||
    Math.max(10, Math.min(25, Math.round(((originalPrice - dailyPrice) / originalPrice) * 100)));
  const hourlyPrice = car.hourlyPrice || Math.round((dailyPrice * 0.7) / 1000) * 1000;

  // Format số nghìn K gọn gàng như Mioto (ví dụ: 609K, 729K, 1.125K)
  const formatKPrice = (price) => {
    if (!price) return '609K';
    const num = Math.round(price / 1000);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(3).replace('.', '.')}K`;
    }
    return `${num}K`;
  };

  // Số chuyến
  const tripsCount = car.tripCount || (Math.floor(((car.id || 1) * 23) % 95) + 25);
  const locationText = car.location || car.branchName || 'Phường An Phú, Quận Thủ Đức';
  const carTitle = (car.name || car.carName || 'Xe ô tô').toUpperCase();

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. KHUNG ẢNH XE & CÁC HUY HIỆU OVERLAY */}
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
        <img
          src={currentImage}
          alt={carTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top-Left: Badge Đặt xe nhanh ⚡ */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <div
            className="w-7 h-7 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center shadow-md"
            title="Đặt xe nhanh - Duyệt tự động"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
        </div>

        {/* Top-Right: Yêu thích ♡ */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Lưu vào danh sách yêu thích"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white'
            }`}
          />
        </button>

        {/* Image Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImgIndex ? 'bg-white w-3' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom-Left: MICARRO / PRO HOST Badge with Crown 👑 */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-[#1976d2] text-white flex items-center justify-center text-[7px] font-black shadow-md border border-white/60 uppercase">
            HOST
          </div>
          <div className="w-4 h-2 bg-amber-400 rounded-full -mt-0.5 flex items-center justify-center shadow-xs">
            <Crown className="w-2.5 h-2.5 text-amber-900 fill-amber-900" />
          </div>
        </div>

        {/* Bottom-Right: Badge Chiết khấu cam `Giảm X% - Chuyến đầu` */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="bg-[#ff5722] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
            Giảm {discountPercent}% - Chuyến đầu
          </span>
        </div>
      </div>

      {/* 2. NỘI DUNG THẺ XE */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          {/* Tags row: Miễn thế chấp + Giao xe tận nơi */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]">
              <ShieldCheck className="w-3 h-3 text-[#2e7d32]" />
              <span>Miễn thế chấp</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]">
              <MapPin className="w-3 h-3 text-[#e65100]" />
              <span>Giao xe tận nơi</span>
            </span>
          </div>

          {/* Car Title (Chữ in hoa đậm) */}
          <h3 className="font-black text-[13px] text-slate-900 line-clamp-1 tracking-tight group-hover:text-emerald-600 transition-colors">
            {carTitle}
          </h3>

          {/* Specs row: Số tự động | 5 chỗ | Xăng */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span>{transmissionText}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{car.seats || 5} chỗ</span>
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3 h-3 text-slate-400" />
              <span>{fuelText}</span>
            </span>
          </div>

          {/* Location row: Phường An Phú, Quận Thủ Đức */}
          <div className="flex items-center gap-1 text-[11px] text-slate-700 font-semibold truncate pt-0.5">
            <MapPin className="w-3 h-3 text-slate-900 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        </div>

        {/* 3. FOOTER ROW: ĐÁNH GIÁ & GIÁ TIỀN */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
          {/* Bên trái: Sao đánh giá & Số chuyến (Icon xanh lá chuẩn Mioto) */}
          <div className="flex items-center gap-1 text-[11px]">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(car.rating || 5.0).toFixed(1)}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>{car.tripDisplay || (car.tripCount === 100 ? '100+ chuyến' : `${tripsCount} chuyến`)}</span>
            </div>
          </div>

          {/* Bên phải: Giá gốc gạch ngang + Giá ngày xanh + Gói 4 giờ xanh dương */}
          <div className="text-right space-y-0.5">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[11px] text-slate-400 line-through font-semibold">
                {formatKPrice(originalPrice)}
              </span>
              <span className="text-sm font-black text-[#00a86b] font-mono">
                {formatKPrice(dailyPrice)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">/ngày</span>
            </div>

            {/* Gói thuê theo giờ (4 giờ) */}
            <div className="text-[10px] font-bold text-[#0288d1] flex items-center justify-end gap-0.5">
              <Clock className="w-2.5 h-2.5 text-[#0288d1]" />
              <span>{formatKPrice(hourlyPrice)} gói 4 giờ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
