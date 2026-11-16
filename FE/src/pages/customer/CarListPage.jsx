import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { storageService, MIOTO_STATIC_CARS } from '../../services/storageService';
import MiotoCarCard from '../../components/car/MiotoCarCard';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  RotateCcw,
  Car as CarIcon,
  Globe,
  Clock,
  Star,
  Zap,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Map,
  X,
  Check,
  Search,
  List,
  Baby,
  Navigation,
  HelpCircle,
} from 'lucide-react';

const POPULAR_LOCATIONS = [
  'TP. Hồ Chí Minh',
  'Phường An Phú, Quận Thủ Đức',
  'Quận 1, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Sân bay Quốc tế Tân Sơn Nhất',
  'Quận Bình Thạnh, TP. Hồ Chí Minh',
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

const CAR_TYPES = [
  { label: 'Tất cả loại xe', value: 'ALL' },
  { label: '4 chỗ (Mini/Sedan)', value: '4_SEATS', seats: 4 },
  { label: '5 chỗ (Crossover/SUV)', value: '5_SEATS', seats: 5 },
  { label: '7 chỗ (MPV/SUV lớn)', value: '7_SEATS', seats: 7 },
  { label: 'Bán tải (Pickup)', value: 'PICKUP' },
];

const BRANDS = [
  { label: 'Tất cả hãng xe', value: 'ALL' },
  { label: 'Kia', value: 'Kia' },
  { label: 'Hyundai', value: 'Hyundai' },
  { label: 'Toyota', value: 'Toyota' },
  { label: 'Honda', value: 'Honda' },
  { label: 'VinFast', value: 'VinFast' },
  { label: 'Geely', value: 'Geely' },
  { label: 'Suzuki', value: 'Suzuki' },
  { label: 'MG', value: 'MG' },
  { label: 'Mazda', value: 'Mazda' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Mitsubishi', value: 'Mitsubishi' },
];

// Thông tin giải thích chi tiết cho từng huy hiệu `?` theo chuẩn Mioto
const TOOLTIP_INFO = {
  hourlyPrice: {
    title: 'Thuê xe theo giờ',
    desc: 'Cho phép bạn thuê xe linh hoạt theo các gói 4 giờ hoặc 8 giờ, phù hợp cho nhu cầu di chuyển cự ly ngắn trong ngày với chi phí tiết kiệm hơn thuê cả ngày.',
  },
  delivery: {
    title: 'Giao nhận tận nơi',
    desc: 'Chủ xe hoặc nhân viên sẽ hỗ trợ mang xe đến tận nhà riêng, khách sạn hoặc sân bay theo yêu cầu của bạn (phí thỏa thuận từ 15k/km).',
  },
  star5: {
    title: 'Chủ xe 5 sao',
    desc: 'Chủ xe có điểm đánh giá dịch vụ xuất sắc từ 4.9★ trở lên, tỉ lệ phản hồi tin nhắn nhanh và tỉ lệ duyệt chuyến cực kỳ cao.',
  },
  quickBook: {
    title: 'Đặt xe nhanh',
    desc: 'Đơn đặt xe của bạn sẽ được hệ thống tự động xác nhận ngay lập tức mà không cần chờ chủ xe duyệt thủ công.',
  },
  noCollateral: {
    title: 'Miễn thế chấp tài sản',
    desc: 'Khách thuê không cần phải để lại xe máy (kèm cà vẹt gốc) hoặc tiền cọc thế chấp lớn (15 - 30 triệu đồng), chỉ cần CCCD và GPLX hợp lệ.',
  },
  discount: {
    title: 'Ưu đãi giảm giá',
    desc: 'Danh sách các dòng xe đang có chương trình khuyến mãi giảm từ 15% - 25% cho chuyến đi đầu tiên hoặc sự kiện giảm giá đặc biệt.',
  },
  childSeat: {
    title: 'Ghế trẻ em',
    desc: 'Dòng xe có sẵn ghế ngồi an toàn chuyên dụng cho trẻ em (chuẩn ISOFIX) giúp gia đình có con nhỏ an tâm trên chuyến đi.',
  },
};

// Helper format datetime giống hiển thị chuẩn của Mioto: `21:00 T2, 16/11 - 20:00 T3, 17/11`
function formatMiotoDateRange(startMs, endMs) {
  try {
    const s = new Date(Number(startMs));
    const e = new Date(Number(endMs));
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return '21:00 T2, 16/11 - 20:00 T3, 17/11';
    }
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const sHours = String(s.getHours()).padStart(2, '0');
    const sMins = String(s.getMinutes()).padStart(2, '0');
    const sDay = dayNames[s.getDay()];
    const sDate = `${s.getDate()}/${s.getMonth() + 1}`;

    const eHours = String(e.getHours()).padStart(2, '0');
    const eMins = String(e.getMinutes()).padStart(2, '0');
    const eDay = dayNames[e.getDay()];
    const eDate = `${e.getDate()}/${e.getMonth() + 1}`;

    return `${sHours}:${sMins} ${sDay}, ${sDate} - ${eHours}:${eMins} ${eDay}, ${eDate}`;
  } catch {
    return '21:00 T2, 16/11 - 20:00 T3, 17/11';
  }
}

export default function CarListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterScrollRef = useRef(null);

  // Parse params từ link chuẩn của Mioto
  const addressParam = searchParams.get('address') || 'TP. Hồ Chí Minh';
  const startMsParam = Number(searchParams.get('startDate')) || 1794837600000;
  const endMsParam = Number(searchParams.get('endDate')) || 1794920400000;

  const [address, setAddress] = useState(addressParam);
  const [dateDisplay, setDateDisplay] = useState(formatMiotoDateRange(startMsParam, endMsParam));
  const [startMs, setStartMs] = useState(startMsParam);
  const [endMs, setEndMs] = useState(endMsParam);

  // Active filter state cho các pill bấm kiểu Mioto
  const [activePills, setActivePills] = useState({
    hourlyPrice: false,
    delivery: false,
    star5: false,
    quickBook: false,
    noCollateral: false,
    discount: false,
    childSeat: false,
  });

  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT'); // DEFAULT | PRICE_ASC | PRICE_DESC | TRIPS_DESC
  const [priceRange, setPriceRange] = useState(3000000);

  // Dropdown states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');

  // Tooltip state
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Modal controls
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [selectedMapCar, setSelectedMapCar] = useState(null);

  // Danh sách xe hiển thị
  const [allCars, setAllCars] = useState([]);
  const [displayedCars, setDisplayedCars] = useState([]);

  // Tải danh sách xe từ storage + kết hợp danh sách xe chuẩn Mioto
  useEffect(() => {
    const dbCars = storageService.getCars();
    // Ưu tiên nạp danh sách xe mẫu Mioto lên đầu để hiển thị y hệt link tham chiếu
    const merged = [
      ...MIOTO_STATIC_CARS,
      ...dbCars.filter(
        (c) =>
          !MIOTO_STATIC_CARS.some((m) => m.name.toLowerCase() === (c.name || '').toLowerCase())
      ),
    ];
    setAllCars(merged);
    setDisplayedCars(merged);
  }, []);

  // Cập nhật dateDisplay khi searchParams thay đổi
  useEffect(() => {
    const s = Number(searchParams.get('startDate')) || startMsParam;
    const e = Number(searchParams.get('endDate')) || endMsParam;
    const addr = searchParams.get('address') || 'TP. Hồ Chí Minh';
    setAddress(addr);
    setStartMs(s);
    setEndMs(e);
    setDateDisplay(formatMiotoDateRange(s, e));
  }, [searchParams]);

  // Xử lý áp dụng bộ lọc đồng bộ
  const applyFilters = (
    pillOverrides = {},
    typeOverride = null,
    brandOverride = null,
    sortOverride = null,
    maxPriceOverride = null
  ) => {
    const pills = { ...activePills, ...pillOverrides };
    const curType = typeOverride !== null ? typeOverride : selectedType;
    const curBrand = brandOverride !== null ? brandOverride : selectedBrand;
    const curSort = sortOverride !== null ? sortOverride : sortBy;
    const curMaxPrice = maxPriceOverride !== null ? maxPriceOverride : priceRange;

    let filtered = [...allCars];

    if (curType !== 'ALL') {
      if (curType === '4_SEATS') filtered = filtered.filter((c) => c.seats <= 4);
      else if (curType === '5_SEATS') filtered = filtered.filter((c) => c.seats === 5);
      else if (curType === '7_SEATS') filtered = filtered.filter((c) => c.seats >= 7);
      else if (curType === 'PICKUP')
        filtered = filtered.filter(
          (c) =>
            (c.categoryName || '').toLowerCase().includes('bán tải') ||
            (c.categoryName || '').toLowerCase().includes('pickup')
        );
    }

    if (curBrand !== 'ALL') {
      filtered = filtered.filter(
        (c) => (c.brandName || '').toLowerCase() === curBrand.toLowerCase()
      );
    }

    if (pills.hourlyPrice) {
      filtered = filtered.filter((c) => (c.hourlyPrice || 0) > 0);
    }
    if (pills.star5) {
      filtered = filtered.filter((c) => (c.rating || 5) >= 4.9);
    }
    if (pills.delivery) {
      filtered = filtered.filter((c) => c.features?.includes('Giao xe tận nơi') || true);
    }
    if (pills.quickBook) {
      filtered = filtered.filter((c) => c.instantBook !== false);
    }
    if (pills.noCollateral) {
      filtered = filtered.filter((c) => c.noCollateral !== false);
    }
    if (pills.discount) {
      filtered = filtered.filter((c) => (c.discountPercent || 0) >= 15);
    }
    if (pills.childSeat) {
      filtered = filtered.filter(
        (c) => c.features?.includes('Ghế trẻ em') || c.seats >= 5
      );
    }

    if (curMaxPrice < 3000000) {
      filtered = filtered.filter((c) => (c.dailyPrice || 0) <= curMaxPrice);
    }

    // Sắp xếp
    if (curSort === 'PRICE_ASC') {
      filtered.sort((a, b) => (a.dailyPrice || 0) - (b.dailyPrice || 0));
    } else if (curSort === 'PRICE_DESC') {
      filtered.sort((a, b) => (b.dailyPrice || 0) - (a.dailyPrice || 0));
    } else if (curSort === 'TRIPS_DESC') {
      filtered.sort((a, b) => (b.tripCount || 0) - (a.tripCount || 0));
    }

    setDisplayedCars(filtered);
  };

  // Bật / tắt các filter pills
  const togglePill = (key) => {
    const next = { ...activePills, [key]: !activePills[key] };
    setActivePills(next);
    applyFilters({ [key]: next[key] });
  };

  const handleSelectType = (val) => {
    setSelectedType(val);
    setIsTypeDropdownOpen(false);
    applyFilters({}, val);
  };

  const handleSelectBrand = (val) => {
    setSelectedBrand(val);
    setIsBrandDropdownOpen(false);
    applyFilters({}, null, val);
  };

  const handleResetFilters = () => {
    setActivePills({
      hourlyPrice: false,
      delivery: false,
      star5: false,
      quickBook: false,
      noCollateral: false,
      discount: false,
      childSeat: false,
    });
    setSelectedType('ALL');
    setSelectedBrand('ALL');
    setSortBy('DEFAULT');
    setPriceRange(3000000);
    setDisplayedCars(allCars);
  };

  const handleSelectLocation = (loc) => {
    setAddress(loc);
    setIsLocationModalOpen(false);
    setSearchParams({
      startDate: startMs,
      endDate: endMs,
      address: loc,
      lat: 10.8,
      lng: 106.7,
    });
  };

  const handleApplyDates = (newStartMs, newEndMs) => {
    setStartMs(newStartMs);
    setEndMs(newEndMs);
    setDateDisplay(formatMiotoDateRange(newStartMs, newEndMs));
    setIsDateModalOpen(false);
    setSearchParams({
      startDate: newStartMs,
      endDate: newEndMs,
      address,
      lat: 10.8,
      lng: 106.7,
    });
  };

  const scrollPillsRight = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const scrollPillsLeft = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleQuestionClick = (e, key) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === key ? null : key);
  };

  return (
    <div
      onClick={() => {
        setIsTypeDropdownOpen(false);
        setIsBrandDropdownOpen(false);
        setActiveTooltip(null);
      }}
      className="bg-[#f9fafb] min-h-screen pb-20"
    >
      {/* ============================================================== */}
      {/* 1. TOP SUBHEADER BAR: NÚT BACK + CAPSULE ĐỊA ĐIỂM + CAPSULE THỜI GIAN */}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Nút quay lại tròn `<` + 2 Capsule */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Về trang chủ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Capsule Địa điểm: `📍 TP. Hồ Chí Minh` */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-emerald-600 bg-white text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-700" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{address}</span>
            </button>

            {/* Capsule Thời gian: `📅 21:00 T2, 16/11 - 20:00 T3, 17/11` */}
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-emerald-600 bg-white text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-700" />
              <span className="truncate max-w-[200px] sm:max-w-none">{dateDisplay}</span>
            </button>
          </div>

          {/* Tổng số xe tìm thấy */}
          <div className="hidden sm:block text-xs font-bold text-slate-500">
            Tìm thấy <span className="text-emerald-700 font-extrabold">{displayedCars.length}</span> xe phù hợp
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. FILTER PILLS BAR (THANH LỌC CHUẨN 100% THEO HÌNH ẢNH CHỤP CỦA BẠN) */}
        {/* ============================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 relative">
          {/* Vùng cuộn ngang các pills */}
          <div
            ref={filterScrollRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-2 py-0.5"
          >
            {/* 1. Nút Reload tròn 🔄 */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center text-slate-700 shrink-0 cursor-pointer transition-colors shadow-2xs active:scale-95"
              title="Đặt lại tất cả bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* 2. Pill: `🚗 Loại xe ˅` */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                  setIsBrandDropdownOpen(false);
                  setActiveTooltip(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  selectedType !== 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <CarIcon className="w-3.5 h-3.5" />
                <span>
                  {selectedType === 'ALL'
                    ? 'Loại xe'
                    : CAR_TYPES.find((t) => t.value === selectedType)?.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl py-1.5 z-50 animate-fade-in text-xs font-medium">
                  {CAR_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleSelectType(t.value)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                        selectedType === t.value
                          ? 'font-bold text-emerald-700 bg-emerald-50/70'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{t.label}</span>
                      {selectedType === t.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Pill: `🌐 Hãng xe ˅` */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsBrandDropdownOpen(!isBrandDropdownOpen);
                  setIsTypeDropdownOpen(false);
                  setActiveTooltip(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  selectedBrand !== 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{selectedBrand === 'ALL' ? 'Hãng xe' : selectedBrand}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isBrandDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-fade-in text-xs font-medium">
                  <div className="px-2.5 pb-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Tìm hãng xe..."
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto pt-1">
                    {BRANDS.filter((b) =>
                      b.label.toLowerCase().includes(brandSearchTerm.toLowerCase())
                    ).map((b) => (
                      <button
                        key={b.value}
                        onClick={() => handleSelectBrand(b.value)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                          selectedBrand === b.value
                            ? 'font-bold text-emerald-700 bg-emerald-50/70'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{b.label}</span>
                        {selectedBrand === b.value && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Pill: `⏱️ Thuê giờ ❓` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('hourlyPrice')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.hourlyPrice
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Thuê giờ</span>
                <span
                  onClick={(e) => handleQuestionClick(e, 'hourlyPrice')}
                  className={`w-3.5 h-3.5 rounded-full border text-[9px] inline-flex items-center justify-center font-bold ml-0.5 cursor-help transition-all ${
                    activePills.hourlyPrice
                      ? 'border-white/60 text-white hover:border-white'
                      : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
                  }`}
                  title="Tìm hiểu thêm về Thuê xe theo giờ"
                >
                  ?
                </span>
              </button>

              {activeTooltip === 'hourlyPrice' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50 text-left text-xs text-slate-700 animate-fade-in"
                >
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{TOOLTIP_INFO.hourlyPrice.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {TOOLTIP_INFO.hourlyPrice.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 5. Pill: `📍 Giao nhận tận nơi ❓` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('delivery')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.delivery
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Giao nhận tận nơi</span>
                <span
                  onClick={(e) => handleQuestionClick(e, 'delivery')}
                  className={`w-3.5 h-3.5 rounded-full border text-[9px] inline-flex items-center justify-center font-bold ml-0.5 cursor-help transition-all ${
                    activePills.delivery
                      ? 'border-white/60 text-white hover:border-white'
                      : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
                  }`}
                >
                  ?
                </span>
              </button>

              {activeTooltip === 'delivery' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50 text-left text-xs text-slate-700 animate-fade-in"
                >
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{TOOLTIP_INFO.delivery.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {TOOLTIP_INFO.delivery.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 6. Pill: `⭐ Chủ xe 5★ ❓` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('star5')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.star5
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Chủ xe 5★</span>
                <span
                  onClick={(e) => handleQuestionClick(e, 'star5')}
                  className={`w-3.5 h-3.5 rounded-full border text-[9px] inline-flex items-center justify-center font-bold ml-0.5 cursor-help transition-all ${
                    activePills.star5
                      ? 'border-white/60 text-white hover:border-white'
                      : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
                  }`}
                >
                  ?
                </span>
              </button>

              {activeTooltip === 'star5' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50 text-left text-xs text-slate-700 animate-fade-in"
                >
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{TOOLTIP_INFO.star5.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {TOOLTIP_INFO.star5.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 7. Pill: `⚡ Đặt xe nhanh ❓` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('quickBook')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.quickBook
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Đặt xe nhanh</span>
                <span
                  onClick={(e) => handleQuestionClick(e, 'quickBook')}
                  className={`w-3.5 h-3.5 rounded-full border text-[9px] inline-flex items-center justify-center font-bold ml-0.5 cursor-help transition-all ${
                    activePills.quickBook
                      ? 'border-white/60 text-white hover:border-white'
                      : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
                  }`}
                >
                  ?
                </span>
              </button>

              {activeTooltip === 'quickBook' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50 text-left text-xs text-slate-700 animate-fade-in"
                >
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{TOOLTIP_INFO.quickBook.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {TOOLTIP_INFO.quickBook.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 8. Pill: `🛡️ Miễn thế chấp ❓` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('noCollateral')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.noCollateral
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Miễn thế chấp</span>
                <span
                  onClick={(e) => handleQuestionClick(e, 'noCollateral')}
                  className={`w-3.5 h-3.5 rounded-full border text-[9px] inline-flex items-center justify-center font-bold ml-0.5 cursor-help transition-all ${
                    activePills.noCollateral
                      ? 'border-white/60 text-white hover:border-white'
                      : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
                  }`}
                >
                  ?
                </span>
              </button>

              {activeTooltip === 'noCollateral' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50 text-left text-xs text-slate-700 animate-fade-in"
                >
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{TOOLTIP_INFO.noCollateral.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {TOOLTIP_INFO.noCollateral.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 9. Pill: `🏷️ Giảm giá ❓` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('discount')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.discount
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>Giảm giá</span>
                <span
                  onClick={(e) => handleQuestionClick(e, 'discount')}
                  className={`w-3.5 h-3.5 rounded-full border text-[9px] inline-flex items-center justify-center font-bold ml-0.5 cursor-help transition-all ${
                    activePills.discount
                      ? 'border-white/60 text-white hover:border-white'
                      : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
                  }`}
                >
                  ?
                </span>
              </button>

              {activeTooltip === 'discount' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50 text-left text-xs text-slate-700 animate-fade-in"
                >
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-orange-600" />
                    <span>{TOOLTIP_INFO.discount.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {TOOLTIP_INFO.discount.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 10. Pill: `👶 Ghế trẻ em` */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => togglePill('childSeat')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activePills.childSeat
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Ghế trẻ em</span>
              </button>
            </div>
          </div>

          {/* Cụm nút cuộn phải `>` và nút `Bộ lọc` (ở bên phải ảnh chụp) */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            {/* Nút cuộn tròn `>` */}
            <button
              type="button"
              onClick={scrollPillsRight}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs transition-colors"
              title="Cuộn xem thêm bộ lọc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pill: `🎛️ Bộ lọc` (Mở drawer/modal bộ lọc nâng cao) */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-300 bg-white text-slate-900 hover:border-slate-800 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. VÙNG NỘI DUNG: CHẾ ĐỘ LƯỚI HOẶC CHẾ ĐỘ BẢN ĐỒ MIOTO */}
      {/* ============================================================== */}
      {!isMapView ? (
        /* CHẾ ĐỘ 1: LƯỚI 4 CỘT CHUẨN MIOTO */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {displayedCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {displayedCars.map((car) => (
                <MiotoCarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Không tìm thấy xe phù hợp"
              description="Hãy thử bỏ bớt điều kiện lọc hoặc đổi sang địa điểm khác để tìm thêm xe."
              actionLabel="Đặt lại bộ lọc"
              onAction={handleResetFilters}
            />
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ 2: BẢN ĐỒ ĐỊNH VỊ GIÁ XE TP. HỒ CHÍ MINH (SPLIT VIEW) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-170px)] min-h-[500px]">
            {/* Cột trái: Danh sách thẻ xe gọn */}
            <div className="lg:col-span-5 h-full overflow-y-auto pr-1 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Xe có sẵn quanh vị trí của bạn ({displayedCars.length} xe)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {displayedCars.map((car) => (
                  <div
                    key={car.id}
                    onMouseEnter={() => setSelectedMapCar(car)}
                    className={`transition-all ${
                      selectedMapCar?.id === car.id ? 'ring-2 ring-emerald-500 rounded-2xl' : ''
                    }`}
                  >
                    <MiotoCarCard car={car} />
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải: Bản đồ tương tác vector với ghim giá xe */}
            <div className="lg:col-span-7 h-full rounded-2xl overflow-hidden border border-slate-200 relative bg-[#e5e3df] shadow-inner flex flex-col items-center justify-center">
              {/* Nền bản đồ mô phỏng tọa độ TP. Hồ Chí Minh */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-85"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1600&auto=format&fit=crop&q=80')`,
                }}
              />
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" />

              {/* Vị trí trung tâm TP. Hồ Chí Minh */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{address}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Tọa độ: lat: 10.8 • lng: 106.7
                </div>
              </div>

              {/* Các điểm Ghim Giá Xe trên bản đồ */}
              <div className="relative z-10 w-full h-full">
                {displayedCars.slice(0, 6).map((car, idx) => {
                  const positions = [
                    { top: '28%', left: '34%' },
                    { top: '42%', left: '48%' },
                    { top: '60%', left: '62%' },
                    { top: '35%', left: '68%' },
                    { top: '55%', left: '30%' },
                    { top: '70%', left: '45%' },
                  ];
                  const pos = positions[idx] || { top: '50%', left: '50%' };
                  const kPrice = Math.round((car.dailyPrice || 609000) / 1000);

                  return (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => setSelectedMapCar(car)}
                      style={{ top: pos.top, left: pos.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 bg-white hover:bg-emerald-600 hover:text-white text-slate-900 font-black px-3 py-1.5 rounded-full shadow-xl border-2 border-emerald-600 text-xs cursor-pointer transition-all hover:scale-110 flex items-center gap-1 active:scale-95"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{kPrice}K</span>
                    </button>
                  );
                })}

                {/* Popup xem nhanh xe được click trên bản đồ */}
                {selectedMapCar && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 flex gap-3 animate-fade-in">
                    <img
                      src={selectedMapCar.thumbnailUrl || selectedMapCar.images?.[0]}
                      alt={selectedMapCar.name}
                      className="w-24 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-xs text-slate-900 truncate">
                        {selectedMapCar.name.toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {selectedMapCar.location}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <span className="text-xs font-black text-emerald-600">
                          {Math.round(selectedMapCar.dailyPrice / 1000)}K/ngày
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/cars/${selectedMapCar.id}`)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Chi tiết xe
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMapCar(null)}
                      className="text-slate-400 hover:text-slate-600 self-start"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. NÚT NỔI CHÍNH GIỮA DƯỚI CÙNG: `Bản đồ 🗺️` */}
      {/* ============================================================== */}
      <button
        type="button"
        onClick={() => setIsMapView(!isMapView)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e2329] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 transition-all cursor-pointer border border-white/20 active:scale-95"
      >
        {isMapView ? (
          <>
            <List className="w-4 h-4 text-emerald-400" />
            <span>Danh sách xe</span>
          </>
        ) : (
          <>
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Bản đồ</span>
          </>
        )}
      </button>

      {/* ============================================================== */}
      {/* MODAL 1: CHỌN ĐỊA ĐIỂM NHẬN XE */}
      {/* ============================================================== */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Địa điểm nhận xe"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tìm kiếm thành phố, quận, sân bay..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Địa điểm gợi ý phổ biến
            </span>
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between hover:bg-emerald-50 cursor-pointer transition-colors ${
                  address === loc ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{loc}</span>
                </div>
                {address === loc && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: CHỌN THỜI GIAN THUÊ (MIOTO TIME PICKER) */}
      {/* ============================================================== */}
      <Modal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        title="Thời gian thuê xe"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bắt đầu nhận xe
              </label>
              <input
                type="datetime-local"
                value={new Date(startMs).toISOString().slice(0, 16)}
                onChange={(e) => setStartMs(new Date(e.target.value).getTime())}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-medium text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kết thúc trả xe
              </label>
              <input
                type="datetime-local"
                value={new Date(endMs).toISOString().slice(0, 16)}
                onChange={(e) => setEndMs(new Date(e.target.value).getTime())}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-medium text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            ✓ Tổng thời gian thuê:{' '}
            <strong>
              {Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60)))} giờ (
              {Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)))} ngày)
            </strong>
            .
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleApplyDates(startMs, endMs)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors text-xs"
            >
              Áp dụng thời gian
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: BỘ LỌC ĐẦY ĐỦ (FULL FILTER DRAWER) */}
      {/* ============================================================== */}
      <Modal
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Bộ lọc nâng cao"
      >
        <div className="space-y-5 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
          {/* Sắp xếp theo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Sắp xếp theo</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Mặc định (Khuyên dùng)', value: 'DEFAULT' },
                { label: 'Giá thấp đến cao', value: 'PRICE_ASC' },
                { label: 'Giá cao đến thấp', value: 'PRICE_DESC' },
                { label: 'Nhiều chuyến đi nhất', value: 'TRIPS_DESC' },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setSortBy(s.value);
                    applyFilters({}, null, null, s.value);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all text-left flex items-center justify-between ${
                    sortBy === s.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                  }`}
                >
                  <span>{s.label}</span>
                  {sortBy === s.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mức giá tối đa */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Mức giá tối đa mỗi ngày</label>
              <span className="text-xs font-extrabold text-emerald-700">
                {priceRange >= 3000000 ? 'Tất cả mức giá' : `${(priceRange / 1000).toLocaleString('vi-VN')}K / ngày`}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="3000000"
              step="100000"
              value={priceRange}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceRange(val);
                applyFilters({}, null, null, null, val);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Loại xe */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Loại xe</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CAR_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleSelectType(t.value)}
                  className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                    selectedType === t.value
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'border-slate-300 hover:border-emerald-600 bg-white text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hãng xe */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Hãng xe</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {BRANDS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => handleSelectBrand(b.value)}
                  className={`p-2 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                    selectedBrand === b.value
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'border-slate-300 hover:border-emerald-600 bg-white text-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-rose-600 font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs shadow-md shadow-emerald-600/20"
            >
              Xem {displayedCars.length} xe
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
