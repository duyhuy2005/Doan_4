import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService, calculateBookingStep, getBookingStepName } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { exportToCsv } from '../../utils/exportExcel';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  ClipboardCheck,
  FileText,
  User,
  Phone,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  History,
  FileCheck,
  Receipt,
  Car,
  KeyRound,
  Check,
  AlertCircle,
  Download,
  CalendarDays,
  ShieldCheck,
  Timer
} from 'lucide-react';

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const toast = useToastStore();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('OVERVIEW');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isSweeping, setIsSweeping] = useState(false);

  // Bộ lọc theo khoảng ngày
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    preset: 'ALL'
  });

  // Modals for actions
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: '', // 'REJECT', 'PAY_DEPOSIT', 'HANDOVER', 'RETURN', 'SETTLE', 'REFUND'
    booking: null,
    title: '',
    data: {}
  });

  const loadData = async () => {
    try {
      const data = storageService.getBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    // Tự động kiểm tra quá hạn cọc mỗi 30s
    const timer = setInterval(() => {
      storageService.sweepExpiredBookings().then(() => loadData());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Tải lịch sử nghiệp vụ khi mở modal chi tiết
  useEffect(() => {
    if (selectedBooking) {
      storageService.getBookingHistory(selectedBooking.id).then(hist => {
        setBookingHistory(hist || []);
      });
    } else {
      setBookingHistory([]);
      setActiveDetailTab('OVERVIEW');
    }
  }, [selectedBooking]);

  // Kích hoạt quét đơn quá hạn thủ công
  const handleManualSweep = async () => {
    setIsSweeping(true);
    try {
      const res = await storageService.sweepExpiredBookings();
      const count = res?.data?.expiredCount || 0;
      if (count > 0) {
        toast.warning(`Đã tự động hủy ${count} đơn quá hạn cọc và giải phóng lịch xe!`);
      } else {
        toast.info('Tất cả các đơn đang giữ chỗ đều nằm trong thời hạn hợp lệ.');
      }
      await loadData();
    } catch (err) {
      toast.error('Lỗi khi quét đơn quá hạn: ' + err.message);
    } finally {
      setIsSweeping(false);
    }
  };

  // === CÁC THAO TÁC THEO 11 BƯỚC QUY TRÌNH ===

  // Bước 2: Nhân viên duyệt đơn
  const handleConfirmOrder = async (booking) => {
    try {
      await storageService.confirmBookingStep(booking.id, 'Nhân viên xác nhận duyệt đơn thuê xe hợp lệ.');
      toast.success(`Đã duyệt đơn ${booking.bookingCode}! Chuyển sang bước tạo hợp đồng điện tử.`);
      await loadData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Bước 3: Tạo hợp đồng điện tử
  const handleCreateContract = async (booking) => {
    try {
      await storageService.createContractStep(booking.id, 'Soạn thảo hợp đồng điện tử');
      toast.success(`Đã khởi tạo hợp đồng điện tử cho đơn ${booking.bookingCode}! Chờ khách hàng ký duyệt.`);
      await loadData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Bước 4: Khách hàng xác nhận / ký hợp đồng (Admin hỗ trợ xác nhận tại quầy)
  const handleCustomerSign = async (booking) => {
    try {
      await storageService.customerSignContractStep(booking.id, 'Khách hàng ký xác nhận tại quầy giao dịch.');
      toast.success(`Khách đã ký hợp đồng ${booking.bookingCode}! Đã thiết lập thời hạn thanh toán cọc giữ xe.`);
      await loadData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Mở modal thu tiền cọc (Bước 5)
  const openPayDepositModal = (booking) => {
    setActionModal({
      isOpen: true,
      type: 'PAY_DEPOSIT',
      booking,
      title: `Thu tiền cọc bảo đảm — Đơn ${booking.bookingCode}`,
      data: {
        amount: booking.depositAmount || 5000000,
        paymentMethod: 'CHUYEN_KHOAN',
        notes: 'Khách hàng chuyển khoản cọc qua tài khoản ngân hàng chi nhánh.'
      }
    });
  };

  // Mở modal bàn giao xe (Bước 7)
  const openHandoverModal = (booking) => {
    setActionModal({
      isOpen: true,
      type: 'HANDOVER',
      booking,
      title: `Biên bản bàn giao xe (Check-in) — Đơn ${booking.bookingCode}`,
      data: {
        currentMileage: booking.car?.currentMileage || 12000,
        fuelPercentage: 100,
        conditionNotes: 'Xe sạch sẽ, ngoại thất không trầy xước lớn, đầy đủ lốp dự phòng và giấy tờ.'
      }
    });
  };

  // Mở modal trả xe (Bước 8)
  const openReturnModal = (booking) => {
    const startKm = booking.handoverCheckIn?.currentMileage || booking.car?.currentMileage || 12000;
    setActionModal({
      isOpen: true,
      type: 'RETURN',
      booking,
      title: `Biên bản thu hồi & nghiệm thu trả xe (Check-out) — Đơn ${booking.bookingCode}`,
      data: {
        currentMileage: startKm + 350,
        fuelPercentage: 95,
        damagePenalty: 0,
        notes: 'Khách trả xe đúng giờ, tình trạng xe tốt.'
      }
    });
  };

  // Mở modal chốt hóa đơn quyết toán (Bước 9)
  const openSettleModal = (booking) => {
    const extra = booking.extraCharges || 0;
    const remainingRent = Math.max(0, (booking.totalPrice || 0) - (booking.paidDeposit || 0));
    setActionModal({
      isOpen: true,
      type: 'SETTLE',
      booking,
      title: `Chốt hóa đơn quyết toán — Đơn ${booking.bookingCode}`,
      data: {
        amount: remainingRent + extra,
        paymentMethod: 'CHUYEN_KHOAN',
        notes: 'Quyết toán tiền thuê còn lại và các khoản phụ trội.'
      }
    });
  };

  // Mở modal đối soát & hoàn cọc (Bước 10: Hỗ trợ chính sách bảo lưu cọc phạt nguội 15-20 ngày)
  const openRefundModal = (booking) => {
    const dep = booking.depositAmount || 5000000;
    setActionModal({
      isOpen: true,
      type: 'REFUND',
      booking,
      title: `Đối soát & Hoàn trả tiền cọc — Đơn ${booking.bookingCode}`,
      data: {
        refundAmount: dep,
        paymentMethod: 'CHUYEN_KHOAN',
        refundMode: 'HOLD_FINES', // 'HOLD_FINES' hoặc 'FULL'
        holdAmountForFines: 2000000,
        notes: 'Khách trả xe nguyên vẹn. Bảo lưu 2.000.000đ đối soát phạt nguội cổng CSGT trong 15 ngày.'
      }
    });
  };

  // Mở modal giải phóng cọc phạt nguội (Đợt 2)
  const openReleaseTrafficHoldModal = (booking) => {
    setActionModal({
      isOpen: true,
      type: 'RELEASE_TRAFFIC_HOLD',
      booking,
      title: `Giải phóng cọc bảo lưu phạt nguội (Đợt 2) — Đơn ${booking.bookingCode}`,
      data: {
        amount: 2000000,
        deductionForFines: 0,
        paymentMethod: 'CHUYEN_KHOAN',
        notes: 'Đã hoàn tất thời gian 15 ngày đối soát cổng CSGT, không có lỗi vi phạm phát sinh.'
      }
    });
  };

  // Mở modal gia hạn hợp đồng đang thuê (Trip Extension)
  const openExtendModal = (booking) => {
    const oldEnd = new Date(booking.endDate || booking.returnDate || Date.now());
    const defaultNewEnd = new Date(oldEnd.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setActionModal({
      isOpen: true,
      type: 'EXTEND',
      booking,
      title: `Gia hạn thời gian thuê xe — Đơn ${booking.bookingCode}`,
      data: {
        newEndDate: defaultNewEnd,
        notes: 'Khách hàng có nhu cầu gia hạn thêm lịch trình.'
      }
    });
  };

  // Xử lý submit action modal
  const handleExecuteActionModal = async () => {
    const { type, booking, data } = actionModal;
    if (!booking) return;

    try {
      if (type === 'PAY_DEPOSIT') {
        await storageService.payDepositStep(booking.id, data.amount, data.paymentMethod);
        toast.success(`Đã thu cọc ${formatCurrency(data.amount)}! Hợp đồng chính thức có hiệu lực.`);
      } else if (type === 'HANDOVER') {
        await storageService.handoverStep(booking.id, data);
        toast.success(`Đã bàn giao xe cho khách hàng thành công! Đơn chuyển sang trạng thái đang thuê.`);
      } else if (type === 'RETURN') {
        await storageService.returnCarStep(booking.id, data);
        toast.success(`Đã nghiệm thu trả xe thành công! Chuyển sang bước chốt hóa đơn.`);
      } else if (type === 'SETTLE') {
        await storageService.settleInvoiceStep(booking.id, data.amount, data.paymentMethod);
        toast.success(`Đã chốt hóa đơn quyết toán! Chuyển sang bước đối soát và hoàn cọc.`);
      } else if (type === 'REFUND') {
        const hold = data.refundMode === 'HOLD_FINES' ? Number(data.holdAmountForFines || 2000000) : 0;
        await storageService.refundDepositStep(booking.id, data.refundAmount, data.paymentMethod, data.notes, hold);
        if (hold > 0) {
          toast.success(`Đã hoàn cọc đợt 1 và bảo lưu ${formatCurrency(hold)} đối soát phạt nguội cổng CSGT trong 15 ngày!`);
        } else {
          toast.success(`Đã đối soát và hoàn trả 100% tiền cọc! Đơn thuê hoàn tất trọn vẹn.`);
        }
      } else if (type === 'RELEASE_TRAFFIC_HOLD') {
        await storageService.releaseTrafficHold(booking.id, data.amount, data.deductionForFines, data.paymentMethod, data.notes);
        toast.success(`Đã giải phóng và thanh toán cọc phạt nguội đợt 2! Đơn thuê hoàn thành 100%.`);
      } else if (type === 'EXTEND') {
        await storageService.extendBooking(booking.id, data.newEndDate, data.notes);
        toast.success(`Đã gia hạn thuê xe thành công! Hợp đồng và lịch xe đã được cập nhật.`);
      } else if (type === 'REJECT') {
        await storageService.updateBookingStatus(booking.id, 'REJECTED', data.reason);
        toast.warning(`Đã từ chối đơn thuê ${booking.bookingCode}.`);
      }

      setActionModal({ isOpen: false, type: '', booking: null, title: '', data: {} });
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  // Tính toán thời gian cọc còn lại
  const getDeadlineInfo = (deadlineStr) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;
    if (diffMs <= 0) {
      return { isExpired: true, text: 'ĐÃ QUÁ HẠN GIỮ XE' };
    }
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return { isExpired: false, text: `Còn ${mins}p ${secs}s` };
  };

  // Đổi preset bộ lọc ngày
  const handleDatePreset = (preset) => {
    const now = new Date();
    if (preset === 'ALL') {
      setDateFilter({ startDate: '', endDate: '', preset: 'ALL' });
    } else if (preset === 'TODAY') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().slice(0, 10);
      setDateFilter({ startDate: start, endDate: end, preset: 'TODAY' });
    } else if (preset === 'NEXT_7_DAYS') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
      const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setDateFilter({ startDate: start, endDate: next7, preset: 'NEXT_7_DAYS' });
    } else if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 10);
      setDateFilter({ startDate: start, endDate: end, preset: 'THIS_MONTH' });
    }
  };

  // Xuất file Excel / CSV chuẩn UTF-8 Tiếng Việt không lỗi font
  const handleExportExcel = () => {
    exportToCsv({
      filename: `Danh_sach_don_thue_${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: '_index', label: 'STT' },
        { key: 'bookingCode', label: 'Mã đơn thuê' },
        { key: 'createdAt', label: 'Ngày tạo', formatter: (v) => formatDateTime(v) },
        { key: 'carName', label: 'Tên xe', accessor: (b) => b.car?.carName || b.carName || 'Xe ô tô' },
        { key: 'licensePlate', label: 'Biển số', accessor: (b) => b.car?.licensePlate || b.licensePlate || '-' },
        { key: 'customerName', label: 'Khách hàng', accessor: (b) => b.user?.fullName || b.userName || 'Khách' },
        { key: 'phone', label: 'Số điện thoại', accessor: (b) => b.user?.phone || b.userPhone || '-' },
        { key: 'startDate', label: 'Ngày nhận xe', formatter: (v) => formatDateTime(v) },
        { key: 'endDate', label: 'Ngày trả dự kiến', formatter: (v) => formatDateTime(v) },
        { key: 'totalDays', label: 'Số ngày thuê' },
        { key: 'carRentalFee', label: 'Tiền thuê xe (VNĐ)', formatter: (v) => formatCurrency(v) },
        { key: 'depositAmount', label: 'Tiền cọc giữ xe (VNĐ)', formatter: (v) => formatCurrency(v) },
        { key: 'extraCharges', label: 'Phụ phí phát sinh (VNĐ)', formatter: (v) => formatCurrency(v || 0) },
        { key: 'totalPrice', label: 'Tổng tiền đơn (VNĐ)', formatter: (v) => formatCurrency(v) },
        { key: 'stepName', label: 'Tiến trình (11 Bước)', accessor: (b) => `Bước ${b.step || 1}: ${b.stepName || ''}` },
        { key: 'paymentStatus', label: 'Trạng thái thanh toán', accessor: (b) => b.paymentStatus || 'UNPAID' },
        { key: 'notes', label: 'Ghi chú', accessor: (b) => b.notes || b.staffNotes || '' }
      ],
      data: filteredBookings
    });
    toast.success(`Đã xuất file Excel ${filteredBookings.length} đơn thuê thành công!`);
  };

  // Lọc danh sách theo Tab, Search và Date Range
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.bookingCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.userName || b.user?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.carName || b.car?.carName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.userPhone || b.user?.phone || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Lọc theo khoảng ngày
    if (dateFilter.startDate) {
      const s = new Date(dateFilter.startDate).getTime();
      const bStart = new Date(b.startDate || b.createdAt).getTime();
      if (bStart < s) return false;
    }
    if (dateFilter.endDate) {
      const e = new Date(dateFilter.endDate + 'T23:59:59').getTime();
      const bEnd = new Date(b.endDate || b.startDate || b.createdAt).getTime();
      if (bEnd > e) return false;
    }

    const step = calculateBookingStep(b.bookingStatus, b.step);
    if (activeTab === 'ALL') return true;
    if (activeTab === 'STEP_1') return step === 1 || b.bookingStatus === 'PENDING' || b.bookingStatus === 'CHO_XAC_NHAN';
    if (activeTab === 'STEP_2_4') return (step >= 2 && step <= 4) || b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CONTRACT_DRAFT' || b.bookingStatus === 'AWAITING_DEPOSIT';
    if (activeTab === 'STEP_5_7') return (step >= 5 && step <= 7) || b.bookingStatus === 'READY_FOR_DELIVERY' || b.bookingStatus === 'DEPOSIT_PAID' || b.bookingStatus === 'ACTIVE';
    if (activeTab === 'STEP_8_10') return (step >= 8 && step <= 10) || b.bookingStatus === 'AWAITING_RETURN' || b.bookingStatus === 'AWAITING_SETTLEMENT' || b.bookingStatus === 'AWAITING_REFUND';
    if (activeTab === 'STEP_11') return step === 11 || b.bookingStatus === 'COMPLETED';
    if (activeTab === 'EXPIRED_CANCELLED') return step <= 0 || b.isExpired || b.bookingStatus === 'EXPIRED' || b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-blue-600" /> Quản Lý Đơn Thuê — Quy Trình 11 Bước
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Liên kết đồng bộ: <strong>Đơn thuê → Hợp đồng → Thanh toán → Giao nhận xe</strong>. Tự động kiểm soát hạn giữ xe và giải phóng lịch xe.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportExcel}
            title="Xuất danh sách đơn thuê hiện tại ra file CSV/Excel UTF-8"
          >
            Xuất Excel ({filteredBookings.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isSweeping}
            onClick={handleManualSweep}
            title="Quét các đơn chưa nộp cọc đã quá thời hạn giữ xe để hủy đơn và giải phóng lịch xe"
          >
            Quét quá hạn
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs & Search & Date Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-thin">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'STEP_1', label: '1. Chờ duyệt (Mới tạo)' },
            { key: 'STEP_2_4', label: '2-4. Chờ HĐ & Cọc' },
            { key: 'STEP_5_7', label: '5-7. Sẵn sàng & Đang thuê' },
            { key: 'STEP_8_10', label: '8-10. Quyết toán & Hoàn cọc' },
            { key: 'STEP_11', label: '11. Đã hoàn tất' },
            { key: 'EXPIRED_CANCELLED', label: 'Quá hạn / Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter bar: Search + Date Range */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1 border-t border-slate-100">
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại, tên xe..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="lg:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>Thời gian:</span>
            </div>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value, preset: 'CUSTOM' })}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Từ ngày"
            />
            <span className="text-xs text-slate-400">→</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value, preset: 'CUSTOM' })}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Đến ngày"
            />

            <div className="flex items-center gap-1 ml-auto">
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'TODAY', label: 'Hôm nay' },
                { key: 'NEXT_7_DAYS', label: '7 ngày tới' },
                { key: 'THIS_MONTH', label: 'Tháng này' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleDatePreset(p.key)}
                  className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                    dateFilter.preset === p.key
                      ? 'bg-blue-100 text-blue-700 font-bold'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3.5 px-4">Mã đơn & Ngày tạo</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Xe thuê</th>
                <th className="py-3.5 px-4">Tổng tiền & Cọc</th>
                <th className="py-3.5 px-4">Tiến trình (11 Bước)</th>
                <th className="py-3.5 px-4 text-right">Hành động kế tiếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Không tìm thấy đơn thuê nào trong bộ lọc này.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const step = calculateBookingStep(b.bookingStatus, b.step);
                  const deadlineInfo = getDeadlineInfo(b.depositDeadline);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Cột 1: Mã đơn */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {b.bookingCode}
                          {b.isExpired && (
                            <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              Quá hạn
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{formatDateTime(b.createdAt)}</div>
                      </td>

                      {/* Cột 2: Khách hàng */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{b.userName || b.user?.fullName || 'Khách vãng lai'}</div>
                        <div className="text-xs text-slate-500 font-mono">{b.userPhone || b.user?.phone || '0901234567'}</div>
                      </td>

                      {/* Cột 3: Xe */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.carName || b.car?.carName || 'Xe ô tô'}</div>
                        <div className="text-[11px] font-mono text-slate-400">{b.carLicensePlate || b.car?.licensePlate}</div>
                      </td>

                      {/* Cột 4: Tổng tiền & Cọc */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-blue-600">{formatCurrency(b.totalPrice)}</div>
                        <div className="text-[11px] text-slate-500">
                          Cọc: <strong>{formatCurrency(b.depositAmount)}</strong>
                          {b.paidDeposit > 0 ? (
                            <span className="text-emerald-600 ml-1 font-semibold">(Đã thu)</span>
                          ) : (
                            <span className="text-amber-600 ml-1">(Chưa thu)</span>
                          )}
                        </div>
                      </td>

                      {/* Cột 5: Tiến trình 11 Bước */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              step === 11 ? 'bg-emerald-100 text-emerald-800' :
                              step === 0 || b.isExpired ? 'bg-rose-100 text-rose-800' :
                              step >= 5 ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {b.stepName || getBookingStepName(step)}
                            </span>
                          </div>

                          {/* Countdown thời hạn cọc */}
                          {step === 4 && deadlineInfo && (
                            <div className={`text-[11px] flex items-center gap-1 font-semibold ${
                              deadlineInfo.isExpired ? 'text-rose-600 animate-pulse' : 'text-amber-600'
                            }`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Hạn nộp cọc: {deadlineInfo.text}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cột 6: Hành động kế tiếp theo thứ tự liên kết */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          title="Xem chi tiết & lịch sử nghiệp vụ"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Bước 1: Duyệt / Từ chối đơn */}
                        {step === 1 && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleConfirmOrder(b)}
                            >
                              Duyệt đơn
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                              onClick={() => setActionModal({
                                isOpen: true,
                                type: 'REJECT',
                                booking: b,
                                title: `Từ chối đơn thuê ${b.bookingCode}`,
                                data: { reason: 'Hồ sơ GPLX hoặc điều kiện khách không đủ yêu cầu.' }
                              })}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}

                        {/* Bước 2: Tạo hợp đồng */}
                        {step === 2 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={FileText}
                            onClick={() => handleCreateContract(b)}
                          >
                            Tạo HĐ
                          </Button>
                        )}

                        {/* Bước 3: Khách ký hợp đồng */}
                        {step === 3 && (
                          <Button
                            variant="accent"
                            size="sm"
                            icon={FileCheck}
                            onClick={() => handleCustomerSign(b)}
                          >
                            Khách ký HĐ
                          </Button>
                        )}

                        {/* Bước 4: Thu tiền cọc & Kích hoạt hợp đồng */}
                        {step === 4 && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CreditCard}
                            onClick={() => openPayDepositModal(b)}
                          >
                            Thu tiền cọc
                          </Button>
                        )}

                        {/* Bước 5 & 6: Sẵn sàng giao xe */}
                        {(step === 5 || step === 6) && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={ClipboardCheck}
                            onClick={() => openHandoverModal(b)}
                          >
                            Bàn giao xe
                          </Button>
                        )}

                        {/* Bước 7: Đang thuê (Có thể Nhận lại xe hoặc Gia hạn hợp đồng) */}
                        {step === 7 && (
                          <div className="flex items-center gap-1.5 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Timer}
                              onClick={() => openExtendModal(b)}
                              title="Gia hạn thời gian thuê xe thêm ngày"
                            >
                              Gia hạn
                            </Button>
                            <Button
                              variant="accent"
                              size="sm"
                              icon={RotateCcw}
                              onClick={() => openReturnModal(b)}
                            >
                              Nhận lại xe
                            </Button>
                          </div>
                        )}

                        {/* Bước 8: Chốt hóa đơn quyết toán */}
                        {step === 8 && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Receipt}
                            onClick={() => openSettleModal(b)}
                          >
                            Chốt hóa đơn
                          </Button>
                        )}

                        {/* Bước 9 & 10: Đối soát & Hoàn cọc (Hỗ trợ 2 đợt hoàn cọc / phạt nguội) */}
                        {(step === 9 || step === 10) && (
                          <div className="flex items-center gap-1.5 justify-end">
                            {(b.trafficHoldAmount > 0 || b.staffNotes?.includes('phạt nguội') || b.notes?.includes('phạt nguội') || b.notes?.includes('bảo lưu')) ? (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={ShieldCheck}
                                onClick={() => openReleaseTrafficHoldModal(b)}
                                title="Giải ngân số tiền bảo lưu sau khi đối soát cổng CSGT không có vi phạm"
                              >
                                Giải ngân phạt nguội
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={CreditCard}
                                onClick={() => openRefundModal(b)}
                              >
                                Hoàn cọc
                              </Button>
                            )}
                          </div>
                        )}

                        {step === 11 && (
                          <span className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">
                            ✓ Hoàn thành
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐƠN THUÊ & LIÊN KẾT 4 PHÂN HỆ */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title={`Chi tiết đơn thuê: ${selectedBooking?.bookingCode}`}
        maxWidth="max-w-4xl"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Header info badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <div className="text-lg font-black text-slate-900">{selectedBooking.bookingCode}</div>
                <div className="text-xs text-slate-500">Tạo lúc: {formatDateTime(selectedBooking.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold">
                  {selectedBooking.stepName || getBookingStepName(calculateBookingStep(selectedBooking.bookingStatus, selectedBooking.step))}
                </span>
                {selectedBooking.isExpired && (
                  <span className="px-2.5 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold">
                    Quá hạn giữ xe
                  </span>
                )}
              </div>
            </div>

            {/* 5 Tab Navigation: Tổng quan - Hợp đồng - Thanh toán - Giao nhận - Lịch sử nghiệp vụ */}
            <div className="flex border-b border-slate-200 gap-4 overflow-x-auto text-xs font-bold">
              {[
                { key: 'OVERVIEW', label: '1. Tổng quan đơn' },
                { key: 'CONTRACT', label: '2. Hợp đồng điện tử' },
                { key: 'PAYMENT', label: '3. Thanh toán & Cọc' },
                { key: 'HANDOVER', label: '4. Giao nhận xe' },
                { key: 'HISTORY', label: '5. Lịch sử nghiệp vụ (Audit Trail)' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveDetailTab(tab.key)}
                  className={`pb-2.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeDetailTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: TỔNG QUAN */}
            {activeDetailTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" /> Khách hàng
                  </h4>
                  <div className="text-slate-600 space-y-1">
                    <div>Họ và tên: <strong className="text-slate-800">{selectedBooking.userName || selectedBooking.user?.fullName}</strong></div>
                    <div>Số điện thoại: <strong className="text-slate-800 font-mono">{selectedBooking.userPhone || selectedBooking.user?.phone}</strong></div>
                    <div>Điểm nhận: <strong className="text-slate-800">{selectedBooking.pickupLocation || 'Chi nhánh Hà Nội'}</strong></div>
                    <div>Điểm trả: <strong className="text-slate-800">{selectedBooking.returnLocation || 'Chi nhánh Hà Nội'}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" /> Phương tiện & Lịch thuê
                  </h4>
                  <div className="text-slate-600 space-y-1">
                    <div>Xe: <strong className="text-slate-800">{selectedBooking.carName || selectedBooking.car?.carName}</strong></div>
                    <div>Biển số: <strong className="text-slate-800 font-mono">{selectedBooking.carLicensePlate || selectedBooking.car?.licensePlate}</strong></div>
                    <div>Nhận xe: <strong>{formatDateTime(selectedBooking.startDate)}</strong></div>
                    <div>Trả xe: <strong>{formatDateTime(selectedBooking.endDate)}</strong> ({selectedBooking.totalDays} ngày)</div>
                  </div>
                </div>

                <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-blue-700">Tổng chi phí thuê dự kiến</div>
                    <div className="text-xl font-black text-blue-900">{formatCurrency(selectedBooking.totalPrice)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-600">Tiền cọc bảo đảm</div>
                    <div className="text-lg font-bold text-slate-800">{formatCurrency(selectedBooking.depositAmount)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HỢP ĐỒNG ĐIỆN TỬ */}
            {activeDetailTab === 'CONTRACT' && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span>Hợp đồng số: {selectedBooking.contractCode || `HD-DT${selectedBooking.id}`}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedBooking.contractStatus === 'HIEU_LUC' || selectedBooking.contractStatus === 'DA_KY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedBooking.contractStatus || 'Chưa ký'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 font-mono">
                  <div>Bên A (Cho thuê): AutoRental Co., Ltd</div>
                  <div>Bên B (Bên thuê): {selectedBooking.userName || selectedBooking.user?.fullName} - CCCD: {selectedBooking.user?.citizenId || '001200000001'}</div>
                  <div>Phương tiện: {selectedBooking.carName} (BKS: {selectedBooking.carLicensePlate})</div>
                  <div>Hiệu lực: Hợp đồng chính thức có hiệu lực sau khi bên B hoàn tất thanh toán cọc bảo đảm.</div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => {
                      setSelectedBooking(null);
                      navigate('/admin/contracts');
                    }}
                  >
                    Xem trang Quản lý Hợp đồng
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: THANH TOÁN & ĐẶT CỌC */}
            {activeDetailTab === 'PAYMENT' && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" /> Bảng Kê Thanh Toán & Đối Soát Cọc
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => {
                      setSelectedBooking(null);
                      navigate('/admin/payments');
                    }}
                  >
                    Trang Thanh toán
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-500">Tiền cọc yêu cầu</div>
                    <div className="text-base font-bold text-slate-800">{formatCurrency(selectedBooking.depositAmount)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-[11px] text-emerald-700">Đã thanh toán cọc</div>
                    <div className="text-base font-bold text-emerald-800">{formatCurrency(selectedBooking.paidDeposit || 0)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="text-[11px] text-amber-700">Phụ phí phát sinh</div>
                    <div className="text-base font-bold text-amber-800">{formatCurrency(selectedBooking.extraCharges || 0)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GIAO NHẬN XE */}
            {activeDetailTab === 'HANDOVER' && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" /> Biên Bản Kiểm Định & Nghiệm Thu
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => {
                      setSelectedBooking(null);
                      navigate(`/admin/handovers?bookingId=${selectedBooking.id}`);
                    }}
                  >
                    Trang Giao nhận xe
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800">1. Biên bản Giao xe (Check-in)</div>
                    <div className="text-xs text-slate-600">ODO ban đầu: <strong>{selectedBooking.handoverCheckIn?.currentMileage || 12000} km</strong></div>
                    <div className="text-xs text-slate-600">Nhiên liệu: <strong>{selectedBooking.handoverCheckIn?.fuelPercentage || 100}%</strong></div>
                    <div className="text-xs text-slate-500 italic">"{selectedBooking.handoverCheckIn?.conditionNotes || 'Xe hoạt động trơn tru, đầy đủ phụ kiện.'}"</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800">2. Biên bản Nhận lại xe (Check-out)</div>
                    <div className="text-xs text-slate-600">ODO hoàn trả: <strong>{selectedBooking.handoverCheckOut?.currentMileage || 'Chưa trả xe'} km</strong></div>
                    <div className="text-xs text-slate-600">Nhiên liệu trả: <strong>{selectedBooking.handoverCheckOut?.fuelPercentage || 0}%</strong></div>
                    <div className="text-xs text-slate-500 italic">"{selectedBooking.handoverCheckOut?.conditionNotes || 'Đang trong thời gian lưu hành.'}"</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: LỊCH SỬ NGHIỆP VỤ (AUDIT TRAIL) */}
            {activeDetailTab === 'HISTORY' && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" /> Dòng Thời Gian Xử Lý Nghiệp Vụ (Audit Trail)
                </h4>

                {bookingHistory.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">Đang tải lịch sử nghiệp vụ...</div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-blue-200 space-y-4 my-2">
                    {bookingHistory.map((h, i) => (
                      <div key={h.id || i} className="relative">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{h.formattedTime || formatDateTime(h.actionTime)}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-600">
                              {h.actorName || 'Nhân viên'}
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-600">
                              {h.previousStatus ? `${h.previousStatus} → ` : ''}{h.newStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{h.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL THAO TÁC NGHIỆP VỤ (ACTION MODAL) */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', booking: null, title: '', data: {} })}
        title={actionModal.title}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Action: Thu tiền cọc */}
          {actionModal.type === 'PAY_DEPOSIT' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền cọc cần thu (VNĐ)</label>
                <input
                  type="number"
                  value={actionModal.data.amount}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, amount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phương thức thanh toán</label>
                <select
                  value={actionModal.data.paymentMethod}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, paymentMethod: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="CHUYEN_KHOAN">Chuyển khoản ngân hàng (QR Code)</option>
                  <option value="TIEN_MAT">Tiền mặt tại quầy chi nhánh</option>
                  <option value="THE">Thẻ tín dụng / POS</option>
                  <option value="VNPAY">Cổng VNPAY</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs">
                💡 Sau khi xác nhận thu cọc, hợp đồng sẽ <strong>chính thức có hiệu lực pháp lý</strong> và lịch xe được giữ chắc chắn.
              </div>
            </div>
          )}

          {/* Action: Bàn giao xe (Check-in) */}
          {actionModal.type === 'HANDOVER' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số km hiện tại (ODO xuất phát)</label>
                <input
                  type="number"
                  value={actionModal.data.currentMileage}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, currentMileage: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức nhiên liệu (%)</label>
                <input
                  type="number"
                  value={actionModal.data.fuelPercentage}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, fuelPercentage: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú hiện trạng bàn giao</label>
                <textarea
                  rows={2}
                  value={actionModal.data.conditionNotes}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, conditionNotes: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          )}

          {/* Action: Nhận lại xe (Check-out) */}
          {actionModal.type === 'RETURN' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số km khi trả xe (ODO kết thúc)</label>
                <input
                  type="number"
                  value={actionModal.data.currentMileage}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, currentMileage: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức nhiên liệu hoàn trả (%)</label>
                <input
                  type="number"
                  value={actionModal.data.fuelPercentage}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, fuelPercentage: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phụ phí phát sinh (Vượt km / trễ hạn / hư hỏng)</label>
                <input
                  type="number"
                  value={actionModal.data.damagePenalty}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, damagePenalty: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-rose-600 font-bold"
                />
              </div>
            </div>
          )}

          {/* Action: Chốt hóa đơn & Quyết toán */}
          {actionModal.type === 'SETTLE' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổng tiền quyết toán còn lại (VNĐ)</label>
                <input
                  type="number"
                  value={actionModal.data.amount}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, amount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phương thức thanh toán</label>
                <select
                  value={actionModal.data.paymentMethod}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, paymentMethod: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                  <option value="TIEN_MAT">Tiền mặt</option>
                  <option value="THE">Thẻ POS</option>
                </select>
              </div>
            </div>
          )}

          {/* Action: Đối soát & Hoàn cọc (Hỗ trợ chính sách bảo lưu cọc phạt nguội 15-20 ngày) */}
          {actionModal.type === 'REFUND' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-indigo-900">
                  Chính sách đối soát phạt nguội (Traffic Infraction Policy)
                </label>
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="refundMode"
                      value="HOLD_FINES"
                      checked={actionModal.data.refundMode === 'HOLD_FINES'}
                      onChange={() => setActionModal({
                        ...actionModal,
                        data: { ...actionModal.data, refundMode: 'HOLD_FINES' }
                      })}
                      className="text-blue-600"
                    />
                    <span>Bảo lưu 2.000.000đ đối soát phạt nguội cổng CSGT (15 ngày)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="refundMode"
                      value="FULL"
                      checked={actionModal.data.refundMode === 'FULL'}
                      onChange={() => setActionModal({
                        ...actionModal,
                        data: { ...actionModal.data, refundMode: 'FULL' }
                      })}
                      className="text-blue-600"
                    />
                    <span>Hoàn tất 100% toàn bộ cọc ngay lập tức</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổng tiền cọc ban đầu (VNĐ)</label>
                <input
                  type="number"
                  value={actionModal.data.refundAmount}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, refundAmount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                />
              </div>

              {actionModal.data.refundMode === 'HOLD_FINES' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền bảo lưu phạt nguội (VNĐ)</label>
                    <input
                      type="number"
                      value={actionModal.data.holdAmountForFines}
                      onChange={(e) => setActionModal({
                        ...actionModal,
                        data: { ...actionModal.data, holdAmountForFines: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 font-bold text-amber-600 bg-amber-50/50"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-semibold text-emerald-800">Thực hoàn Đợt 1 ngay bây giờ:</span>
                    <strong className="text-sm font-black text-emerald-700">
                      {formatCurrency(Math.max(0, actionModal.data.refundAmount - (actionModal.data.holdAmountForFines || 0)))}
                    </strong>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú đối soát hoàn cọc</label>
                <textarea
                  rows={2}
                  value={actionModal.data.notes}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, notes: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          )}

          {/* Action: Giải phóng cọc bảo lưu phạt nguội (Đợt 2) */}
          {actionModal.type === 'RELEASE_TRAFFIC_HOLD' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                🛡️ Giải ngân số tiền cọc phạt nguội sau khi đối soát trên cổng dữ liệu CSGT quốc gia (15 ngày kết thúc chuyến đi).
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền bảo lưu đã giữ (VNĐ)</label>
                <input
                  type="number"
                  value={actionModal.data.amount}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, amount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khấu trừ vi phạm giao thông nếu có (VNĐ)</label>
                <input
                  type="number"
                  value={actionModal.data.deductionForFines}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, deductionForFines: Number(e.target.value) }
                  })}
                  placeholder="0 nếu không có vi phạm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-rose-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex justify-between items-center">
                <span className="font-semibold text-emerald-800">Thực chuyển trả Đợt 2 cho khách:</span>
                <strong className="text-sm font-black text-emerald-700">
                  {formatCurrency(Math.max(0, (actionModal.data.amount || 2000000) - (actionModal.data.deductionForFines || 0)))}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú đối soát</label>
                <textarea
                  rows={2}
                  value={actionModal.data.notes}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, notes: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          )}

          {/* Action: Gia hạn thời gian thuê (Trip Extension) */}
          {actionModal.type === 'EXTEND' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                ⏱️ Gia hạn thời gian chuyến đi. Hệ thống tự động kiểm tra chống trùng lịch xe và tính toán phụ phí phát sinh.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian trả xe hiện tại</label>
                <input
                  type="text"
                  disabled
                  value={formatDateTime(actionModal.booking?.endDate || actionModal.booking?.returnDate)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian gia hạn mới (Bắt buộc &gt; ngày hiện tại)</label>
                <input
                  type="datetime-local"
                  value={actionModal.data.newEndDate}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, newEndDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-blue-400 font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lý do gia hạn</label>
                <textarea
                  rows={2}
                  value={actionModal.data.notes}
                  onChange={(e) => setActionModal({
                    ...actionModal,
                    data: { ...actionModal.data, notes: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          )}

          {/* Action: Từ chối đơn */}
          {actionModal.type === 'REJECT' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lý do từ chối đơn thuê</label>
              <textarea
                rows={3}
                value={actionModal.data.reason}
                onChange={(e) => setActionModal({
                  ...actionModal,
                  data: { ...actionModal.data, reason: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionModal({ isOpen: false, type: '', booking: null, title: '', data: {} })}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteActionModal}
            >
              Xác nhận thực hiện
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
