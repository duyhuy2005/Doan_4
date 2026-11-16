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
  Fuel,
  Users,
} from 'lucide-react';

// Danh sách xe mẫu chuẩn 100% theo giao diện Mioto trong ảnh thực tế
const MIOTO_FEATURED_CARS = MIOTO_STATIC_CARS;

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
  { label: 'Honda', value: 'Honda' },
  { label: 'Geely', value: 'Geely' },
  { label: 'Hyundai', value: 'Hyundai' },
  { label: 'Toyota', value: 'Toyota' },
  { label: 'Kia', value: 'Kia' },
  { label: 'VinFast', value: 'VinFast' },
  { label: 'Mazda', value: 'Mazda' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Mitsubishi', value: 'Mitsubishi' },
];

export default function CarListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterScrollRef = useRef(null);

  // Params tương thích link Mioto
  const addressParam = searchParams.get('address') || 'TP. Hồ Chí Minh';
  const [address, setAddress] = useState(addressParam);
  const [dateDisplay, setDateDisplay] = useState('21:00 T4, 11/11 - 20:00 T5, 12/11');

  // Active filter state cho các pill bấm kiểu Mioto
  const [activePills, setActivePills] = useState({
    hourlyPrice: false,
    delivery: false,
    star5: false,
    quickBook: false,
    noCollateral: false,
    discount: false,
  });

  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  // Dropdown states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // Modal controls
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [selectedMapCar, setSelectedMapCar] = useState(null);

  // Danh sách xe hiển thị
  const [allCars, setAllCars] = useState([]);
  const [displayedCars, setDisplayedCars] = useState([]);

  // Tải danh sách xe từ storage + nạp 4 mẫu chuẩn Mioto vào đầu
  useEffect(() => {
    const dbCars = storageService.getCars();
    // Gộp 4 xe mẫu chuẩn Mioto lên đầu để trùng khớp 100% với screenshot
    const merged = [
      ...MIOTO_FEATURED_CARS,
      ...dbCars.filter((c) => !MIOTO_FEATURED_CARS.some((m) => m.name.toLowerCase() === (c.name || '').toLowerCase())),
    ];
    setAllCars(merged);
    setDisplayedCars(merged);
  }, []);

  // Xử lý áp dụng bộ lọc đồng bộ
  const applyFilters = (pillOverrides = {}, typeOverride = null, brandOverride = null) => {
    const pills = { ...activePills, ...pillOverrides };
    const curType = typeOverride !== null ? typeOverride : selectedType;
    const curBrand = brandOverride !== null ? brandOverride : selectedBrand;

    let filtered = [...allCars];

    if (curType !== 'ALL') {
      if (curType === '4_SEATS') filtered = filtered.filter((c) => c.seats <= 4);
      else if (curType === '5_SEATS') filtered = filtered.filter((c) => c.seats === 5);
      else if (curType === '7_SEATS') filtered = filtered.filter((c) => c.seats >= 7);
      else if (curType === 'PICKUP') filtered = filtered.filter((c) => (c.categoryName || '').toLowerCase().includes('bán tải') || (c.categoryName || '').toLowerCase().includes('pickup'));
    }

    if (curBrand !== 'ALL') {
      filtered = filtered.filter((c) => (c.brandName || '').toLowerCase() === curBrand.toLowerCase());
    }

    if (pills.hourlyPrice) {
      filtered = filtered.filter((c) => (c.hourlyPrice || 0) > 0);
    }
    if (pills.star5) {
      filtered = filtered.filter((c) => (c.rating || 5) >= 5.0);
    }
    if (pills.delivery) {
      filtered = filtered.filter((c) => c.features?.includes('Giao xe tận nơi') || true);
    }
    if (pills.noCollateral) {
      filtered = filtered.filter((c) => c.noCollateral !== false);
    }
    if (pills.discount) {
      filtered = filtered.filter((c) => (c.discountPercent || 0) >= 15);
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
    });
    setSelectedType('ALL');
    setSelectedBrand('ALL');
    setDisplayedCars(allCars);
  };

  const handleSelectLocation = (loc) => {
    setAddress(loc);
    setIsLocationModalOpen(false);
  };

  const scrollPillsRight = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen">
      {/* ============================================================== */}
      {/* 1. TOP SUBHEADER BAR: NÚT BACK + CAPSULE ĐỊA ĐIỂM + CAPSULE THỜI GIAN */}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Nút quay lại tròn `<` + 2 Capsule */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Quay lại"
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

            {/* Capsule Thời gian: `📅 21:00 T4, 11/11 - 20:00 T5, 12/11` */}
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-emerald-600 bg-white text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-700" />
              <span className="truncate max-w-[180px] sm:max-w-none">{dateDisplay}</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. FILTER PILLS BAR (THANH LỌC THẺ BO TRÒN THEO ĐÚNG ẢNH MIOTO) */}
        {/* ============================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Vùng cuộn ngang các pills */}
          <div
            ref={filterScrollRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-2"
          >
            {/* Nút Reload tròn 🔄 */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-8 h-8 rounded-full border border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center text-slate-600 shrink-0 cursor-pointer transition-colors"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Pill: Loại xe (Kèm dropdown nổi) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                  setIsBrandDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedType !== 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <CarIcon className="w-3.5 h-3.5" />
                <span>{selectedType === 'ALL' ? 'Loại xe' : CAR_TYPES.find((t) => t.value === selectedType)?.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-fade-in text-xs font-medium">
                  {CAR_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleSelectType(t.value)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                        selectedType === t.value ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{t.label}</span>
                      {selectedType === t.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pill: Hãng xe (Kèm dropdown nổi) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBrandDropdownOpen(!isBrandDropdownOpen);
                  setIsTypeDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedBrand !== 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{selectedBrand === 'ALL' ? 'Hãng xe' : selectedBrand}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isBrandDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-fade-in text-xs font-medium max-h-60 overflow-y-auto">
                  {BRANDS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => handleSelectBrand(b.value)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                        selectedBrand === b.value ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{b.label}</span>
                      {selectedBrand === b.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pill: Thuê giờ (?) */}
            <button
              type="button"
              onClick={() => togglePill('hourlyPrice')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activePills.hourlyPrice
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Thuê giờ</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] inline-flex items-center justify-center font-normal ml-0.5">?</span>
            </button>

            {/* Pill: Giao nhận tận nơi (?) */}
            <button
              type="button"
              onClick={() => togglePill('delivery')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activePills.delivery
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Giao nhận tận nơi</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] inline-flex items-center justify-center font-normal ml-0.5">?</span>
            </button>

            {/* Pill: Chủ xe 5★ (?) */}
            <button
              type="button"
              onClick={() => togglePill('star5')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activePills.star5
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Chủ xe 5★</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] inline-flex items-center justify-center font-normal ml-0.5">?</span>
            </button>

            {/* Pill: Đặt xe nhanh (?) */}
            <button
              type="button"
              onClick={() => togglePill('quickBook')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activePills.quickBook
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Đặt xe nhanh</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] inline-flex items-center justify-center font-normal ml-0.5">?</span>
            </button>

            {/* Pill: Miễn thế chấp (?) */}
            <button
              type="button"
              onClick={() => togglePill('noCollateral')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activePills.noCollateral
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Miễn thế chấp</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] inline-flex items-center justify-center font-normal ml-0.5">?</span>
            </button>

            {/* Pill: Giảm giá (?) */}
            <button
              type="button"
              onClick={() => togglePill('discount')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activePills.discount
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#ff5722]" />
              <span>Giảm giá</span>
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] inline-flex items-center justify-center font-normal ml-0.5">?</span>
            </button>
          </div>

          {/* Cụm nút cuộn phải `>` và `Bộ lọc` */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <button
              type="button"
              onClick={scrollPillsRight}
              className="w-7 h-7 rounded-full border border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center text-slate-600 cursor-pointer shadow-2xs"
              title="Xem thêm bộ lọc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pill: Bộ lọc (Mở toàn bộ Drawer) */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-300 bg-white text-slate-900 hover:border-slate-900 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
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
              description="Hãy thử bỏ bớt điều kiện lọc để xem thêm các mẫu xe khác đang có sẵn."
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
                    className={`transition-all ${selectedMapCar?.id === car.id ? 'ring-2 ring-emerald-500 rounded-2xl' : ''}`}
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
                {/* Pin 1: Honda City RS 609K */}
                <button
                  type="button"
                  onClick={() => setSelectedMapCar(displayedCars[0] || null)}
                  className="absolute top-[28%] left-[34%] -translate-x-1/2 -translate-y-1/2 bg-white hover:bg-emerald-600 hover:text-white text-slate-900 font-black px-3 py-1.5 rounded-full shadow-xl border-2 border-emerald-600 text-xs cursor-pointer transition-all hover:scale-110 flex items-center gap-1 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>609K</span>
                </button>

                {/* Pin 2: Geely Coolray 790K */}
                <button
                  type="button"
                  onClick={() => setSelectedMapCar(displayedCars[1] || null)}
                  className="absolute top-[42%] left-[48%] -translate-x-1/2 -translate-y-1/2 bg-white hover:bg-emerald-600 hover:text-white text-slate-900 font-black px-3 py-1.5 rounded-full shadow-xl border-2 border-emerald-600 text-xs cursor-pointer transition-all hover:scale-110 flex items-center gap-1 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>790K</span>
                </button>

                {/* Pin 3: Hyundai SantaFe 983K */}
                <button
                  type="button"
                  onClick={() => setSelectedMapCar(displayedCars[2] || null)}
                  className="absolute top-[60%] left-[62%] -translate-x-1/2 -translate-y-1/2 bg-white hover:bg-emerald-600 hover:text-white text-slate-900 font-black px-3 py-1.5 rounded-full shadow-xl border-2 border-emerald-600 text-xs cursor-pointer transition-all hover:scale-110 flex items-center gap-1 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>983K</span>
                </button>

                {/* Pin 4: Hyundai Elantra 800K */}
                <button
                  type="button"
                  onClick={() => setSelectedMapCar(displayedCars[3] || null)}
                  className="absolute top-[35%] left-[68%] -translate-x-1/2 -translate-y-1/2 bg-white hover:bg-emerald-600 hover:text-white text-slate-900 font-black px-3 py-1.5 rounded-full shadow-xl border-2 border-emerald-600 text-xs cursor-pointer transition-all hover:scale-110 flex items-center gap-1 active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>800K</span>
                </button>

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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bắt đầu nhận xe</label>
              <input
                type="datetime-local"
                defaultValue="2026-11-11T21:00"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kết thúc trả xe</label>
              <input
                type="datetime-local"
                defaultValue="2026-11-12T20:00"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-medium"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            ✓ Tổng thời gian thuê: <strong>23 giờ (1 ngày)</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDateModalOpen(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors text-xs"
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
        <div className="space-y-5 text-xs sm:text-sm">
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
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs"
            >
              Xem {displayedCars.length} xe
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
