import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService, MIOTO_STATIC_CARS } from '../../services/storageService';
import { useBookingDraftStore } from '../../store/bookingDraftStore';
import { useToastStore } from '../../store/toastStore';
import MiotoCarCard from '../../components/car/MiotoCarCard';
import Button from '../../components/common/Button';
import {
  MapPin,
  Calendar,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Car,
  ChevronRight,
  Tag,
  Copy,
  Check,
  Award,
  Plane,
  ArrowRight,
  ShieldAlert,
  Fuel,
  CreditCard,
  FileCheck2,
  PhoneCall,
  CheckCircle2,
  X,
  ChevronDown,
} from 'lucide-react';

const POPULAR_LOCATIONS = [
  'TP. Hồ Chí Minh',
  'Phường An Phú, Quận Thủ Đức',
  'Quận 1, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Sân bay Quốc tế Tân Sơn Nhất',
  'Hà Nội',
  'Cầu Giấy, Hà Nội',
  'Sân bay Quốc tế Nội Bài',
  'Đà Nẵng',
  'Bình Dương',
  'Bà Rịa - Vũng Tàu',
  'Đà Lạt',
  'Cần Thơ',
  'Nha Trang',
];

const DESTINATIONS = [
  {
    name: 'TP. Hồ Chí Minh',
    count: '6000+ xe',
    address: 'TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hà Nội',
    count: '3000+ xe',
    address: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Đà Nẵng',
    count: '1000+ xe',
    address: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bình Dương',
    count: '500+ xe',
    address: 'Bình Dương',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Đà Lạt',
    count: '200+ xe',
    address: 'Đà Lạt',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Nha Trang',
    count: '200+ xe',
    address: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cần Thơ',
    count: '200+ xe',
    address: 'Cần Thơ',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vũng Tàu',
    count: '150+ xe',
    address: 'Bà Rịa - Vũng Tàu',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80',
  },
];

