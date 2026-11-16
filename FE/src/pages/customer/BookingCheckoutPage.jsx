import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { useBookingDraftStore } from '../../store/bookingDraftStore';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime, calculateDays } from '../../utils/format';
import Button from '../../components/common/Button';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Car,
  Calendar,
  MapPin,
  ShieldCheck,
  Tag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Mail,
  FileText,
  Plus,
  Minus,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const BRANCHES = [
  'Sân bay Quốc tế Tân Sơn Nhất (Ga Quốc nội - Cột 12, TP.HCM)',
  'Trụ sở AutoRental Q.1 (123 Nguyễn Huệ, Phường Bến Nghé, TP.HCM)',
  'Sân bay Quốc tế Nội Bài (Sảnh đến T1, Hà Nội)',
  'Chi nhánh Cầu Giấy (88 Cầu Giấy, Quận Cầu Giấy, Hà Nội)',
  'Giao và nhận xe tận nhà theo yêu cầu (Nội thành)',
];

export default function BookingCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { user } = useAuthStore();
  const {
    startDate: draftStartDate,
    endDate: draftEndDate,
    pickupLocation: draftPickup,
    returnLocation: draftReturn,
    selectedServices: draftServices,
    voucherCode: draftVoucher,
    resetDraft,
  } = useBookingDraftStore();

  const carId = searchParams.get('carId') || useBookingDraftStore.getState().selectedCarId;

  const [car, setCar] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [allPromotions, setAllPromotions] = useState([]);

  // BƯỚC 1: THÔNG TIN THUÊ XE
  const [rentalInfo, setRentalInfo] = useState({
    pickupLocation: draftPickup || BRANCHES[0],
    returnLocation: draftReturn || draftPickup || BRANCHES[0],
    startDate: draftStartDate,
    endDate: draftEndDate,
  });

  // BƯỚC 2: THÔNG TIN KHÁCH HÀNG & GIẤY TỜ
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    driverLicenseNo: user?.driverLicenseNo || 'B2-790123849',
    licenseClass: 'B2 (Ô tô chở người đến 9 chỗ)',
    idCardNo: '079098123456',
    notes: '',
  });

  // BƯỚC 3: DỊCH VỤ BỔ SUNG (KÈM SỐ LƯỢNG)
  // Lưu dạng: { [serviceId]: quantity }
  const [serviceQuantities, setServiceQuantities] = useState({ 1: 1 }); // Mặc định chọn 1 bảo hiểm toàn diện

  // BƯỚC 4: MÃ GIẢM GIÁ
  const [voucherInput, setVoucherInput] = useState(draftVoucher || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState(null);

  // BƯỚC 5: TÍNH TOÁN BẢNG TỔNG TIỀN
  const [calculation, setCalculation] = useState(null);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!carId) {
      toast.warning('Vui lòng chọn xe trước khi tiến hành tạo đơn thuê.');
      navigate('/cars');
      return;
    }

    const foundCar = storageService.getCarById(carId);
    if (!foundCar) {
      toast.error('Không tìm thấy thông tin xe.');
      navigate('/cars');
      return;
    }

    setCar(foundCar);
    setAllServices(storageService.getServices());
    setAllPromotions(storageService.getPromotions());
  }, [carId, navigate]);

  // Tái tính toán chi phí khi có bất kỳ thay đổi nào
  useEffect(() => {
    if (car && rentalInfo.startDate && rentalInfo.endDate) {
      try {
        const servicesPayload = Object.entries(serviceQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

        const calc = storageService.calculatePrice({
          carId: car.id,
          startDate: rentalInfo.startDate,
          endDate: rentalInfo.endDate,
          selectedServicesWithQty: servicesPayload,
          voucherCode: appliedVoucher ? appliedVoucher.code : voucherInput,
        });

        setCalculation(calc);
        if (calc.appliedVoucher) {
          setAppliedVoucher(calc.appliedVoucher);
          setVoucherError(null);
        } else if (voucherInput && calc.voucherError) {
          setVoucherError(calc.voucherError);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [car, rentalInfo, serviceQuantities, appliedVoucher, voucherInput]);

  // Điều chỉnh số lượng dịch vụ
  const handleQuantityChange = (serviceId, delta) => {
    setServiceQuantities((prev) => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  // Áp dụng mã giảm giá
  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;

    const promos = storageService.getPromotions();
    const found = promos.find(
      (p) => p.code.toUpperCase() === voucherInput.trim().toUpperCase()
    );

    if (!found) {
      setVoucherError('Mã giảm giá không tồn tại.');
      toast.error('Mã giảm giá không tồn tại.');
      return;
    }

    const now = new Date();
    if (!found.isActive || now > new Date(found.endDate)) {
      setVoucherError('Mã giảm giá này đã hết hạn sử dụng.');
      toast.error('Mã giảm giá này đã hết hạn sử dụng.');
      return;
    }

    if (calculation && calculation.carRentalFee < found.minOrderValue) {
      const err = `Đơn thuê chưa đạt giá trị tối thiểu ${formatCurrency(found.minOrderValue)} để dùng mã này.`;
      setVoucherError(err);
      toast.warning(err);
      return;
    }

    setAppliedVoucher(found);
    setVoucherError(null);
    toast.success(`Áp dụng thành công ưu đãi: ${found.title}`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError(null);
    toast.info('Đã hủy áp dụng mã giảm giá.');
  };

  // BƯỚC 5: TẠO ĐƠN & CHUYỂN SANG THANH TOÁN
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!customerInfo.fullName || !customerInfo.phone) {
      toast.error('Vui lòng điền đầy đủ họ tên và số điện thoại liên hệ.');
      return;
    }

    if (!hasAgreedTerms) {
      toast.warning('Vui lòng tích chọn đồng ý với Chính sách hủy đơn và Điều kiện thuê xe.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const servicesPayload = Object.entries(serviceQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

      const newBooking = storageService.createBooking({
        carId: car.id,
        userId: user?.id || 3,
        userName: customerInfo.fullName,
        userPhone: customerInfo.phone,
        userEmail: customerInfo.email,
        driverLicenseNo: customerInfo.driverLicenseNo,
        idCardNo: customerInfo.idCardNo,
        startDate: rentalInfo.startDate,
        endDate: rentalInfo.endDate,
        pickupLocation: rentalInfo.pickupLocation,
        returnLocation: rentalInfo.returnLocation,
        selectedServicesWithQty: servicesPayload,
        promotionCode: appliedVoucher?.code || null,
        notes: customerInfo.notes,
      });

      toast.success(`Tạo đơn thuê xe thành công! Mã đơn: ${newBooking.bookingCode}`);
      resetDraft();
      // Chuyển sang Bước 4 trong hành trình: Thanh toán cọc
      navigate(`/payment/${newBooking.id}`);
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn đặt xe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!car || !calculation) {
    return <div className="p-16 text-center text-slate-500">Đang chuẩn bị thông tin đơn thuê xe...</div>;
  }

  const days = calculateDays(rentalInfo.startDate, rentalInfo.endDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 11-Step Journey Stepper */}
      <JourneyStepper currentStepId={3} />

      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Bước 3 trong hành trình: Đặt xe
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Tạo Đơn Thuê Xe Ô Tô Trực Tuyến
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Điền thông tin nhận/trả xe, giấy tờ tùy thân, dịch vụ bổ sung và kiểm tra bảng tổng tiền chi tiết.
        </p>
      </div>

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* CỘT TRÁI (2/3): BƯỚC 1 -> BƯỚC 4 */}
        <div className="lg:col-span-2 space-y-6">
          {/* ========================================================
              1. BƯỚC 1: THÔNG TIN THUÊ XE
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                Thông tin thuê xe & Lịch trình
              </h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Thời gian thuê: {days} ngày
              </span>
            </div>

            {/* Xe đã chọn */}
            <div className="flex flex-col sm:flex-row gap-4 items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={car.thumbnail}
                alt={car.name}
                className="w-full sm:w-40 aspect-16/10 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-1 text-left">
                <span className="text-[11px] font-bold text-blue-600 uppercase">
                  {car.brandName} • {car.categoryName}
                </span>
                <h3 className="text-base font-bold text-slate-900">{car.name}</h3>
                <div className="text-xs text-slate-500">
                  Biển số kiểm soát: <strong className="font-mono text-slate-800">{car.licensePlate}</strong>
                </div>
                <div className="text-xs font-bold text-blue-600">
                  {formatCurrency(car.dailyPrice)} <span className="font-normal text-slate-500">/ ngày</span>
                </div>
              </div>
              <Link to="/cars" className="shrink-0">
                <Button variant="outline" size="sm">
                  Đổi xe khác
                </Button>
              </Link>
            </div>

            {/* Chi nhánh nhận & Chi nhánh trả */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Chi nhánh nhận xe *
                </label>
                <select
                  value={rentalInfo.pickupLocation}
                  onChange={(e) => setRentalInfo({ ...rentalInfo, pickupLocation: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {BRANCHES.map((b, i) => (
                    <option key={i} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Chi nhánh trả xe *
                </label>
                <select
                  value={rentalInfo.returnLocation}
                  onChange={(e) => setRentalInfo({ ...rentalInfo, returnLocation: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {BRANCHES.map((b, i) => (
                    <option key={i} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày giờ nhận & Ngày giờ trả */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày & Giờ nhận xe *
                </label>
                <input
                  type="datetime-local"
                  value={rentalInfo.startDate}
                  onChange={(e) => setRentalInfo({ ...rentalInfo, startDate: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày & Giờ trả xe *
                </label>
                <input
                  type="datetime-local"
                  value={rentalInfo.endDate}
                  onChange={(e) => setRentalInfo({ ...rentalInfo, endDate: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              2. BƯỚC 2: THÔNG TIN KHÁCH HÀNG & GIẤY TỜ
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                Thông tin khách hàng & Giấy tờ cần thiết
              </h2>
              <span className="text-xs text-slate-400">Dùng để lập hợp đồng điện tử</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên người thuê *
                </label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                  placeholder="NGUYEN VAN A"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại liên hệ *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="0909123456"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email nhận biên nhận & hợp đồng
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="khachhang@example.com"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Số CCCD / Định danh VNeID *
                </label>
                <input
                  type="text"
                  value={customerInfo.idCardNo}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, idCardNo: e.target.value })}
                  placeholder="079098123456"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Số Giấy phép lái xe (GPLX) *
                </label>
                <input
                  type="text"
                  value={customerInfo.driverLicenseNo}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, driverLicenseNo: e.target.value })}
                  placeholder="B2-790123849"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hạng bằng lái</label>
                <input
                  type="text"
                  value={customerInfo.licenseClass}
                  disabled
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm cho nhân viên</label>
                <input
                  type="text"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="vd: Cần nhận xe tại sảnh ga quốc nội lúc 8h30..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              3. BƯỚC 3: DỊCH VỤ BỔ SUNG & SỐ LƯỢNG
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                Dịch vụ bổ sung (Tùy chọn & Số lượng)
              </h2>
              <span className="text-xs text-slate-400">Chọn dịch vụ và số lượng mong muốn</span>
            </div>

            <div className="space-y-3">
              {allServices.map((svc) => {
                const qty = serviceQuantities[svc.id] || 0;
                const isSelected = qty > 0;
                const multiplier = svc.chargeType === 'PER_DAY' ? days : 1;
                const subtotal = svc.price * qty * multiplier;

                return (
                  <div
                    key={svc.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{svc.name}</span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {formatCurrency(svc.price)} / {svc.chargeType === 'PER_DAY' ? 'ngày' : 'chuyến'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{svc.description}</p>
                    </div>

                    {/* Bộ điều khiển số lượng (+ / -) */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(svc.id, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-6 text-center text-xs font-bold text-slate-900 font-mono">
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(svc.id, 1)}
                          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-24">
                        <div className="text-xs font-bold text-slate-900">
                          {formatCurrency(subtotal)}
                        </div>
                        {isSelected && (
                          <div className="text-[10px] text-slate-400">
                            {qty} x {days > 1 && svc.chargeType === 'PER_DAY' ? `${days} ngày` : '1'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              4. BƯỚC 4: MÃ GIẢM GIÁ (VOUCHER)
             ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  4
                </span>
                Mã giảm giá & Chương trình khuyến mãi
              </h2>
              <Tag className="w-4 h-4 text-red-600" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => {
                  setVoucherInput(e.target.value.toUpperCase());
                  setVoucherError(null);
                }}
                placeholder="Nhập mã ưu đãi (vd: HELLOFIRST)"
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {appliedVoucher ? (
                <Button variant="danger" size="md" onClick={handleRemoveVoucher}>
                  Hủy áp dụng
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={handleApplyVoucher}>
                  Kiểm tra & Áp dụng
                </Button>
              )}
            </div>

            {/* Thông báo trạng thái voucher */}
            {voucherError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{voucherError}</span>
              </div>
            )}

            {appliedVoucher && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Đã áp dụng mã <strong>{appliedVoucher.code}</strong>: {appliedVoucher.title} (
                    <strong>-{formatCurrency(calculation.discountAmount)}</strong>)
                  </span>
                </div>
              </div>
            )}

            {/* Gợi ý voucher có sẵn */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gợi ý voucher dành cho bạn:
              </div>
              <div className="flex flex-wrap gap-2">
                {allPromotions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setVoucherInput(p.code);
                      setAppliedVoucher(p);
                      setVoucherError(null);
                      toast.success(`Đã áp dụng mã ${p.code}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-xs font-mono font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3 text-red-500" />
                    <span>{p.code}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({p.discountPercentage > 0 ? `-${p.discountPercentage}%` : `-${formatCurrency(p.fixedDiscount)}`})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. BƯỚC 5: XÁC NHẬN & BẢNG TỔNG TIỀN (STICKY RIGHT)
           ======================================================== */}
        <div className="lg:col-span-1 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-900 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  5
                </span>
                Xác nhận & Bảng tổng tiền
              </h2>
            </div>

            {/* BẢNG TỔNG TIỀN CHUẨN ĐẶC TẢ */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/80 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Khoản mục</th>
                    <th className="py-2.5 px-3 text-right">Nội dung / Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Tiền thuê */}
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">Tiền thuê xe</div>
                      <div className="text-[11px] text-slate-400">
                        {formatCurrency(car.dailyPrice)}/ngày x {calculation.totalDays} ngày
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(calculation.carRentalFee)}
                    </td>
                  </tr>

                  {/* Dịch vụ */}
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">Dịch vụ bổ sung</div>
                      <div className="text-[11px] text-slate-400">
                        {calculation.selectedServicesDetails.length > 0
                          ? `${calculation.selectedServicesDetails.length} mục đã chọn`
                          : 'Không chọn'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      +{formatCurrency(calculation.serviceFee)}
                    </td>
                  </tr>

                  {/* Giảm giá */}
                  {calculation.discountAmount > 0 && (
                    <tr className="text-emerald-700 bg-emerald-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold">Giảm giá Voucher</div>
                        <div className="text-[11px]">{appliedVoucher?.code}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono">
                        -{formatCurrency(calculation.discountAmount)}
                      </td>
                    </tr>
                  )}

                  {/* Tổng tiền thuê dự kiến */}
                  <tr className="bg-blue-50/60 font-bold text-slate-900 border-t border-slate-200">
                    <td className="py-3 px-3">
                      <div className="text-blue-900 font-black">Tổng tiền thuê dự kiến</div>
                      <div className="text-[10px] text-blue-700 font-normal">
                        Tiền thuê + Dịch vụ - Giảm giá
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-blue-600 font-mono text-sm">
                      {formatCurrency(calculation.totalPrice)}
                    </td>
                  </tr>

                  {/* Tiền cọc */}
                  <tr className="bg-amber-50/60 text-amber-950">
                    <td className="py-3 px-3">
                      <div className="font-bold">Tiền đặt cọc</div>
                      <div className="text-[10px] text-amber-800 font-normal">
                        Khoản bảo đảm theo chính sách xe
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-black font-mono">
                      {formatCurrency(calculation.depositAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* HỘP CẦN THANH TOÁN BAN ĐẦU NỔI BẬT */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                CẦN THANH TOÁN BAN ĐẦU ĐỂ GIỮ XE:
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {formatCurrency(calculation.initialPaymentRequired)}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800 mt-2">
                * Đây là khoản tiền cọc để xác nhận đặt xe. Khoản cọc này được hoàn trả 100% sau khi kết thúc hợp đồng thuê xe.
              </p>
            </div>

            {/* CHÍNH SÁCH HỦY ĐƠN THEO ĐẶC TẢ */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0" /> Chính sách hủy đơn & Hoàn tiền cọc:
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] pl-4 list-disc leading-relaxed">
                <li>
                  <strong>Hủy trước 24 giờ:</strong> Miễn phí hủy, hoàn trả 100% tiền cọc trong 24 giờ làm việc.
                </li>
                <li>
                  <strong>Hủy trong vòng 24 giờ:</strong> Khấu trừ 20% phí giữ chỗ, hoàn trả 80% tiền cọc.
                </li>
                <li>
                  <strong>Hủy sau giờ nhận xe:</strong> Không hoàn cọc theo quy định đảm bảo quyền lợi nhà xe.
                </li>
              </ul>
            </div>

            {/* Tích chọn đồng ý điều khoản */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAgreedTerms}
                onChange={(e) => setHasAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Tôi xác nhận thông tin thuê xe chính xác và đồng ý với{' '}
                <strong className="text-blue-600 underline">Chính sách hủy đơn</strong> và Điều kiện thuê xe của AutoRental.
              </span>
            </label>

            {/* Nút gửi tạo đơn */}
            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              icon={CreditCard}
              className="w-full font-bold shadow-lg shadow-red-600/30 text-white"
            >
              Tiến hành thanh toán cọc giữ xe →
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
