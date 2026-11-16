import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { exportToCsv } from '../../utils/exportExcel';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ClipboardCheck,
  Gauge,
  Fuel,
  Camera,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Car,
  History,
  RefreshCw,
  Clock,
  ArrowRight,
  Download,
  Trash2,
  UploadCloud,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';

const PHOTO_SLOTS = [
  { key: 'FRONT', label: '1. Đầu xe (Phía trước)', desc: 'Cản trước, biển số và đèn pha' },
  { key: 'BACK', label: '2. Đuôi xe (Phía sau)', desc: 'Cản sau, biển số và cốp sau' },
  { key: 'LEFT', label: '3. Sườn xe bên trái', desc: 'Thân xe, 2 cửa và vành bánh trái' },
  { key: 'RIGHT', label: '4. Sườn xe bên phải', desc: 'Thân xe, 2 cửa và vành bánh phải' },
  { key: 'ODO', label: '5. Đồng hồ Taplo / ODO', desc: 'Số km hiển thị và vạch kim xăng' },
];

const SAMPLE_PHOTOS = {
  FRONT: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
  BACK: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
  LEFT: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
  RIGHT: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80',
  ODO: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80',
};

export default function StaffHandoverPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const { user } = useAuthStore();

  const initialBookingId = searchParams.get('bookingId');
  const initialType = searchParams.get('type') || 'CHECK_IN';

  const [activeTab, setActiveTab] = useState(initialType);
  const [bookings, setBookings] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId || '');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);

  // Form Check-in (Giao xe)
  const [checkInForm, setCheckInForm] = useState({
    currentMileage: 0,
    fuelPercentage: 100,
    conditionNotes: 'Xe sạch sẽ, ngoại thất không trầy xước lớn, động cơ hoạt động bình thường, đầy đủ phụ kiện.',
    photos: {
      FRONT: '',
      BACK: '',
      LEFT: '',
      RIGHT: '',
      ODO: '',
    },
  });

  // Form Check-out (Nghiệm thu trả xe)
  const [checkOutForm, setCheckOutForm] = useState({
    currentMileage: 0,
    fuelPercentage: 80,
    damagePenalty: 0,
    conditionNotes: 'Khách hoàn trả xe đầy đủ giấy tờ, không có va quẹt phát sinh.',
    photos: {
      FRONT: '',
      BACK: '',
      LEFT: '',
      RIGHT: '',
      ODO: '',
    },
  });

  const loadData = () => {
    const bList = storageService.getBookings();
    setBookings(bList);
    const hList = storageService.getHandovers();
    setHandovers(hList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await storageService.syncWithBackend();
      loadData();
      toast.success('Đã đồng bộ dữ liệu giao nhận từ SQL Server!');
    } catch {
      toast.error('Lỗi khi đồng bộ dữ liệu.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (selectedBookingId) {
      const b = bookings.find((item) => String(item.id) === String(selectedBookingId) || item.bookingCode === selectedBookingId);
      if (b) {
        setCurrentBooking(b);
        const car = storageService.getCarById(b.carId);
        if (car) {
          setCheckInForm((prev) => ({
            ...prev,
            currentMileage: car.currentMileage || 10000,
          }));

          const startKm = b.handoverCheckIn ? b.handoverCheckIn.currentMileage : (car.currentMileage || 10000);
          setCheckOutForm((prev) => ({
            ...prev,
            currentMileage: startKm + 280,
          }));
        }
      }
    } else {
      setCurrentBooking(null);
    }
  }, [selectedBookingId, bookings]);

  // Các đơn hợp lệ theo từng tab
  const eligibleBookings = bookings.filter((b) => {
    const raw = (b.rawStatus || b.bookingStatus || '').toUpperCase();
    const step = b.step || 1;
    if (activeTab === 'CHECK_IN') {
      return (
        step === 5 ||
        step === 6 ||
        raw === 'SAN_SANG_GIAO' ||
        raw === 'DA_DAT_COC' ||
        raw === 'CONFIRMED' ||
        raw === 'DEPOSIT_PAID'
      );
    }
    if (activeTab === 'CHECK_OUT') {
      return (
        step === 7 ||
        step === 8 ||
        raw === 'DANG_THUE' ||
        raw === 'DANG_LICH_TRINH' ||
        raw === 'CHO_TRA_XE'
      );
    }
    return true;
  });

  // File Upload Handler cho từng góc chụp
  const handlePhotoUpload = async (slotKey, file, isCheckOut = false) => {
    if (!file) return;
    setUploadingSlot(slotKey);
    try {
      const uploaded = await storageService.uploadFile(file, 'handovers');
      const photoUrl = uploaded.url || URL.createObjectURL(file);

      if (isCheckOut) {
        setCheckOutForm((prev) => ({
          ...prev,
          photos: { ...prev.photos, [slotKey]: photoUrl },
        }));
      } else {
        setCheckInForm((prev) => ({
          ...prev,
          photos: { ...prev.photos, [slotKey]: photoUrl },
        }));
      }
      toast.success(`Đã tải lên ảnh ${slotKey}!`);
    } catch (err) {
      toast.error('Tải ảnh thất bại, sử dụng ảnh xem trước cục bộ.');
      const localUrl = URL.createObjectURL(file);
      if (isCheckOut) {
        setCheckOutForm((prev) => ({
          ...prev,
          photos: { ...prev.photos, [slotKey]: localUrl },
        }));
      } else {
        setCheckInForm((prev) => ({
          ...prev,
          photos: { ...prev.photos, [slotKey]: localUrl },
        }));
      }
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleFillSamplePhotos = (isCheckOut = false) => {
    if (isCheckOut) {
      setCheckOutForm((prev) => ({
        ...prev,
        photos: { ...SAMPLE_PHOTOS },
      }));
    } else {
      setCheckInForm((prev) => ({
        ...prev,
        photos: { ...SAMPLE_PHOTOS },
      }));
    }
    toast.success('Đã tự động nạp 5 ảnh chụp tiêu chuẩn kiểm tra xe!');
  };

  const handleRemovePhoto = (slotKey, isCheckOut = false) => {
    if (isCheckOut) {
      setCheckOutForm((prev) => ({
        ...prev,
        photos: { ...prev.photos, [slotKey]: '' },
      }));
    } else {
      setCheckInForm((prev) => ({
        ...prev,
        photos: { ...prev.photos, [slotKey]: '' },
      }));
    }
  };

  // Tính toán phụ phí quyết toán Check-Out
  let checkOutCalculation = {
    startKm: 0,
    endKm: 0,
    actualDrivenKm: 0,
    maxAllowedKm: 0,
    extraKm: 0,
    extraKmFee: 0,
    totalPenalty: 0,
    refundDeposit: 0,
  };

  if (currentBooking) {
    const car = storageService.getCarById(currentBooking.carId);
    const dailyLimitKm = car?.mileageLimitPerDay || 300;
    const pricePerExtraKm = car?.extraMileageCharge || 5000;
    const days = currentBooking.totalDays || 1;
    const maxAllowedKm = dailyLimitKm * days;

    const startKm = currentBooking.handoverCheckIn
      ? currentBooking.handoverCheckIn.currentMileage
      : (car?.currentMileage || 10000);
    const endKm = Number(checkOutForm.currentMileage) || startKm;
    const actualDrivenKm = Math.max(0, endKm - startKm);
    const extraKm = Math.max(0, actualDrivenKm - maxAllowedKm);
    const extraKmFee = extraKm * pricePerExtraKm;

    const damagePenalty = Number(checkOutForm.damagePenalty) || 0;
    const totalPenalty = extraKmFee + damagePenalty;
    const originalDeposit = Number(currentBooking.depositAmount) || 0;
    const refundDeposit = Math.max(0, originalDeposit - totalPenalty);

    checkOutCalculation = {
      startKm,
      endKm,
      actualDrivenKm,
      maxAllowedKm,
      extraKm,
      extraKmFee,
      totalPenalty,
      refundDeposit,
    };
  }

  const handleConfirmCheckIn = async (e) => {
    e.preventDefault();
    if (!currentBooking) {
      toast.error('Vui lòng chọn đơn thuê xe cần bàn giao.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storageService.handoverStep(currentBooking.id, {
        staffName: user?.fullName || 'Trần Văn Nhân Viên',
        currentMileage: Number(checkInForm.currentMileage),
        fuelPercentage: Number(checkInForm.fuelPercentage),
        conditionNotes: checkInForm.conditionNotes,
        photos: checkInForm.photos,
      });

      toast.success(`Bàn giao xe thành công! Đơn ${currentBooking.bookingCode} đã chuyển sang trạng thái ĐANG THUÊ (Bước 7).`);
      loadData();
      navigate('/admin/bookings');
    } catch (err) {
      toast.error(err.message || 'Lỗi bàn giao xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCheckOut = async (e) => {
    e.preventDefault();
    if (!currentBooking) {
      toast.error('Vui lòng chọn đơn thuê xe cần nghiệm thu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await storageService.returnCarStep(currentBooking.id, {
        staffName: user?.fullName || 'Trần Văn Nhân Viên',
        currentMileage: Number(checkOutForm.currentMileage),
        fuelPercentage: Number(checkOutForm.fuelPercentage),
        damagePenalty: Number(checkOutForm.damagePenalty) || 0,
        conditionNotes: checkOutForm.conditionNotes,
        photos: checkOutForm.photos,
      });

      toast.success(
        `Nghiệm thu trả xe thành công! Đơn ${currentBooking.bookingCode} chuyển sang bước Chốt hóa đơn & thanh toán (Bước 9).`
      );
      loadData();
      navigate('/admin/bookings');
    } catch (err) {
      toast.error(err.message || 'Lỗi nghiệm thu trả xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    exportToCsv({
      filename: `Bien_ban_giao_nhan_xe_${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: '_index', label: 'STT' },
        { key: 'bookingCode', label: 'Mã đơn thuê', accessor: (h) => h.bookingCode || `BK-${h.bookingId}` },
        { key: 'carName', label: 'Tên xe & Biển số', accessor: (h) => `${h.carName || 'Xe'} (${h.licensePlate || '-'})` },
        { key: 'type', label: 'Loại biên bản', accessor: (h) => h.type === 'GIAO_XE' ? 'Check-in (Giao xe)' : 'Check-out (Thu xe)' },
        { key: 'mileage', label: 'Số ODO (km)', formatter: (v) => Number(v || 0).toLocaleString() },
        { key: 'fuelLevel', label: 'Nhiên liệu (%)', formatter: (v) => `${v}%` },
        { key: 'notes', label: 'Tình trạng ngoại quan / Ghi chú', accessor: (h) => h.notes || h.exterior || '' },
        { key: 'handoverTime', label: 'Thời gian lập biên bản', formatter: (v) => formatDateTime(v) }
      ],
      data: handovers
    });
    toast.success(`Đã xuất file Excel ${handovers.length} biên bản giao nhận xe thành công!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-blue-600" /> Bàn Giao & Nghiệm Thu Thu Hồi Xe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nghiệp vụ giao nhận xe: Chụp ảnh 5 góc kiểm tra ngoại quan, số ODO, đối soát phạt nguội & quyết toán cọc
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportExcel}
            title="Xuất lịch sử biên bản giao nhận ra file CSV/Excel UTF-8"
          >
            Xuất Excel ({handovers.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleSync}
            disabled={isSyncing}
            className={isSyncing ? 'animate-spin' : ''}
          >
            Đồng bộ CSDL
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveTab('CHECK_IN');
            setSelectedBookingId('');
          }}
          className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'CHECK_IN'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" /> Bàn Giao Xe (Check-in)
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('CHECK_OUT');
            setSelectedBookingId('');
          }}
          className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'CHECK_OUT'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" /> Nghiệm Thu Trả Xe (Check-out)
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('HISTORY');
            setSelectedBookingId('');
          }}
          className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'bg-white text-purple-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Biên Bản Đã Lập ({handovers.length})
        </button>
      </div>

      {/* ================= TAB 3: LỊCH SỬ BIÊN BẢN GIAO NHẬN ================= */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" /> Danh sách biên bản giao nhận xe thực tế (CSDL)
            </h3>
            <span className="text-xs text-slate-400">Tổng cộng {handovers.length} biên bản</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-3">STT</th>
                  <th className="py-3 px-3">Mã đơn</th>
                  <th className="py-3 px-3">Tên xe / Biển số</th>
                  <th className="py-3 px-3">Loại biên bản</th>
                  <th className="py-3 px-3">Số ODO (km)</th>
                  <th className="py-3 px-3">Nhiên liệu</th>
                  <th className="py-3 px-3">Ghi chú</th>
                  <th className="py-3 px-3 text-right">Thời gian lập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {handovers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-slate-400">
                      Chưa có biên bản giao nhận nào.
                    </td>
                  </tr>
                ) : (
                  handovers.map((h, idx) => (
                    <tr key={h.id || idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {h.bookingCode || `Đơn #${h.bookingId}`}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{h.carName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{h.licensePlate}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            h.type === 'GIAO_XE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {h.type === 'GIAO_XE' ? 'Check-in (Giao xe)' : 'Check-out (Thu xe)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {Number(h.mileage || 0).toLocaleString()} km
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {h.fuelLevel}%
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={h.notes}>
                        {h.notes || h.exterior || '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                        {formatDateTime(h.handoverTime)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SELECT BOOKING FOR CHECK-IN / CHECK-OUT */}
      {activeTab !== 'HISTORY' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {activeTab === 'CHECK_IN'
              ? '1. Chọn đơn thuê chờ bàn giao xe (Bước 5 / Bước 6):'
              : '1. Chọn đơn thuê đang lưu hành cần nghiệm thu trả xe (Bước 7 / Bước 8):'}
          </label>

          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn đơn thuê từ danh sách ({eligibleBookings.length} đơn sẵn sàng) --</option>
            {eligibleBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bookingCode} | {b.carName} ({b.carLicensePlate || 'Xe'}) | Khách: {b.userName} | Bước {b.step || 5}: {b.stepName || b.rawStatus}
              </option>
            ))}
          </select>

          {eligibleBookings.length === 0 && (
            <p className="text-xs text-amber-600 italic">
              Hiện không có đơn thuê nào ở trạng thái phù hợp cho thao tác này.
            </p>
          )}
        </div>
      )}

      {/* CURRENT BOOKING SUMMARY CARD */}
      {activeTab !== 'HISTORY' && currentBooking && (
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">Thông tin đơn thuê</span>
              <h4 className="text-lg font-black text-slate-900 font-mono">{currentBooking.bookingCode}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold uppercase">Trạng thái</span>
              <div className="text-xs font-bold text-blue-700">
                Bước {currentBooking.step || '-'}: {currentBooking.stepName || currentBooking.rawStatus}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Khách thuê:</span>
              <strong className="text-slate-800">{currentBooking.userName}</strong>
              <div className="text-[11px] text-slate-500">{currentBooking.userPhone}</div>
            </div>
            <div>
              <span className="text-slate-400 block">Xe thuê:</span>
              <strong className="text-slate-800">{currentBooking.carName}</strong>
              <div className="text-[11px] font-mono text-slate-500">{currentBooking.carLicensePlate}</div>
            </div>
            <div>
              <span className="text-slate-400 block">Thời gian thuê:</span>
              <strong className="text-slate-800">{currentBooking.totalDays} ngày</strong>
              <div className="text-[11px] text-slate-500">Từ {formatDateTime(currentBooking.startDate)}</div>
            </div>
            <div>
              <span className="text-slate-400 block">Tiền cọc bảo đảm:</span>
              <strong className="text-blue-600 font-mono text-sm">{formatCurrency(currentBooking.depositAmount)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ================= FORM CHECK-IN GIAO XE ================= */}
      {activeTab === 'CHECK_IN' && currentBooking && (
        <form onSubmit={handleConfirmCheckIn} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" /> Biên bản bàn giao xe Check-In (Đồng bộ CSDL)
            </h3>
            <button
              type="button"
              onClick={() => handleFillSamplePhotos(false)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nạp 5 ảnh chụp mẫu (Demo)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số ODO hiện tại (km) *
              </label>
              <input
                type="number"
                value={checkInForm.currentMileage}
                onChange={(e) => setCheckInForm({ ...checkInForm, currentMileage: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức nhiên liệu / Pin hiện tại (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={checkInForm.fuelPercentage}
                onChange={(e) => setCheckInForm({ ...checkInForm, fuelPercentage: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú tình trạng ngoại quan & nội thất
              </label>
              <textarea
                rows={2}
                value={checkInForm.conditionNotes}
                onChange={(e) => setCheckInForm({ ...checkInForm, conditionNotes: e.target.value })}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* CHECKLIST CHỤP ẢNH 5 GÓC KIỂM TRA XE CHECK-IN */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" /> Checklist chụp ảnh hiện trạng xe trước khi giao (5 góc)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Lưu trữ vĩnh viễn trên máy chủ để đối chiếu vết trầy xước và bảo vệ quyền lợi hai bên
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PHOTO_SLOTS.map((slot) => {
                const photoUrl = checkInForm.photos[slot.key];
                const isUploading = uploadingSlot === slot.key;

                return (
                  <div
                    key={slot.key}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{slot.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{slot.desc}</div>
                    </div>

                    <div className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden relative border border-slate-300 flex items-center justify-center">
                      {photoUrl ? (
                        <>
                          <img
                            src={photoUrl}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(slot.key, false)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-600/90 text-white rounded text-[9px] font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Đã có ảnh
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                          <span className="text-[10px] text-slate-500 block mt-1">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded-xl text-center text-xs font-bold cursor-pointer transition-colors block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePhotoUpload(slot.key, e.target.files[0], false);
                          }
                        }}
                      />
                      {isUploading ? 'Đang tải...' : photoUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <p>✓ Nhân viên và khách đã đồng kiểm tra 5 góc xe, lốp dự phòng và bộ cứu hộ.</p>
            <p>✓ Sau khi bấm xác nhận, đơn sẽ cập nhật CSDL sang trạng thái <strong>ĐANG THUÊ (Bước 7)</strong> và ghi lại lịch sử nghiệp vụ.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="primary" size="lg" icon={CheckCircle2} disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật CSDL...' : 'Xác nhận bàn giao xe cho khách'}
            </Button>
          </div>
        </form>
      )}

      {/* ================= FORM CHECK-OUT THU XE & QUYẾT TOÁN ================= */}
      {activeTab === 'CHECK_OUT' && currentBooking && (
        <form onSubmit={handleConfirmCheckOut} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Biên bản nghiệm thu thu hồi xe (Check-Out)
            </h3>
            <button
              type="button"
              onClick={() => handleFillSamplePhotos(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nạp 5 ảnh chụp trả xe (Demo)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số ODO lúc nhận lại xe (km) *
              </label>
              <input
                type="number"
                value={checkOutForm.currentMileage}
                onChange={(e) => setCheckOutForm({ ...checkOutForm, currentMileage: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức nhiên liệu / Pin lúc nhận lại (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={checkOutForm.fuelPercentage}
                onChange={(e) => setCheckOutForm({ ...checkOutForm, fuelPercentage: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phụ phí tổn hại / vi phạm giao thông / trễ hạn (VND nếu có)
              </label>
              <input
                type="number"
                value={checkOutForm.damagePenalty}
                onChange={(e) => setCheckOutForm({ ...checkOutForm, damagePenalty: e.target.value })}
                placeholder="0"
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú nghiệm thu thu xe
              </label>
              <textarea
                rows={2}
                value={checkOutForm.conditionNotes}
                onChange={(e) => setCheckOutForm({ ...checkOutForm, conditionNotes: e.target.value })}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* CHECKLIST CHỤP ẢNH 5 GÓC KIỂM TRA XE CHECK-OUT */}
          <div className="space-y-3 pt-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" /> Checklist chụp ảnh nghiệm thu trả xe (5 góc)
              </h4>
              <p className="text-[11px] text-slate-500">
                Ghi nhận tình trạng xe khi hoàn tất chuyến đi để quyết toán hoàn tiền cọc bảo đảm
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PHOTO_SLOTS.map((slot) => {
                const photoUrl = checkOutForm.photos[slot.key];
                const isUploading = uploadingSlot === slot.key;

                return (
                  <div
                    key={slot.key}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{slot.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{slot.desc}</div>
                    </div>

                    <div className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden relative border border-slate-300 flex items-center justify-center">
                      {photoUrl ? (
                        <>
                          <img
                            src={photoUrl}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(slot.key, true)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-600/90 text-white rounded text-[9px] font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Đã có ảnh
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                          <span className="text-[10px] text-slate-500 block mt-1">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-300 hover:border-emerald-300 rounded-xl text-center text-xs font-bold cursor-pointer transition-colors block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePhotoUpload(slot.key, e.target.files[0], true);
                          }
                        }}
                      />
                      {isUploading ? 'Đang tải...' : photoUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hộp tính toán phụ phí & Hoàn cọc tự động */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              Bảng quyết toán ODO & Tiền cọc hoàn trả:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">ODO xuất phát:</span>
                <strong className="font-mono text-slate-900">{checkOutCalculation.startKm} km</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">ODO lúc trả:</span>
                <strong className="font-mono text-slate-900">{checkOutCalculation.endKm} km</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Số km đã chạy:</span>
                <strong className="font-mono text-blue-600">{checkOutCalculation.actualDrivenKm} km</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Định mức cho phép:</span>
                <strong className="font-mono text-slate-900">{checkOutCalculation.maxAllowedKm} km</strong>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Số km vượt định mức:</span>
                <span className="font-bold">{checkOutCalculation.extraKm} km</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phụ phí vượt số km:</span>
                <span className="font-bold text-rose-600">+{formatCurrency(checkOutCalculation.extraKmFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phụ phí trầy xước / hư tổn:</span>
                <span className="font-bold text-rose-600">+{formatCurrency(Number(checkOutForm.damagePenalty) || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tiền cọc ban đầu của khách:</span>
                <span className="font-bold text-slate-800">{formatCurrency(currentBooking.depositAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-sm sm:text-base text-emerald-600">
                <span>SỐ TIỀN CỌC HOÀN LẠI DỰ KIẾN:</span>
                <span>{formatCurrency(checkOutCalculation.refundDeposit)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="primary" size="lg" icon={CheckCircle2} disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật CSDL...' : 'Xác nhận nghiệm thu & Thu hồi xe'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