const AIRPORTS = [
  { name: 'Tân Sơn Nhất', count: '2000+ xe', address: 'Sân bay Quốc tế Tân Sơn Nhất' },
  { name: 'Ga T3 (TSN)', count: '2000+ xe', address: 'Sân bay Quốc tế Tân Sơn Nhất' },
  { name: 'Nội Bài', count: '200+ xe', address: 'Sân bay Quốc tế Nội Bài' },
  { name: 'Đà Nẵng', count: '100+ xe', address: 'Đà Nẵng' },
  { name: 'Cam Ranh', count: '50+ xe', address: 'Nha Trang' },
  { name: 'Liên Khương', count: '30+ xe', address: 'Đà Lạt' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { pickupLocation, startDate, endDate, setSearchParams } = useBookingDraftStore();

  const [rentalType, setRentalType] = useState('SELF_DRIVE'); // SELF_DRIVE | WITH_DRIVER | LONG_TERM
  const [localLocation, setLocalLocation] = useState(pickupLocation || 'TP. Hồ Chí Minh');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Time state formatted like Mioto
  const [dateDisplay, setDateDisplay] = useState('21:00 T4, 11/11 - 20:00 T5, 12/11');
  const [localStartDate, setLocalStartDate] = useState(
    startDate || new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [localEndDate, setLocalEndDate] = useState(
    endDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const [featuredCars, setFeaturedCars] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    // Ưu tiên nạp danh sách xe mẫu Mioto và kết hợp xe từ DB/Storage
    const dbCars = storageService.getCars();
    const combined = [...MIOTO_STATIC_CARS];
    dbCars.forEach((c) => {
      if (!combined.some((item) => item.id === c.id)) {
        combined.push(c);
      }
    });
    setFeaturedCars(combined.slice(0, 4));

    // Nạp khuyến mãi mẫu phong cách Mioto
    const initialPromos = storageService.getPromotions();
    if (initialPromos && initialPromos.length > 0) {
      setPromotions(initialPromos);
    } else {
      setPromotions([
        {
          id: 1,
          code: 'CHUYENDAU20',
          title: 'Ưu đãi khách hàng mới',
          discountPercentage: 20,
          maxDiscount: 300000,
          endDate: '31/12/2026',
        },
        {
          id: 2,
          code: 'WEEKEND500',
          title: 'Cuối tuần thảnh thơi',
          discountPercentage: 15,
          maxDiscount: 500000,
          endDate: '31/12/2026',
        },
        {
          id: 3,
          code: 'VIVUVN',
          title: 'Hành trình xuyên Việt',
          discountPercentage: 0,
          fixedDiscount: 100000,
          endDate: '31/12/2026',
        },
      ]);
    }
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchParams({
      pickupLocation: localLocation,
      returnLocation: localLocation,
      startDate: localStartDate,
      endDate: localEndDate,
    });
    const startMs = new Date(localStartDate).getTime() || 1794405600000;
    const endMs = new Date(localEndDate).getTime() || 1794488400000;
    navigate(
      `/find/filter?startDate=${startMs}&endDate=${endMs}&address=${encodeURIComponent(
        localLocation
      )}&lat=10.8&lng=106.7`
    );
  };

  const handleSelectLocation = (loc) => {
    setLocalLocation(loc);
    setIsLocationModalOpen(false);
  };

  const handleDestinationClick = (address) => {
    setLocalLocation(address);
    const startMs = new Date(localStartDate).getTime() || 1794405600000;
    const endMs = new Date(localEndDate).getTime() || 1794488400000;
    navigate(
      `/find/filter?startDate=${startMs}&endDate=${endMs}&address=${encodeURIComponent(
        address
      )}&lat=10.8&lng=106.7`
    );
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION & MIOTO SIGNATURE SEARCH WIDGET */}
      <section className="relative bg-gradient-to-b from-emerald-50/70 via-white to-slate-50/40 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header Tagline & Title */}
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Nền tảng thuê xe tự lái thông minh & uy tín
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              AutoRental - Cùng Bạn Trên Mọi Hành Trình
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Trải nghiệm sự khác biệt từ hơn 15.000 xe gia đình & xe điện đời mới khắp Việt Nam
            </p>
          </div>

          {/* Search Box Container */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/60 border border-slate-200/90">
            {/* Rental Mode Tabs (Mioto style) */}
            <div className="flex items-center justify-center gap-2 pb-5 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setRentalType('SELF_DRIVE')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  rentalType === 'SELF_DRIVE'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Car className="w-4 h-4" /> Xe tự lái
              </button>
              <button
                type="button"
                onClick={() => {
                  setRentalType('WITH_DRIVER');
                  toast.info('Chế độ xe có tài xế phục vụ đưa đón tận nơi');
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  rentalType === 'WITH_DRIVER'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Award className="w-4 h-4" /> Xe có tài xế
              </button>
              <button
                type="button"
                onClick={() => {
                  setRentalType('LONG_TERM');
                  toast.info('Gói thuê xe theo tháng / dài hạn tiết kiệm tới 40%');
                }}
                className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  rentalType === 'LONG_TERM'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" /> Thuê dài hạn
              </button>
            </div>

            {/* Main Interactive Search Row */}
            <form onSubmit={handleSearch} className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Box 1: Địa điểm */}
              <div
                onClick={() => setIsLocationModalOpen(true)}
                className="md:col-span-5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Địa điểm
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate flex items-center justify-between">
                    <span>{localLocation}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Box 2: Thời gian thuê */}
              <div
                onClick={() => setIsDateModalOpen(true)}
                className="md:col-span-5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Thời gian thuê
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate flex items-center justify-between">
                    <span>{dateDisplay}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Nút Tìm Xe */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm Xe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. CHƯƠNG TRÌNH KHUYẾN MÃI (PROMOTIONS SECTION) */}
      <section id="promotions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Chương Trình Khuyến Mãi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Nhận nhiều ưu đãi hấp dẫn từ AutoRental cho mọi chuyến đi
            </p>
          </div>
          <Link
            to="/find/filter"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            Khám phá thêm <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promotions.slice(0, 3).map((promo, idx) => (
            <div
              key={promo.id || idx}
              className="relative overflow-hidden rounded-2xl p-5 border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider mb-2">
                    Ưu đãi đặc biệt
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{promo.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {(promo.discountPercentage || 0) > 0
                      ? `Giảm ${promo.discountPercentage}% (Tối đa ${(promo.maxDiscount || 300000).toLocaleString('vi-VN')} ₫)`
                      : `Giảm trực tiếp ${(promo.fixedDiscount || 100000).toLocaleString('vi-VN')} ₫`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Mã voucher</span>
                  <span className="font-mono font-black text-sm text-emerald-700">{promo.code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(promo.code)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedCode === promo.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Chép mã
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ĐỊA ĐIỂM NỔI BẬT & GIAO XE TẠI SÂN BAY (MIOTO SIGNATURE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Địa Điểm Nổi Bật
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tìm xe tự lái nhanh chóng tại các tỉnh thành và thành phố du lịch lớn
          </p>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          {DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => handleDestinationClick(dest.address)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                  {dest.name}
                </h3>
                <span className="text-[11px] text-slate-200 font-medium">
                  {dest.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Airport Delivery Pills */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Giao xe tận nơi tại các sân bay</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {AIRPORTS.map((airport, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDestinationClick(airport.address)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <span>{airport.name}</span>
                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded-full">
                  {airport.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. XE NỔI BẬT DÀNH CHO BẠN (MIOTO CAR CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Xe Nổi Bật Dành Cho Bạn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Dòng xe gia đình đời mới, kiểm định nghiêm ngặt, đánh giá 5 sao từ người dùng
            </p>
          </div>
          <Link
            to="/find/filter"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
          >
            Xem tất cả xe <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car) => (
            <MiotoCarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* 5. HÀNH TRÌNH CỦA BẠN LUÔN ĐƯỢC BẢO VỆ (INSURANCE BANNER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Yên tâm trên mọi cung đường
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hành Trình Của Bạn Luôn Được Bảo Vệ
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Mỗi chuyến đi trên AutoRental đều được bảo vệ toàn diện với gói bảo hiểm thuê xe tự lái
              chính hãng từ MIC & VNI. Trong trường hợp xảy ra sự cố ngoài ý muốn, khách thuê chỉ bồi thường tối đa 2.000.000 VNĐ.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mb-1" />
                <div className="text-xs font-bold">Bảo hiểm 2 chiều</div>
                <div className="text-[11px] text-emerald-200">Vật chất xe tối đa</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mb-1" />
                <div className="text-xs font-bold">Cứu hộ SOS 24/7</div>
                <div className="text-[11px] text-emerald-200">Toàn quốc mọi lúc</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mb-1" />
                <div className="text-xs font-bold">Miễn phí hủy 1h</div>
                <div className="text-[11px] text-emerald-200">Hoàn tiền 100%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ƯU ĐIỂM CỦA AUTORENTAL (6 VALUES PHONG CÁCH MIOTO) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Ưu Điểm Của AutoRental
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Những tính năng nổi bật giúp bạn dễ dàng hơn khi thuê xe
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: 'Lái xe an toàn cùng AutoRental',
              desc: 'Chuyến đi được bảo vệ với Gói bảo hiểm thuê xe tự lái từ MIC & VNI. Khách thuê chỉ bồi thường tối đa 2.000.000 VNĐ khi có sự cố.',
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              icon: Clock,
              title: 'An tâm đặt xe & giữ cọc',
              desc: 'Không tính phí huỷ chuyến trong vòng 1h sau khi thanh toán giữ chỗ. Hoàn tiền cọc minh bạch, chuyển khoản ngay sau khi trả xe.',
              color: 'text-blue-600 bg-blue-50',
            },
            {
              icon: FileCheck2,
              title: 'Thủ tục đơn giản',
              desc: 'Chỉ cần có CCCD gắn chip (hoặc Hộ chiếu) và Giấy phép lái xe (GPLX hạng B2 trở lên) là bạn đã đủ điều kiện nhận xe ngay.',
              color: 'text-purple-600 bg-purple-50',
            },
            {
              icon: CreditCard,
              title: 'Thanh toán dễ dàng & minh bạch',
              desc: 'Đa dạng hình thức thanh toán trực tuyến tiện lợi: Quét mã VietQR chuẩn Napas 24/7, chuyển khoản ngân hàng hoặc VNPay.',
              color: 'text-amber-600 bg-amber-50',
            },
            {
              icon: MapPin,
              title: 'Giao xe tận nơi thuận tiện',
              desc: 'Bạn có thể lựa chọn nhận xe tại showroom chi nhánh, sân bay hoặc giao tận nhà theo yêu cầu. Phí hỗ trợ tiết kiệm chỉ từ 15k/km.',
              color: 'text-rose-600 bg-rose-50',
            },
            {
              icon: Car,
              title: 'Dòng xe đa dạng & đời mới',
              desc: 'Hơn 100 mẫu xe đời mới: Sedan 4 chỗ, Crossover đô thị, SUV 7 chỗ gầm cao, xe điện VinFast thông minh và MPV gia đình.',
              color: 'text-teal-600 bg-teal-50',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex items-start gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. HƯỚNG DẪN THUÊ XE 4 BƯỚC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Hướng Dẫn Thuê Xe
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chỉ với 4 bước đơn giản để trải nghiệm thuê xe trực tuyến một cách nhanh chóng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Đặt xe trên web AutoRental',
              desc: 'Chọn địa điểm, thời gian, chọn dòng xe ưng ý và thanh toán tiền đặt cọc giữ chỗ an toàn.',
            },
            {
              step: '02',
              title: 'Nhận xe & Nghiệm thu',
              desc: 'Nhân viên bàn giao xe, kiểm tra đối chiếu ODO và tình trạng xe qua biên bản điện tử.',
            },
            {
              step: '03',
              title: 'Bắt đầu hành trình',
              desc: 'Tự do cầm lái khám phá những cung đường thú vị cùng gia đình và người thân yêu.',
            },
            {
              step: '04',
              title: 'Trả xe & Hoàn tất cọc',
              desc: 'Trả xe tại điểm hẹn, nhân viên đối soát hóa đơn minh bạch và hoàn trả lại tiền cọc.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-left relative"
            >
              <div className="text-3xl font-black text-emerald-600/30 mb-2">{item.step}</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ĐỐI TÁC CHO THUÊ XE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <h2 className="text-2xl sm:text-3xl font-black">Bạn muốn cho thuê xe?</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Trở thành đối tác chủ xe của AutoRental ngay hôm nay để gia tăng thu nhập thụ động mỗi tháng từ chiếc xe nhàn rỗi của bạn.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/cars"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold transition-colors"
            >
              Tìm hiểu ngay
            </Link>
            <Link
              to="/find/filter"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors"
            >
              Đăng ký xe
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL CHỌN ĐỊA ĐIỂM (KIỂU MIOTO) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Chọn địa điểm nhận xe</h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1.5 max-h-80 overflow-y-auto">
              {POPULAR_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    localLocation === loc
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {loc}
                  </span>
                  {localLocation === loc && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN THỜI GIAN THUÊ (KIỂU MIOTO) */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Chọn thời gian thuê</h3>
              <button
                type="button"
                onClick={() => setIsDateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Ngày giờ nhận xe
                </label>
                <input
                  type="datetime-local"
                  value={localStartDate}
                  onChange={(e) => {
                    setLocalStartDate(e.target.value);
                    const d = new Date(e.target.value);
                    setDateDisplay(
                      `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} T${
                        d.getDay() + 1
                      }, ${d.getDate()}/${d.getMonth() + 1}`
                    );
                  }}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Ngày giờ trả xe
                </label>
                <input
                  type="datetime-local"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsDateModalOpen(false)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Xác nhận thời gian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
