import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useBookingDraftStore } from '../../store/bookingDraftStore';
import { useToastStore } from '../../store/toastStore';
import CarCard from '../../components/car/CarCard';
import Button from '../../components/common/Button';
import {
  Calendar,
  MapPin,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Car,
  ChevronRight,
  Tag,
  Copy,
  Check,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { pickupLocation, startDate, endDate, setSearchParams } = useBookingDraftStore();

  const [localLocation, setLocalLocation] = useState(pickupLocation);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const cars = storageService.getCars();
    setFeaturedCars(cars.slice(0, 4));
    setCategories(storageService.getCategories());
    setPromotions(storageService.getPromotions());
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      pickupLocation: localLocation,
      returnLocation: localLocation,
      startDate: localStartDate,
      endDate: localEndDate,
    });
    const startMs = new Date(localStartDate).getTime() || Date.now() + 86400000;
    const endMs = new Date(localEndDate).getTime() || Date.now() + 86400000 * 2;
    navigate(`/find/filter?startDate=${startMs}&endDate=${endMs}&address=${encodeURIComponent(localLocation)}&lat=10.8&lng=106.7`);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION & FAST BOOKING SEARCH WIDGET */}
      <section className="relative bg-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" /> Nền tảng thuê xe tự lái thông minh thế hệ mới
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Khám phá hành trình cùng <span className="text-blue-500">AutoRental</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Trải nghiệm hàng trăm mẫu xe đời mới từ Sedan sang trọng, SUV gia đình đến xe điện VinFast hiện đại. Đặt xe nhanh chóng, nhận xe tận nơi chỉ trong 15 phút.
            </p>
          </div>

          {/* Quick Search Floating Box */}
          <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200/80 max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Địa điểm nhận xe */}
              <div className="md:col-span-1 space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Địa điểm nhận xe
                </label>
                <select
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                >
                  <option value="Sân bay Quốc tế Tân Sơn Nhất (Ga Quốc nội)">Sân bay Tân Sơn Nhất (TP.HCM)</option>
                  <option value="Sân bay Quốc tế Nội Bài (Hà Nội)">Sân bay Nội Bài (Hà Nội)</option>
                  <option value="Văn phòng AutoRental Quận 1">Văn phòng Q.1, TP.HCM</option>
                  <option value="Văn phòng AutoRental Cầu Giấy">Văn phòng Cầu Giấy, Hà Nội</option>
                  <option value="Giao xe tận nhà khách hàng">Giao xe tận nhà theo yêu cầu</option>
                </select>
              </div>

              {/* Ngày nhận xe */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày nhận xe
                </label>
                <input
                  type="datetime-local"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                  required
                />
              </div>

              {/* Ngày trả xe */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày trả xe
                </label>
                <input
                  type="datetime-local"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                  required
                />
              </div>

              {/* Nút tìm kiếm */}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={Search}
                  className="w-full h-[46px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Tìm xe có sẵn
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS (LỢI THẾ CẠNH TRANH) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">100% Xe Đời Mới</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Được kiểm định chất lượng, bảo dưỡng chính hãng định kỳ trước mỗi chuyến đi.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Bảo Hiểm Toàn Diện</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Yên tâm vi vu với gói bảo hiểm vật chất 2 chiều và miễn trừ trách nhiệm sự cố.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Thủ Tục 15 Phút</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xác minh GPLX và CCCD nhanh gọn qua ảnh, ký nhận bàn giao điện tử tiện lợi.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Giá Thuê Minh Bạch</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Không phát sinh phí ẩn, chính sách cọc và phụ phí quá km rõ ràng từ đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CARS (DANH SÁCH XE NỔI BẬT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Tuyển chọn hàng đầu
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Xe Nổi Bật Được Yêu Thích
            </h2>
          </div>
          <Link to="/cars">
            <Button variant="outline" size="sm" icon={ChevronRight}>
              Xem tất cả xe
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONS & VOUCHERS SECTION */}
      <section id="promotions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-10 text-white">
          <div className="max-w-2xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 text-red-400 text-xs font-bold mb-3 border border-red-500/30">
              <Tag className="w-3.5 h-3.5" /> Ưu đãi độc quyền
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Mã Giảm Giá & Voucher Dành Cho Bạn
            </h2>
            <p className="text-sm text-slate-300">
              Sao chép mã voucher và nhập tại bước thanh toán để nhận ngay chiết khấu trực tiếp lên đến 500.000 ₫.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/15 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">{promo.title}</div>
                  <div className="text-2xl font-black text-white font-mono tracking-wider">
                    {promo.code}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {(promo.discountPercentage || 0) > 0
                      ? `Giảm ${promo.discountPercentage}% (Tối đa ${(promo.maxDiscount || promo.discountAmountMax || 500000)?.toLocaleString('vi-VN')} ₫)`
                      : `Giảm trực tiếp ${(promo.fixedDiscount || promo.discountAmountMax || 100000)?.toLocaleString('vi-VN')} ₫`}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Hạn: {promo.endDate || '31/12/2026'}</span>
                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
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
        </div>
      </section>

      {/* 5. HOW IT WORKS (QUY TRÌNH THUÊ XE 4 BƯỚC) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            Đơn giản & Tiện lợi
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Quy Trình Thuê Xe Chỉ Với 4 Bước
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Tất cả thao tác hoàn toàn trực tuyến, không mất thời gian chờ đợi tại quầy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Tìm & Chọn xe',
              desc: 'Chọn địa điểm, thời gian và lọc theo hãng, loại xe, số chỗ phù hợp với nhu cầu của bạn.',
            },
            {
              step: '02',
              title: 'Đặt cọc trực tuyến',
              desc: 'Kiểm tra chi phí minh bạch, áp mã giảm giá và thanh toán tiền đặt cọc an toàn.',
            },
            {
              step: '03',
              title: 'Nhận bàn giao xe',
              desc: 'Nhân viên giao xe tại điểm hẹn, kiểm tra chụp ảnh ODO & hiện trạng xe trong 10 phút.',
            },
            {
              step: '04',
              title: 'Trả xe & Hoàn cọc',
              desc: 'Kết thúc hành trình, nhân viên nghiệm thu nhanh và hoàn trả 100% tiền cọc còn lại.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs relative text-left"
            >
              <div className="text-3xl font-black text-blue-600/20 mb-3">{item.step}</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
