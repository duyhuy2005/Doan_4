import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useBookingDraftStore } from '../../store/bookingDraftStore';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, calculateDays, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Users,
  Gauge,
  Fuel,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  Zap,
  Info,
  Share2,
  Heart,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  MessageCircle,
  FileText,
  CreditCard,
  Sparkles,
  ShieldAlert,
  Car,
  Navigation,
  Award,
  Sliders,
  Tag,
  HelpCircle,
  Compass,
  Eye,
  CheckCircle,
  Flame,
  Truck,
  RotateCcw,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function CarDetailPage() {
  const params = useParams();
  const carIdParam = params.id || params.slug || '18';
  const navigate = useNavigate();
  const toast = useToastStore();

  const {
    startDate,
    endDate,
    pickupLocation,
    returnLocation,
    setSearchParams,
    setSelectedCarId,
  } = useBookingDraftStore();

  const [car, setCar] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [similarCars, setSimilarCars] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Form parameters
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [deliveryOption, setDeliveryOption] = useState('AT_STATION'); // 'AT_STATION' | 'HOME_DELIVERY'
  const [customAddress, setCustomAddress] = useState(pickupLocation || 'Sân bay Quốc tế Tân Sơn Nhất (TP.HCM)');
  const [isAvailable, setIsAvailable] = useState(true);

  // Voucher
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Lightbox Modal
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Wishlist toggle
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tab documents
  const [documentTab, setDocumentTab] = useState('CCCD_GPLX');

  useEffect(() => {
    // Tải dữ liệu xe từ storageService
    const foundCar = storageService.getCarById(carIdParam);
    if (foundCar) {
      setCar(foundCar);

      // Tải lịch bận
      const slots = storageService.getCarOccupiedSlots(foundCar.id);
      setOccupiedSlots(slots);

      // Tải xe tương tự cùng phân khúc
      const allCars = storageService.getCars();
      const similar = allCars
        .filter((c) => c.id !== foundCar.id && (c.categoryId === foundCar.categoryId || c.seats === foundCar.seats))
        .slice(0, 3);
      setSimilarCars(similar);

      // Tải đánh giá
      const allReviews = storageService.getReviews();
      const carReviews = allReviews.filter((r) => r.carId === foundCar.id || !r.carId);
      setReviews(carReviews.slice(0, 4));
    }
  }, [carIdParam]);

  useEffect(() => {
    if (car && localStartDate && localEndDate) {
      const avail = storageService.isCarAvailable(car.id, localStartDate, localEndDate);
      setIsAvailable(avail);
    }
  }, [car, localStartDate, localEndDate]);

  // Bộ ảnh sắc nét chuẩn Mioto
  const galleryImages = car
    ? [
        car.thumbnail || car.thumbnailUrl || 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600&auto=format&fit=crop&q=80',
        ...(car.images && car.images.length > 1
          ? car.images.slice(1)
          : [
              'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1600&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&auto=format&fit=crop&q=80',
            ]),
      ]
    : [];

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-bold text-slate-800">Đang tải thông tin chi tiết xe...</h2>
        <Link to="/cars" className="inline-block text-emerald-600 font-semibold hover:underline">
          ← Quay lại danh sách xe
        </Link>
      </div>
    );
  }

  // Tính toán số ngày và chi phí
  const days = Math.max(1, calculateDays(localStartDate, localEndDate));
  const rawRentalFee = car.dailyPrice * days;
  const deliveryFee = deliveryOption === 'HOME_DELIVERY' ? 120000 : 0;
  const insuranceFee = 0; // Đã bao gồm trong giá thuê
  const discountAmount = appliedVoucher ? (appliedVoucher.type === 'PERCENT' ? Math.round((rawRentalFee * appliedVoucher.value) / 100) : appliedVoucher.value) : 0;
  const totalAmount = Math.max(0, rawRentalFee + deliveryFee - discountAmount);
  const depositAmount = car.depositRequired || Math.round(totalAmount * 0.4);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'MIOTO2026' || code === 'AUTORENTAL' || code === 'HE2026') {
      setAppliedVoucher({ code, type: 'PERCENT', value: 10, label: 'Giảm 10% mùa du lịch' });
      toast.success(`Áp dụng mã giảm giá ${code} thành công: Giảm 10%!`);
    } else if (code === 'GIAM100K') {
      setAppliedVoucher({ code, type: 'FIXED', value: 100000, label: 'Giảm 100.000đ tri ân khách hàng' });
      toast.success(`Áp dụng mã giảm giá ${code} thành công: Giảm 100.000đ!`);
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng.');
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Đã sao chép liên kết chia sẻ xe vào bộ nhớ tạm!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(!isFavorite ? 'Đã lưu xe vào danh sách yêu thích!' : 'Đã xóa xe khỏi danh sách yêu thích');
  };

  const handleProceedBooking = () => {
    setSearchParams({
      startDate: localStartDate,
      endDate: localEndDate,
      pickupLocation: deliveryOption === 'HOME_DELIVERY' ? customAddress : 'Chi nhánh AutoRental Sân Bay Tân Sơn Nhất',
      returnLocation: deliveryOption === 'HOME_DELIVERY' ? customAddress : 'Chi nhánh AutoRental Sân Bay Tân Sơn Nhất',
      voucherCode: appliedVoucher?.code || '',
    });
    setSelectedCarId(car.id);
    navigate(`/checkout?carId=${car.id}`);
  };

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Thông tin chủ xe chuẩn Mioto
  const hostProfile = {
    name: 'Lê Quốc Tuấn',
    title: 'Chủ xe 5 sao AutoRental',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    trips: 168,
    rating: 5.0,
    reviewCount: 52,
    responseRate: '100%',
    responseTime: '< 5 phút',
    acceptanceRate: '99%',
    joinedDate: 'Tháng 4/2022',
  };

  return (
    <div className="bg-[#f6f7fb] min-h-screen pb-16">
      {/* 11-Step Journey Stepper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <JourneyStepper currentStepId={2} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/cars" className="hover:text-emerald-600 transition-colors">
              Thuê xe tự lái
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{car.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full bg-white border transition-all cursor-pointer shadow-2xs ${
                isFavorite
                  ? 'border-rose-300 text-rose-500 bg-rose-50'
                  : 'border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-300'
              }`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* ================= HERO 5-PHOTO COLLAGE (MIOTO STYLE) ================= */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl group">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 h-[340px] sm:h-[420px] md:h-[480px]">
            {/* Ảnh lớn bên trái (chiếm 2 cột) */}
            <div
              onClick={() => openLightbox(0)}
              className="md:col-span-2 relative h-full rounded-2xl overflow-hidden cursor-pointer bg-slate-800"
            >
              <img
                src={galleryImages[0]}
                alt={car.name}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Huy hiệu Mioto trên ảnh chính */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 fill-white" /> ĐẶT XE NHANH
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600/90 text-white shadow-lg backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> MIỄN THẾ CHẤP
                </span>
              </div>

              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold block">
                  {car.brandName} • {car.categoryName}
                </span>
                <h1 className="text-xl sm:text-2xl font-black">{car.name}</h1>
              </div>
            </div>

            {/* Lưới 4 ảnh nhỏ bên phải */}
            <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
              {galleryImages.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(idx + 1)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer bg-slate-800 h-full"
                >
                  <img
                    src={img}
                    alt={`${car.name} - ${idx + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />

                  {/* Nút xem tất cả ở góc ảnh cuối */}
                  {idx === 3 && (
                    <div className="absolute bottom-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(0);
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-xl hover:bg-white hover:scale-105 transition-all cursor-pointer backdrop-blur-md"
                      >
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>Xem tất cả {galleryImages.length} ảnh</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= BỐ CỤC 2 CỘT: NỘI DUNG (65%) & STICKY BOOKING WIDGET (35%) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* CỘT TRÁI (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. TIÊU ĐỀ XE & RATING TỔNG QUAN */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                      Đã kiểm định chất lượng
                    </span>
                    <span className="text-xs font-mono text-slate-400">Biển số: {car.licensePlate || 'DEMO-0005'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 uppercase tracking-tight">
                    {car.name} (Bản Cao Cấp 2022)
                  </h2>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 shrink-0 self-start sm:self-auto">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">{car.rating || '5.0'}</span>
                      <span className="text-xs text-slate-500">/ 5.0</span>
                    </div>
                    <span className="text-[11px] text-amber-900 font-semibold block">48 chuyến đi</span>
                  </div>
                </div>
              </div>

              {/* 4 Huy hiệu cam kết chuẩn Mioto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-emerald-950 font-bold">Đặt xe nhanh</strong>
                    <span className="text-slate-500 text-[11px]">Không cần chờ duyệt</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-blue-950 font-bold">Miễn thế chấp</strong>
                    <span className="text-slate-500 text-[11px]">Thủ tục thuận tiện</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <Truck className="w-5 h-5 text-purple-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-purple-950 font-bold">Giao xe tận nơi</strong>
                    <span className="text-slate-500 text-[11px]">Bán kính tới 15km</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-amber-950 font-bold">Bảo hiểm MIC</strong>
                    <span className="text-slate-500 text-[11px]">An tâm mọi cung đường</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. HỒ SƠ CHỦ XE (HOST PROFILE) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Chủ Xe & Đội Ngũ Vận Hành</span>
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={hostProfile.avatar}
                      alt={hostProfile.name}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                      ✓
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base">{hostProfile.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ⭐ 5.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{hostProfile.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tham gia từ {hostProfile.joinedDate}</p>
                  </div>
                </div>

                {/* Các chỉ số phản hồi của chủ xe */}
                <div className="grid grid-cols-3 gap-3 text-center sm:border-l sm:border-slate-200 sm:pl-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Tỉ lệ phản hồi</span>
                    <strong className="text-sm font-bold text-emerald-600">{hostProfile.responseRate}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Thời gian phản hồi</span>
                    <strong className="text-sm font-bold text-slate-800">{hostProfile.responseTime}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Tỉ lệ đồng ý</span>
                    <strong className="text-sm font-bold text-slate-800">{hostProfile.acceptanceRate}</strong>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                "Xe gia đình sử dụng kỹ, bảo dưỡng chính hãng định kỳ. Xe luôn được rửa sạch sẽ bóng loáng, khử khuẩn nano
                bạc và đổ 100% nhiên liệu trước khi bàn giao. Rất hân hạnh được đồng hành cùng chuyến đi của bạn!"
              </p>
            </div>

            {/* 3. ĐẶC ĐIỂM & THÔNG SỐ KỸ THUẬT (SPECS) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <span>Đặc Điểm & Thông Số Kỹ Thuật</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                    <Users className="w-4 h-4 text-emerald-600" /> Số ghế
                  </div>
                  <strong className="text-base font-bold text-slate-900">{car.seats || 7} chỗ</strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">SUV gia đình</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                    <Gauge className="w-4 h-4 text-emerald-600" /> Truyền động
                  </div>
                  <strong className="text-base font-bold text-slate-900">
                    {car.transmission === 'MANUAL' ? 'Số sàn' : 'Tự động 8 cấp'}
                  </strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Lẫy chuyển số</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                    <Fuel className="w-4 h-4 text-emerald-600" /> Nhiên liệu
                  </div>
                  <strong className="text-base font-bold text-slate-900">
                    {car.fuelType === 'DIESEL' ? 'Dầu Diesel' : car.fuelType === 'ELECTRIC' ? 'Xe Điện (EV)' : 'Xăng Sinh Học'}
                  </strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Tiết kiệm & bốc</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                    <Flame className="w-4 h-4 text-emerald-600" /> Mức tiêu hao
                  </div>
                  <strong className="text-base font-bold text-slate-900">{car.fuelConsumption || '6.8L / 100km'}</strong>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Đường hỗn hợp</span>
                </div>
              </div>
            </div>

            {/* 4. MÔ TẢ CHI TIẾT */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Mô Tả Phương Tiện</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {car.description ||
                  'Dòng xe SUV 7 chỗ gầm cao sang trọng, động cơ vận hành êm ái, bốc và đầm chắc trên cao tốc. Không gian nội thất bọc da cao cấp, 2 vùng điều hòa độc lập mát sâu. Rất phù hợp cho các gia đình đi du lịch, công tác, về quê nghỉ dưỡng cuối tuần hoặc đón đối tác quan trọng.'}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Xe được trang bị hệ thống an toàn Hyundai SmartSense: cảnh báo điểm mù, giữ làn đường, hỗ trợ phanh khẩn
                cấp và camera 360 sắc nét hỗ trợ đỗ xe dễ dàng trong không gian hẹp.
              </p>
            </div>

            {/* 5. CÁC TIỆN NGHI TRÊN XE (AMENITIES GRID) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Các Tiện Nghi Nổi Bật Trên Xe</span>
                </h3>
                <span className="text-xs text-slate-400">12 tiện ích tiêu chuẩn</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Bản đồ dẫn đường GPS', desc: 'Vietmap / Google Maps' },
                  { name: 'Camera 360 toàn cảnh', desc: 'Hiển thị 4 góc xe' },
                  { name: 'Cửa sổ trời Panorama', desc: 'Toàn cảnh mở rộng' },
                  { name: 'Apple CarPlay & Android Auto', desc: 'Kết nối không dây' },
                  { name: 'Ghế da chỉnh điện & làm mát', desc: 'Thông gió êm ái' },
                  { name: 'Cốp điện thông minh', desc: 'Mở rảnh tay tự động' },
                  { name: 'Sạc điện thoại không dây Qi', desc: 'Tích hợp bệ tỳ tay' },
                  { name: 'Cảnh báo điểm mù BVM', desc: 'Chiếu hình lên ODO' },
                  { name: 'Cảm biến va chạm trước sau', desc: 'Cảnh báo khoảng cách' },
                  { name: 'Thẻ thu phí tự động VETC', desc: 'Qua trạm không dừng' },
                  { name: 'Túi khí an toàn 360', desc: '6 túi khí bảo vệ' },
                  { name: 'Cảm biến áp suất lốp', desc: 'Đo áp suất thực tế' },
                ].map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{feat.name}</strong>
                      <span className="text-[11px] text-slate-400">{feat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. GIẤY TỜ THUÊ XE & TÀI SẢN THẾ CHẤP (CHUẨN MIOTO) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Giấy Tờ Thuê Xe & Tài Sản Thế Chấp</span>
              </h3>

              {/* Tabs chọn hình thức giấy tờ */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDocumentTab('CCCD_GPLX')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    documentTab === 'CCCD_GPLX'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cách 1: CCCD gắn chip & GPLX (Khuyên dùng)
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentTab('PASSPORT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    documentTab === 'PASSPORT'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cách 2: Hộ chiếu (Passport) bản gốc
                </button>
              </div>

              {documentTab === 'CCCD_GPLX' ? (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Giấy tờ bắt buộc chuẩn bị khi nhận xe:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                    <li>
                      <strong>GPLX (Giấy phép lái xe hạng B1/B2 trở lên):</strong> Còn hiệu lực, xuất trình bản gốc để nhân
                      viên đối chiếu và quét thông tin.
                    </li>
                    <li>
                      <strong>CCCD gắn chip:</strong> Bản gốc hoặc đối chiếu trực tiếp qua ứng dụng định danh điện tử{' '}
                      <strong>VNeID mức 2</strong>.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs text-blue-950">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" /> Dành cho khách du lịch nước ngoài / Việt kiều:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                    <li>
                      <strong>Hộ chiếu (Passport) bản gốc:</strong> Còn thời hạn trên 6 tháng (chủ xe giữ lại làm thủ tục bảo
                      đảm trong suốt thời gian thuê).
                    </li>
                    <li>
                      <strong>Bằng lái xe quốc tế (IDP)</strong> hoặc GPLX song ngữ hợp lệ tại Việt Nam.
                    </li>
                  </ul>
                </div>
              )}

              {/* Tài sản thế chấp & Chính sách Miễn thế chấp */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Tài sản thế chấp (Cọc bảo đảm nhận xe)
                  </strong>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Có hỗ trợ miễn thế chấp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium">Lựa chọn A: Tiền mặt / Chuyển khoản</span>
                    <strong className="text-sm font-bold text-slate-900 mt-1 block">
                      {formatCurrency(car.depositRequired || 15000000)}
                    </strong>
                    <span className="text-[11px] text-slate-500">Hoàn trả ngay sau khi kết thúc chuyến đi</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium">Lựa chọn B: Xe máy chính chủ</span>
                    <strong className="text-sm font-bold text-slate-900 mt-1 block">Xe máy + Cavet gốc</strong>
                    <span className="text-[11px] text-slate-500">Giá trị xe từ 15 triệu trở lên</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Khách hàng có lịch sử thuê xe tốt trên hệ thống (từ 2 chuyến hoàn thành an toàn) sẽ được{' '}
                    <strong>Miễn thế chấp xe máy / tiền mặt</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* 7. ĐIỀU KHOẢN & QUY ĐỊNH (POLICIES) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Quy Định & Điều Khoản Thuê Xe</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <span className="text-base">🚭</span>
                  <div>
                    <strong className="block text-rose-950 font-bold">Không hút thuốc trong xe</strong>
                    <span className="text-rose-700 text-[11px]">Phụ thu phí khử mùi nano 500.000đ nếu vi phạm.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-base">🐕</span>
                  <div>
                    <strong className="block text-amber-950 font-bold">Không chở thú cưng tự do</strong>
                    <span className="text-amber-700 text-[11px]">Vui lòng dùng chuồng hoặc túi chuyên dụng.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-base">🚫</span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Không chở hàng cấm & mùi nặng</strong>
                    <span className="text-slate-500 text-[11px]">Không chở sầu riêng, hải sản tươi sống, chất cháy nổ.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-base">🧼</span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Vệ sinh khi hoàn trả xe</strong>
                    <span className="text-slate-500 text-[11px]">Vui lòng rửa sạch bùn đất hoặc gửi phí rửa 100k - 150k.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. CÁC KHOẢN PHỤ PHÍ MINH BẠCH (EXTRA CHARGES) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Các Khoản Phụ Phí Có Thể Phát Sinh</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <strong className="text-slate-900 font-bold block">Phí vượt giới hạn quãng đường</strong>
                    <span className="text-slate-500 text-[11px]">Định mức tối đa: 350 km / ngày</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(car.extraMileageCharge || 4000)} / km
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <strong className="text-slate-900 font-bold block">Phí quá giờ hoàn trả xe</strong>
                    <span className="text-slate-500 text-[11px]">Nếu quá trên 5 giờ sẽ tính tròn 1 ngày thuê</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">100.000đ / giờ</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <strong className="text-slate-900 font-bold block">Phí rửa xe (nếu xe quá bẩn)</strong>
                    <span className="text-slate-500 text-[11px]">Bùn đất bám dày hoặc nội thất dơ</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">100.000đ - 150.000đ</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <strong className="text-slate-900 font-bold block">Phí khử mùi hôi chuyên sâu</strong>
                    <span className="text-slate-500 text-[11px]">Hút thuốc, sầu riêng, mùi đồ biển tanh</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">350.000đ - 500.000đ</span>
                </div>
              </div>
            </div>

            {/* 9. CHÍNH SÁCH HỦY CHUYẾN (CANCELLATION POLICY) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>Chính Sách Hủy Chuyến Linh Hoạt</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Mốc thời gian hủy chuyến</th>
                      <th className="p-3 text-right">Phí hủy chuyến</th>
                      <th className="p-3 text-right">Tỉ lệ hoàn tiền cọc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-semibold text-emerald-900">Trong vòng 1 giờ sau khi đặt cọc</td>
                      <td className="p-3 text-right font-bold text-emerald-700">Miễn phí 100%</td>
                      <td className="p-3 text-right font-bold text-emerald-700">Hoàn lại 100%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-800">Trước ngày khởi hành &gt; 7 ngày</td>
                      <td className="p-3 text-right text-slate-700">10% tiền cọc</td>
                      <td className="p-3 text-right font-bold text-slate-900">Hoàn lại 90%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-800">Trước ngày khởi hành ≤ 7 ngày</td>
                      <td className="p-3 text-right text-rose-600 font-bold">40% tiền cọc</td>
                      <td className="p-3 text-right font-bold text-slate-900">Hoàn lại 60%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 10. BẢO HIỂM THUÊ XE (INSURANCE) */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Bảo hiểm vật chất ô tô MIC đồng hành
                </div>
                <h3 className="text-lg font-black">Chuyến Đi Được Bảo Hiểm Toàn Diện</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gói bảo hiểm vật chất xe từ Tổng công ty Cổ phần Bảo hiểm Quân đội (MIC) bảo vệ chuyến đi trước các rủi
                  ro va quẹt thân vỏ ngoài ý muốn, ngập nước hoặc tai nạn bất khả kháng. Mức trách nhiệm khấu trừ tối đa chỉ
                  2.000.000đ/vụ.
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400 font-bold">
                  <span>✓ Bồi thường nhanh 24/7</span>
                  <span>•</span>
                  <span>✓ Cứu hộ giao thông toàn quốc</span>
                </div>
              </div>
            </div>

            {/* 11. VỊ TRÍ XE & BẢN ĐỒ (LOCATION) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Vị Trí Xe & Địa Điểm Giao Nhận</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-bold">Khu Vực Bãi Xe Sẵn Sàng:</strong>
                  <span className="text-emerald-600 font-bold">Miễn phí nhận tại bãi</span>
                </div>
                <p className="text-slate-700">
                  📍 Chi nhánh AutoRental Sân Bay Tân Sơn Nhất (Số 12 Bạch Đằng, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh)
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                  <span>Khoảng cách: Cách sân bay 500m (Đi bộ 5 phút)</span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=San+Bay+Tan+Son+Nhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Chỉ đường Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* 12. LỊCH XE ĐÃ ĐẶT TRƯỚC (OCCUPIED SCHEDULE) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Lịch Đã Có Đơn Thuê Của Xe Này</span>
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống tự động đồng bộ thời gian thực để ngăn chặn việc đặt trùng lịch phương tiện:
              </p>

              {occupiedSlots.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {occupiedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between"
                    >
                      <span className="font-bold">Mã đơn: {slot.bookingCode}</span>
                      <span>
                        Từ <strong>{formatDateTime(slot.startDate)}</strong> đến <strong>{formatDateTime(slot.endDate)}</strong>
                      </span>
                      <Badge status={slot.status} type="booking" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Xe hiện đang hoàn toàn trống lịch trong các ngày tới! Bạn có thể đặt ngay bây giờ.
                </div>
              )}
            </div>

            {/* 13. ĐÁNH GIÁ TỪ KHÁCH HÀNG (CUSTOMER REVIEWS) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Đánh Giá Từ Khách Hàng (5.0 / 5.0)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dựa trên 48 lượt trải nghiệm thực tế</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">5.0</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danh sách bình luận */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    name: 'Trần Văn Hải',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    date: '03/11/2026',
                    rating: 5,
                    comment:
                      'Xe Santa Fe đời mới chạy cực kỳ êm và tiết kiệm dầu. Mình thuê chở gia đình đi Đà Lạt 3 ngày 2 đêm leo đèo rất khỏe. Chủ xe anh Tuấn giao xe đúng giờ, nhiệt tình hướng dẫn!',
                  },
                  {
                    name: 'Nguyễn Bích Ngọc',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                    date: '28/10/2026',
                    rating: 5,
                    comment:
                      'Nội thất xe sạch bóng thơm phức, có sẵn khăn lạnh, nước suối và sạc điện thoại không dây. Thủ tục nhận xe nhanh chóng chỉ mất 5 phút đối chiếu CCCD và bằng lái.',
                  },
                  {
                    name: 'Phạm Minh Quân',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                    date: '20/10/2026',
                    rating: 5,
                    comment:
                      'Âm thanh Harman Kardon nghe nhạc cực phê, cửa sổ trời toàn cảnh mở ra đón gió biển Vũng Tàu tuyệt vời. Chắc chắn sẽ tiếp tục ủng hộ dịch vụ của shop!',
                  },
                ].map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-9 h-9 rounded-full object-cover border border-white shadow-2xs"
                        />
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{rev.name}</strong>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex text-amber-500 text-xs">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 14. XE TƯƠNG TỰ CÙNG PHÂN KHÚC */}
            {similarCars.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-emerald-600" />
                    <span>Xe Tương Tự Cùng Phân Khúc</span>
                  </h3>
                  <Link to="/cars" className="text-xs font-bold text-emerald-600 hover:underline">
                    Xem tất cả xe →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarCars.map((sim) => (
                    <Link
                      key={sim.id}
                      to={`/cars/${sim.id}`}
                      className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between"
                    >
                      <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                        <img
                          src={sim.thumbnail || sim.thumbnailUrl}
                          alt={sim.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            {sim.seats} chỗ
                          </span>
                        </div>
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block truncate group-hover:text-emerald-600 transition-colors">
                          {sim.name}
                        </strong>
                        <span className="text-[11px] text-slate-400 block">{sim.categoryName || 'SUV'}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-xs font-black text-emerald-600 font-mono">
                          {formatCurrency(sim.dailyPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400">/ngày</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (1/3): STICKY BOOKING WIDGET (CHỮ KÝ MIOTO) */}
          <div className="lg:col-span-1 sticky top-20">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-600/30 shadow-2xl space-y-5">
              {/* Giá thuê lớn & Tiền cọc */}
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      {formatCurrency(car.dailyPrice)}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {formatCurrency(car.dailyPrice + 200000)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">/ ngày (24 giờ)</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tiền cọc giữ xe</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {formatCurrency(depositAmount)}
                  </span>
                </div>
              </div>

              {/* BỘ CHỌN THỜI GIAN NHẬN & TRẢ XE */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('AT_STATION')}
                    className={`py-2 px-2 text-center rounded-xl transition-all cursor-pointer ${
                      deliveryOption === 'AT_STATION'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Nhận tại bãi (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('HOME_DELIVERY')}
                    className={`py-2 px-2 text-center rounded-xl transition-all cursor-pointer ${
                      deliveryOption === 'HOME_DELIVERY'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Giao tận nơi (+120k)
                  </button>
                </div>

                {deliveryOption === 'HOME_DELIVERY' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa chỉ nhận và trả xe tận nơi
                    </label>
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="Nhập địa chỉ nhà, khách sạn hoặc bến xe..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                    />
                  </div>
                )}

                {/* Chọn ngày nhận */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Thời gian nhận xe
                    </label>
                    <span className="text-[11px] text-slate-400">Từ 06:00 - 22:00</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-mono"
                  />
                </div>

                {/* Chọn ngày trả */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Thời gian trả xe
                    </label>
                    <span className="text-[11px] text-emerald-600 font-bold">{days} ngày thuê</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              {/* Tình trạng xe (Availability Status) */}
              {isAvailable ? (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Xe đang <strong>sẵn sàng giao</strong> trong khung giờ bạn chọn!
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Xe đã có đơn đặt trong thời gian này, vui lòng chọn mốc thời gian khác.</span>
                </div>
              )}

              {/* KHUNG NHẬP MÃ GIẢM GIÁ / VOUCHER */}
              <form onSubmit={handleApplyVoucher} className="space-y-1.5 pt-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Mã giảm giá (MIOTO2026)"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <span>✓ {appliedVoucher.label}</span>
                    <button
                      type="button"
                      onClick={() => setAppliedVoucher(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </form>

              {/* BẢNG PHÂN TÍCH CHI PHÍ MINH BẠCH (PRICE BREAKDOWN) */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Đơn giá thuê ({days} ngày × {formatCurrency(car.dailyPrice)})
                  </span>
                  <span className="font-mono">{formatCurrency(rawRentalFee)}</span>
                </div>

                {deliveryOption === 'HOME_DELIVERY' && (
                  <div className="flex justify-between text-slate-600">
                    <span>Phí giao xe tận nơi</span>
                    <span className="font-mono text-slate-900">+{formatCurrency(deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Bảo hiểm chuyến đi MIC <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </span>
                  <span className="font-bold text-emerald-600">Đã bao gồm</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Khuyến mãi ({appliedVoucher?.code})</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                  <span>Tổng tiền thuê xe:</span>
                  <span className="text-emerald-600 text-base font-mono">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* NÚT HÀNH ĐỘNG CHÍNH (PRIMARY CTA BUTTON) */}
              <button
                type="button"
                disabled={!isAvailable || car.status !== 'AVAILABLE'}
                onClick={handleProceedBooking}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                  isAvailable && car.status === 'AVAILABLE'
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white hover:brightness-105 active:scale-98 shadow-emerald-500/25 ring-2 ring-emerald-400'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isAvailable ? 'CHỌN THUÊ XE NGAY' : 'Xe Đã Kín Lịch'}</span>
              </button>

              {/* 3 CAM KẾT CHUẨN MIOTO */}
              <div className="text-[11px] text-slate-500 space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Bảo đảm 100% giữ xe khi hoàn tất cọc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Miễn phí hủy chuyến trong vòng 1 giờ đầu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hoàn 100% tiền cọc khi trả xe nguyên vẹn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LIGHTBOX GALLERY MODAL ================= */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Top Bar: Counter & Close */}
          <div className="flex items-center justify-between text-white z-10">
            <span className="font-mono text-xs sm:text-sm text-slate-300">
              {lightboxIndex + 1} / {galleryImages.length} ảnh — <strong className="text-white">{car.name}</strong>
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center: Main Preview with Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center py-4">
            <button
              onClick={prevLightbox}
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={galleryImages[lightboxIndex]}
              alt={`preview-${lightboxIndex}`}
              className="max-h-[70vh] sm:max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            <button
              onClick={nextLightbox}
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  lightboxIndex === idx ? 'border-emerald-400 scale-105 ring-2 ring-emerald-500/50' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
