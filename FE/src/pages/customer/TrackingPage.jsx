import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  ShieldAlert,
  Car,
  MapPin,
  Calendar,
  CreditCard,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  Sparkles,
  RotateCcw,
  Receipt,
  ShieldCheck,
  MessageSquare,
  KeyRound,
  Fuel,
  Gauge,
  Phone,
  HelpCircle,
  Send,
  Star,
  RefreshCw,
  Navigation
} from 'lucide-react';

// Danh sách 11 bước theo dõi tiến trình của một đơn thuê theo quy chuẩn
export const RENTAL_PROGRESS_STEPS = [
  {
    step: 1,
    id: 'BOOKING_CREATED',
    title: 'Đặt xe',
    subtitle: 'Tạo đơn thành công',
    actor: 'Khách hàng',
    desc: 'Đơn đặt xe đã được tạo trên hệ thống với đầy đủ thông tin thời gian và dịch vụ.'
  },
  {
    step: 2,
    id: 'ORDER_CONFIRMED',
    title: 'Xác nhận đơn',
    subtitle: 'Hệ thống tiếp nhận',
    actor: 'Hệ thống AutoRental',
    desc: 'Nhân viên và hệ thống đã tiếp nhận, kiểm tra tính khả dụng và phê duyệt lịch giữ xe.'
  },
  {
    step: 3,
    id: 'CONTRACT_CREATED',
    title: 'Tạo và xác nhận hợp đồng',
    subtitle: 'Ký hợp đồng điện tử',
    actor: 'Khách & Pháp lý',
    desc: 'Hợp đồng thuê xe điện tử có giá trị pháp lý đã được soạn thảo và ký xác nhận.'
  },
  {
    step: 4,
    id: 'DEPOSIT_PAID',
    title: 'Đặt cọc',
    subtitle: 'Thanh toán bảo đảm',
    actor: 'Khách hàng',
    desc: 'Đã hoàn tất thanh toán khoản tiền cọc bảo đảm để khóa giữ phương tiện.'
  },
  {
    step: 5,
    id: 'READY_FOR_DELIVERY',
    title: 'Sẵn sàng giao xe',
    subtitle: 'Vệ sinh & kiểm định',
    actor: 'Kỹ thuật viên',
    desc: 'Xe đã qua kiểm tra kỹ thuật 30 hạng mục, rửa sạch bóng, khử khuẩn và đổ 100% nhiên liệu.'
  },
  {
    step: 6,
    id: 'CAR_HANDOVER',
    title: 'Giao xe',
    subtitle: 'Nghiệm thu Check-in',
    actor: 'Nhân viên & Khách',
    desc: 'Hai bên cùng ghi nhận số km ODO, mức xăng, kiểm tra 4 góc xe và bàn giao chìa khóa.'
  },
  {
    step: 7,
    id: 'ACTIVE_RENTAL',
    title: 'Đang thuê',
    subtitle: 'Hành trình lưu thông',
    actor: 'Khách hàng',
    desc: 'Khách hàng đang trực tiếp cầm lái và trải nghiệm chuyến đi an toàn trên mọi cung đường.'
  },
  {
    step: 8,
    id: 'CAR_RETURN',
    title: 'Nhận lại xe',
    subtitle: 'Nghiệm thu Check-out',
    actor: 'Nhân viên thu hồi',
    desc: 'Khách trả xe tại điểm hẹn, nhân viên đối chiếu số km di chuyển và mức nhiên liệu hoàn trả.'
  },
  {
    step: 9,
    id: 'INVOICE_SETTLEMENT',
    title: 'Chốt hóa đơn và thanh toán',
    subtitle: 'Quyết toán minh bạch',
    actor: 'Kế toán & Khách',
    desc: 'Chốt bảng kê chi phí thực tế, khấu trừ phụ phí vượt km/xăng nếu có.'
  },
  {
    step: 10,
    id: 'RECONCILIATION_REFUND',
    title: 'Đối soát và hoàn cọc',
    subtitle: 'Chuyển khoản hoàn cọc',
    actor: 'Kế toán tài chính',
    desc: 'Lệnh chuyển khoản hoàn trả tiền cọc bảo đảm đã được giải ngân về số tài khoản của khách.'
  },
  {
    step: 11,
    id: 'TRIP_COMPLETED',
    title: 'Hoàn thành',
    subtitle: 'Đánh giá & tích điểm',
    actor: 'Hoàn tất chuyến đi',
    desc: 'Chuyến đi khép lại thành công. Khách hàng gửi đánh giá trải nghiệm và nhận +100 điểm hội viên.'
  }
];

