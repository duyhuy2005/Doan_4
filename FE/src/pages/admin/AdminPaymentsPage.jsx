import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { exportToCsv } from '../../utils/exportExcel';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Download,
  CalendarDays
} from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function AdminPaymentsPage() {
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState(searchParams.get('bookingId') || '');
  const [filterType, setFilterType] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToastStore();

  // Bộ lọc khoảng ngày giao dịch
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    preset: 'ALL'
  });

  const loadPayments = () => {
    const rawPayments = storageService.getPayments();
    const bookings = storageService.getBookings();

    let allPayments = [];
    if (rawPayments && rawPayments.length > 0) {
      allPayments = rawPayments.map((p) => {
        const b = bookings.find((bk) => bk.id === p.bookingId || bk.bookingCode === p.bookingCode);
        const isRefund = p.type === 'HOAN_COC' || p.loaiGiaoDich === 'HOAN_COC';
        const isDeposit = p.type === 'TIEN_DAT_COC' || p.loaiGiaoDich === 'TIEN_DAT_COC' || p.type === 'DEPOSIT';
        const isRental = p.type === 'TIEN_THUE' || p.loaiGiaoDich === 'TIEN_THUE' || p.type === 'RENTAL';

        let typeKey = 'RENTAL';
        let typeLabel = 'Tiền thuê xe';
        if (isDeposit) {
          typeKey = 'DEPOSIT';
          typeLabel = 'Tiền cọc giữ xe';
        } else if (isRefund) {
          typeKey = 'REFUND';
          typeLabel = 'Hoàn trả tiền cọc';
        } else if (p.type === 'PHU_PHI' || p.loaiGiaoDich === 'PHU_PHI') {
          typeKey = 'EXTRA';
          typeLabel = 'Phụ phí phát sinh';
        }

        return {
          id: p.paymentCode || p.maGiaoDich || `TXN-${p.id}`,
          bookingId: p.bookingId,
          bookingCode: b?.bookingCode || `RENT0000${p.bookingId}`,
          customerName: b?.userName || b?.customerInfo?.fullName || 'Khách hàng',
          amount: Number(p.amount || p.soTien || 0),
          method: p.method || p.phuongThuc || 'CHUYEN_KHOAN',
          type: typeKey,
          typeLabel,
          status: p.status === 'THAT_BAI' ? 'FAILED' : 'SUCCESS',
          date: p.paymentDate || p.ngayTao || p.createdAt || new Date().toISOString(),
          transactionCode: p.transactionCode || p.maChuyenKhoan || '-',
        };
      });
    } else {
      bookings.forEach((b) => {
        if (b.depositAmount) {
          allPayments.push({
            id: `TXN-DEP-${b.id}`,
            bookingId: b.id,
            bookingCode: b.bookingCode,
            customerName: b.userName || b.customerInfo?.fullName || 'Khách hàng',
            amount: b.depositAmount,
            method: 'VNPAY',
            type: 'DEPOSIT',
            typeLabel: 'Tiền cọc giữ xe',
            status: b.bookingStatus !== 'PENDING' ? 'SUCCESS' : 'PENDING',
            date: b.createdAt || '2026-09-18T08:30:00',
            transactionCode: `DEP-${b.id}`,
          });
        }
        if (b.paymentStatus === 'PAID') {
          allPayments.push({
            id: `TXN-RENT-${b.id}`,
            bookingId: b.id,
            bookingCode: b.bookingCode,
            customerName: b.userName || b.customerInfo?.fullName || 'Khách hàng',
            amount: b.totalPrice,
            method: 'CHUYEN_KHOAN',
            type: 'RENTAL',
            typeLabel: 'Thanh toán tiền thuê',
            status: 'SUCCESS',
            date: b.handoverCheckIn?.time || b.createdAt || '2026-09-18T09:00:00',
            transactionCode: `RENT-${b.id}`,
          });
        }
        if (b.refundReceipt || b.handoverCheckOut) {
          allPayments.push({
            id: `TXN-REF-${b.id}`,
            bookingId: b.id,
            bookingCode: b.bookingCode,
            customerName: b.userName || b.customerInfo?.fullName || 'Khách hàng',
            amount: b.refundReceipt?.amount || b.depositAmount,
            method: 'CHUYEN_KHOAN',
            type: 'REFUND',
            typeLabel: 'Hoàn trả tiền cọc',
            status: 'SUCCESS',
            date: b.refundReceipt?.refundedAt || '2026-09-20T17:00:00',
            transactionCode: `REF-${b.id}`,
          });
        }
      });
    }

    setPayments(allPayments);
  };

  useEffect(() => {
    loadPayments();
  }, [searchParams]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await storageService.syncWithBackend();
      loadPayments();
      toast.success('Đã đồng bộ dữ liệu giao dịch từ SQL Server!');
    } catch {
      toast.error('Lỗi khi đồng bộ dữ liệu thanh toán.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDatePreset = (preset) => {
    const now = new Date();
    if (preset === 'ALL') {
      setDateFilter({ startDate: '', endDate: '', preset: 'ALL' });
    } else if (preset === 'TODAY') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().slice(0, 10);
      setDateFilter({ startDate: start, endDate: end, preset: 'TODAY' });
    } else if (preset === 'PAST_7_DAYS') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);
      setDateFilter({ startDate: start, endDate: end, preset: 'PAST_7_DAYS' });
    } else if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 10);
      setDateFilter({ startDate: start, endDate: end, preset: 'THIS_MONTH' });
    }
  };

  const handleExportExcel = () => {
    exportToCsv({
      filename: `Bao_cao_giao_dich_thanh_toan_${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: '_index', label: 'STT' },
        { key: 'id', label: 'Mã giao dịch' },
        { key: 'bookingCode', label: 'Mã đơn thuê' },
        { key: 'customerName', label: 'Khách hàng' },
        { key: 'typeLabel', label: 'Loại thanh toán' },
        { key: 'amount', label: 'Số tiền (VNĐ)', formatter: (v) => formatCurrency(v) },
        { key: 'method', label: 'Phương thức thanh toán' },
        { key: 'transactionCode', label: 'Mã giao dịch / Ngân hàng' },
        { key: 'status', label: 'Trạng thái', accessor: (p) => p.status === 'SUCCESS' ? 'Thành công' : 'Chờ xử lý' },
        { key: 'date', label: 'Thời gian giao dịch', formatter: (v) => formatDateTime(v) }
      ],
      data: filtered
    });
    toast.success(`Đã xuất báo cáo ${filtered.length} giao dịch thành công!`);
  };

  const totalDepositHeld = payments
    .filter((p) => p.type === 'DEPOSIT' && p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRentalCollected = payments
    .filter((p) => (p.type === 'RENTAL' || p.type === 'EXTRA') && p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.type === 'REFUND' && p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionCode.toLowerCase().includes(search.toLowerCase()) ||
      String(p.bookingId) === search.trim();
    const matchesType = filterType === 'ALL' || p.type === filterType;

    if (!matchesSearch || !matchesType) return false;

    if (dateFilter.startDate) {
      const s = new Date(dateFilter.startDate).getTime();
      const pDate = new Date(p.date).getTime();
      if (pDate < s) return false;
    }
    if (dateFilter.endDate) {
      const e = new Date(dateFilter.endDate + 'T23:59:59').getTime();
      const pDate = new Date(p.date).getTime();
      if (pDate > e) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Quản lý thanh toán & Giao dịch</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lịch sử thu tiền thuê, giữ cọc bảo đảm và đối soát hoàn trả cọc (Đồng bộ trực tiếp với CSDL)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportExcel}
            title="Xuất danh sách giao dịch ra file CSV/Excel UTF-8"
          >
            Xuất Excel ({filtered.length})
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

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tiền thuê & Phụ phí đã thu</span>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              {formatCurrency(totalRentalCollected)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Doanh thu thực nhận
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ₫
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tiền cọc giữ bảo đảm</span>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              {formatCurrency(totalDepositHeld)}
            </div>
            <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> Quỹ bảo chứng dịch vụ
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng tiền cọc đã hoàn</span>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              {formatCurrency(totalRefunded)}
            </div>
            <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Đã hoàn trả khách
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search & Date Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'Tất cả giao dịch' },
              { key: 'DEPOSIT', label: 'Tiền cọc' },
              { key: 'RENTAL', label: 'Tiền thuê' },
              { key: 'REFUND', label: 'Hoàn cọc' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-2 px-3 rounded-xl border border-slate-200 flex items-center gap-2 max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo mã GD, mã đơn, khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent border-none focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100"
              >
                X
              </button>
            )}
          </div>
        </div>

        {/* Date Range Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>Ngày giao dịch:</span>
          </div>
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value, preset: 'CUSTOM' })}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-xs text-slate-400">→</span>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value, preset: 'CUSTOM' })}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="flex items-center gap-1 ml-auto">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'TODAY', label: 'Hôm nay' },
              { key: 'PAST_7_DAYS', label: '7 ngày qua' },
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã giao dịch</th>
                <th className="py-3.5 px-4">Đơn thuê</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Khoản mục</th>
                <th className="py-3.5 px-4">Phương thức</th>
                <th className="py-3.5 px-4 text-right">Số tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Không tìm thấy bản ghi thanh toán nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => (
                  <tr key={p.id + idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">{p.id}</span>
                      {p.transactionCode && p.transactionCode !== '-' && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {p.transactionCode}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">{p.bookingCode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.customerName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          p.type === 'DEPOSIT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : p.type === 'RENTAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : p.type === 'REFUND'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {p.typeLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-bold">{p.method}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      <span className={p.type === 'REFUND' ? 'text-purple-600' : 'text-emerald-600'}>
                        {p.type === 'REFUND' ? '-' : '+'}
                        {formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px]">
                      {formatDateTime(p.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