export default function TrackingPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [extendReason, setExtendReason] = useState('Tôi muốn kéo dài thêm kỳ nghỉ cùng gia đình.');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (forceSync = false) => {
    if (forceSync) {
      try {
        await storageService.syncWithBackend();
      } catch (e) {}
    }
    let b = storageService.getBookingById(bookingId);
    if (!b) {
      try {
        await storageService.syncWithBackend();
      } catch (e) {}
      b = storageService.getBookingById(bookingId);
    }

    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId) || { name: b.carName, licensePlate: b.carLicensePlate });
    
    // Cập nhật timestamp gần nhất
    const now = new Date();
    setLastUpdated(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    );
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
    toast.success('Đã đồng bộ trạng thái đơn thuê từ máy chủ!');
  };

  const handleCopyCode = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.bookingCode);
    setCopiedCode(true);
    toast.success(`Đã sao chép mã đơn: ${booking.bookingCode}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!booking || !car) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu tiến trình đơn thuê...</p>
      </div>
    );
  }

  // Thuật toán xác định chính xác bước hiện tại trong 11 bước (Ưu tiên step từ Backend C# .NET)
  const computeCurrentStep = () => {
    if (booking.step && booking.step >= 1 && booking.step <= 11) return booking.step;
    if (booking.bookingStatus === 'COMPLETED' && booking.review) return 11;
    if (booking.bookingStatus === 'COMPLETED' || booking.depositRefund) return 10;
    if (booking.handoverCheckOut && (booking.isSettled || booking.paymentStatus === 'PAID')) return 9;
    if (booking.handoverCheckOut) return 8;
    if (booking.bookingStatus === 'ACTIVE') return 7;
    if (booking.handoverCheckIn) return 6;
    if (booking.bookingStatus === 'CONFIRMED' || booking.contractSigned) return 5;
    if (booking.paymentStatus === 'PARTIALLY_PAID' || booking.bookingStatus === 'DEPOSIT_PAID') return 4;
    if (booking.contractSigned) return 3;
    if (booking.isOrderConfirmed || booking.bookingStatus === 'PENDING') return 2;
    return 1;
  };

  const currentStepNum = computeCurrentStep();
  const progressPercent = Math.round((currentStepNum / 11) * 100);

  const handleOpenExtend = () => {
    const d = new Date(booking.endDate);
    d.setDate(d.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    setNewEndDate(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
    setIsExtendModalOpen(true);
  };

  const handleConfirmExtend = async (e) => {
    e.preventDefault();
    try {
      await storageService.extendBooking(booking.id, newEndDate, extendReason);
      toast.success(`Gia hạn thuê xe thành công đến ${formatDateTime(newEndDate)}!`);
      setIsExtendModalOpen(false);
      await loadData(true);
    } catch (err) {
      toast.error(err.message || 'Lỗi gia hạn đơn thuê');
    }
  };

  // Thông tin nhân viên phụ trách mặc định hoặc từ hệ thống
  const staffInCharge = {
    name: booking.handoverCheckIn?.staffName || 'Lê Vận Hành',
    role: 'Chuyên viên quản lý & bàn giao xe',
    phone: '0903 334 444',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    branch: 'Trụ sở AutoRental Sân Bay Tân Sơn Nhất'
  };

  // Ghi chú của nhân viên
  const staffNotes = booking.handoverCheckIn?.conditionNotes ||
    booking.staffNotes ||
    'Xe đã được vệ sinh sạch sẽ 100%, khử khuẩn buồng lái bằng nano bạc, bơm lốp đúng áp suất tiêu chuẩn và nạp đầy nhiên liệu. Quý khách vui lòng chuẩn bị sẵn CCCD gắn chip và GPLX bản gốc khi nhận chìa khóa xe.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Breadcrumb Journey Stepper */}
      <JourneyStepper currentStepId={currentStepNum} bookingId={booking.id} />

      {/* TOP BAR: BACK & REFRESH */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Danh sách đơn thuê của tôi</span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 hidden sm:inline">Thời gian cập nhật gần nhất:</span>
          <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {lastUpdated || 'Vừa cập nhật'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Làm mới trạng thái"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. HERO HEADER CARD: MÃ ĐƠN & TRẠNG THÁI HIỆN TẠI */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorate Background */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Mã đơn thuê</span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white bg-white/10 px-3 py-1 rounded-xl border border-white/10 flex items-center gap-2">
                  {booking.bookingCode}
                  <button
                    onClick={handleCopyCode}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Sao chép mã đơn"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Đang hoạt động</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-400" />
                  <strong>{booking.carName}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-slate-200">
                  {booking.carLicensePlate || car.licensePlate}
                </span>
                <span className="text-slate-500">•</span>
                <span>{booking.totalDays} ngày thuê</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link to={`/contract/${booking.id}`}>
                <Button variant="outline" size="sm" icon={FileText} className="border-white/20 text-white hover:bg-white/10">
                  Hợp đồng điện tử
                </Button>
              </Link>
            </div>
          </div>

          {/* THANH TIẾN ĐỘ TỔNG QUAN (OVERALL PROGRESS) */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">
                Tiến độ xử lý:{' '}
                <strong className="text-white font-bold">
                  Bước {currentStepNum} / 11 — {RENTAL_PROGRESS_STEPS[currentStepNum - 1]?.title}
                </strong>
              </span>
              <span className="font-mono font-bold text-blue-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THANH TIẾN TRÌNH 11 BƯỚC ĐẦY ĐỦ (11-STEP PROGRESS TRACKER) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Thanh Tiến Trình Đơn Thuê (11 Bước Chuẩn)</span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">Theo dõi tự động theo thời gian thực</span>
        </div>

        {/* Thanh tiến trình dạng cuộn ngang linh hoạt */}
        <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2">
          <div className="flex items-start min-w-[960px] relative">
            {/* Đường line kết nối chạy nền */}
            <div className="absolute top-4.5 left-6 right-6 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${((currentStepNum - 1) / 10) * 100}%` }}
              ></div>
            </div>

            {RENTAL_PROGRESS_STEPS.map((st) => {
              const isPast = st.step < currentStepNum;
              const isCurrent = st.step === currentStepNum;

              return (
                <div key={st.step} className="flex-1 flex flex-col items-center text-center px-1 relative z-10">
                  {/* Node icon tròn */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                      isPast
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-500/30 scale-110 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : st.step}
                  </div>

                  {/* Nhãn bước */}
                  <div className="mt-2.5 space-y-0.5">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isCurrent ? 'text-blue-600 font-black' : isPast ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden md:block">{st.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT BƯỚC HIỆN TẠI & HƯỚNG DẪN TIẾP THEO (SMART ACTION CTA) */}
        <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 shrink-0">
                {currentStepNum}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Trạng thái hiện tại</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Phụ trách: <strong>{RENTAL_PROGRESS_STEPS[currentStepNum - 1]?.actor}</strong></span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {RENTAL_PROGRESS_STEPS[currentStepNum - 1]?.title} — {RENTAL_PROGRESS_STEPS[currentStepNum - 1]?.subtitle}
                </h3>
              </div>
            </div>

            {/* Các nút hành động thông minh theo từng giai đoạn */}
            <div className="flex flex-wrap items-center gap-2">
              {currentStepNum <= 3 && !booking.contractSigned && (
                <Link to={`/contract/${booking.id}`}>
                  <Button variant="primary" size="sm" icon={FileText} className="font-bold">
                    Ký hợp đồng điện tử →
                  </Button>
                </Link>
              )}

              {currentStepNum === 4 && (
                <Link to={`/payment/${booking.id}`}>
                  <Button variant="accent" size="sm" icon={CreditCard} className="font-bold shadow-md shadow-red-600/20">
                    Thanh toán cọc ngay ({formatCurrency(booking.depositAmount)}) →
                  </Button>
                </Link>
              )}

              {(currentStepNum === 5 || currentStepNum === 6) && (
                <Link to={`/pickup/${booking.id}`}>
                  <Button variant="accent" size="sm" icon={ArrowRight} className="font-bold shadow-md shadow-red-600/20">
                    Bàn giao & Nhận chìa khóa xe →
                  </Button>
                </Link>
              )}

              {currentStepNum === 7 && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" icon={PlusCircle} onClick={handleOpenExtend}>
                    Gia hạn ngày thuê
                  </Button>
                  <Link to={`/return/${booking.id}`}>
                    <Button variant="accent" size="sm" icon={ArrowRight} className="font-bold shadow-md shadow-red-600/20">
                      Bàn giao trả xe & Nghiệm thu →
                    </Button>
                  </Link>
                </div>
              )}

              {(currentStepNum === 8 || currentStepNum === 9) && (
                <Link to={`/settlement/${booking.id}`}>
                  <Button variant="accent" size="sm" icon={Receipt} className="font-bold">
                    Xem chốt hóa đơn & Quyết toán →
                  </Button>
                </Link>
              )}

              {currentStepNum === 10 && (
                <Link to={`/refund/${booking.id}`}>
                  <Button variant="accent" size="sm" icon={RotateCcw} className="font-bold">
                    Xem biên nhận hoàn trả cọc →
                  </Button>
                </Link>
              )}

              {currentStepNum === 11 && (
                <Link to={`/review-trip/${booking.id}`}>
                  <Button variant="primary" size="sm" icon={Star} className="font-bold">
                    Đánh giá chuyến đi (+100 điểm) →
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
            {RENTAL_PROGRESS_STEPS[currentStepNum - 1]?.desc}
          </p>
        </div>
      </div>

      {/* 3. GRID 2 CỘT: CHI NHÁNH NHẬN/TRẢ & GHI CHÚ NHÂN VIÊN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD CHI NHÁNH & ĐỊA CHỈ NHẬN / TRẢ */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Chi Nhánh & Địa Chỉ Nhận / Trả Xe</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Nhận xe */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1.5">
              <div className="flex items-center justify-between text-blue-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Điểm bàn giao nhận xe
                </span>
                <span className="font-mono text-[11px] text-blue-700">{formatDateTime(booking.startDate)}</span>
              </div>
              <p className="text-slate-800 font-semibold">{booking.pickupLocation}</p>
              <div className="text-slate-500 text-[11px] flex items-center justify-between pt-1">
                <span>Hình thức: Bàn giao trực tiếp tại bãi xe</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.pickupLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Chỉ đường Maps</span>
                </a>
              </div>
            </div>

            {/* Trả xe */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  Điểm thu hồi trả xe
                </span>
                <span className="font-mono text-[11px] text-slate-600">{formatDateTime(booking.endDate)}</span>
              </div>
              <p className="text-slate-800 font-semibold">{booking.returnLocation}</p>
              <div className="text-slate-500 text-[11px] flex items-center justify-between pt-1">
                <span>Thời hạn lưu thông: {booking.totalDays} ngày ({formatDateTime(booking.endDate)})</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.returnLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Chỉ đường Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CARD GHI CHÚ TỪ NHÂN VIÊN VẬN HÀNH */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Ghi Chú Của Nhân Viên Vận Hành</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Đã kiểm định
            </span>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={staffInCharge.avatar}
                alt={staffInCharge.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">{staffInCharge.name}</p>
                <p className="text-[11px] text-slate-500">{staffInCharge.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              "{staffNotes}"
            </p>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tiêu chuẩn AutoRental Clean & Safe</span>
              </span>
              <span>100% Xăng & Sạch sẽ</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý nhận xe:</strong> Quý khách nhớ mang theo <strong>CCCD gắn chip</strong> và{' '}
              <strong>GPLX B2 trở lên</strong> còn hiệu lực để nhân viên đối chiếu trước khi bàn giao chìa khóa.
            </span>
          </div>
        </div>
      </div>

      {/* 4. THÔNG TIN LIÊN HỆ HỖ TRỢ 24/7 & CỨU HỘ KHẨN CẤP */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-blue-600" />
          <span>Thông Tin Liên Hệ Hỗ Trợ 24/7</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Nhân viên phụ trách */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Nhân viên phụ trách đơn
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                NV
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{staffInCharge.name}</p>
                <p className="text-[11px] text-slate-500">{staffInCharge.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${staffInCharge.phone.replace(/\s+/g, '')}`}
              className="mt-2 block w-full text-center py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-xs font-bold text-blue-600 transition-colors"
            >
              Gọi nhân viên bàn giao
            </a>
          </div>

          {/* Hotline CSKH 24/7 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Tổng đài CSKH toàn quốc
            </span>
            <div>
              <p className="text-base font-black font-mono text-slate-900">1900 8899</p>
              <p className="text-[11px] text-slate-500">Hỗ trợ đặt xe, thay đổi lịch, tư vấn phí</p>
            </div>
            <a
              href="tel:19008899"
              className="mt-2 block w-full text-center py-1.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Gọi tổng đài miễn cước
            </a>
          </div>

          {/* Cứu hộ SOS khẩn cấp */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-rose-700 font-bold block">
                Cứu hộ khẩn cấp SOS
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <div>
              <p className="text-base font-black font-mono text-rose-600">1900 8899 (Phím 1)</p>
              <p className="text-[11px] text-rose-800">Sự cố va quẹt, nổ lốp, kéo xe 24/7</p>
            </div>
            <a
              href="tel:19008899"
              className="mt-2 block w-full text-center py-1.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
            >
              Yêu cầu cứu hộ khẩn cấp
            </a>
          </div>
        </div>
      </div>

      {/* 5. NHẬT KÝ CHI TIẾT 11 BƯỚC THEO THỜI GIAN (ACTIVITY TIMELINE) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Nhật Ký Tiến Trình Chi Tiết Đơn Hàng</span>
        </h3>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {RENTAL_PROGRESS_STEPS.map((st) => {
            const isCompleted = st.step < currentStepNum;
            const isCurrent = st.step === currentStepNum;

            return (
              <div key={st.step} className="relative flex items-start gap-4 pl-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.step}
                </div>

                <div
                  className={`flex-1 p-3.5 rounded-2xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                      : isCompleted
                      ? 'bg-slate-50/80 border-slate-200/80'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900">
                      Bước {st.step}: {st.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? 'Đã hoàn tất' : isCurrent ? 'Đang thực hiện' : 'Chờ xử lý'}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{st.desc}</p>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Phụ trách: <strong>{st.actor}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL GIA HẠN NGÀY THUÊ XE */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Yêu cầu gia hạn thời gian thuê xe"
      >
        <form onSubmit={handleConfirmExtend} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian trả xe mới đề xuất</label>
            <input
              type="datetime-local"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lý do gia hạn</label>
            <input
              type="text"
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
            Phụ phí gia hạn dự kiến: <strong>{formatCurrency(car.dailyPrice)} / ngày</strong> (Hệ thống sẽ kiểm tra tính khả dụng của xe và tự động tính vào hóa đơn quyết toán khi trả xe).
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsExtendModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Xác nhận gia hạn
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
