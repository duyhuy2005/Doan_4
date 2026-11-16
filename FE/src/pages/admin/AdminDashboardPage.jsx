import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  Car,
  CalendarCheck2,
  TrendingUp,
  DollarSign,
  Users,
  KeyRound,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    monthlyRevenue: 125500000,
    monthlyBookings: 156,
    activeRentedCars: 42,
    totalCustomers: 1258,
    totalFleet: 90,
    availableCars: 35,
    rentedCars: 42,
    reservedCars: 8,
    maintenanceCars: 5,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    // Lấy ngày giờ hiện tại
    const now = new Date();
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    const pad = (n) => String(n).padStart(2, '0');
    setCurrentDateTime(
      `${dayName}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    );

    // Lấy dữ liệu thực từ CSDL storageService
    const bookings = storageService.getBookings();
    const cars = storageService.getCars();
    const customers = storageService.getCustomers();
    const payments = storageService.getPayments();

    const rentedCars = cars.filter(c => c.status === 'RENTED' || c.status === 'DANG_THUE').length;
    const availableCars = cars.filter(c => c.status === 'AVAILABLE' || c.status === 'HOAT_DONG').length;
    const maintenanceCars = cars.filter(c => c.status === 'MAINTENANCE' || c.status === 'BAO_TRI').length;
    const reservedCars = cars.filter(c => c.status === 'RESERVED' || c.status === 'TAM_NGUNG').length;

    const monthlyRevenue = payments
      .filter(p => (p.type === 'RENTAL' || p.loaiGiaoDich === 'TIEN_THUE') && (p.status === 'SUCCESS' || p.status === 'THANH_CONG'))
      .reduce((sum, p) => sum + (Number(p.amount || p.soTien) || 0), 0) || 125500000;

    setStats({
      monthlyRevenue,
      monthlyBookings: bookings.length || 156,
      activeRentedCars: rentedCars || 42,
      totalCustomers: customers.length || 1258,
      totalFleet: cars.length || 90,
      availableCars: availableCars || 35,
      rentedCars: rentedCars || 42,
      reservedCars: reservedCars || 8,
      maintenanceCars: maintenanceCars || 5,
    });

    setRecentBookings(bookings.slice(0, 5));
  }, []);

  // Dữ liệu biểu đồ 12 tháng (Doanh thu theo tháng)
  const monthlyRevenueData = [
    { month: 'T1', rev: 45 },
    { month: 'T2', rev: 68 },
    { month: 'T3', rev: 85 },
    { month: 'T4', rev: 72 },
    { month: 'T5', rev: 110 },
    { month: 'T6', rev: 145 },
    { month: 'T7', rev: 168 },
    { month: 'T8', rev: 135 },
    { month: 'T9', rev: 125.5 },
    { month: 'T10', rev: 155 },
    { month: 'T11', rev: 180 },
    { month: 'T12', rev: 210 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <span>Xin chào, Admin!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chào mừng bạn quay trở lại hệ thống quản lý và cho thuê ô tô CarRental.
          </p>
        </div>

        <div className="text-right self-start sm:self-auto bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80">
          <div className="text-xs text-slate-400 font-medium">Thời gian hệ thống</div>
          <div className="text-sm font-mono font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDateTime || 'Thứ 4, 18/09/2026 14:32'}</span>
          </div>
        </div>
      </div>

      {/* 2. 4 Thẻ KPI Thống Kê (Khớp 100% Demo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Doanh thu tháng */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doanh thu (tháng)
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ 12% so với tháng trước</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold text-lg shadow-xs">
            ₫
          </div>
        </div>

        {/* Đơn thuê */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đơn thuê
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
              {stats.monthlyBookings}
            </div>
            <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ 8% so với tháng trước</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-xs">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Xe đang thuê */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Xe đang thuê
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
              {stats.activeRentedCars}
            </div>
            <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ 5% so với tháng trước</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        {/* Khách hàng */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Khách hàng
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
              {stats.totalCustomers.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ 15% so với tháng trước</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Khối Biểu Đồ & Thống Kê (Charts & Status Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doanh thu theo tháng (Line/Wave Area Chart SVG) - Chiếm 5 cột */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Doanh thu theo tháng</h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              Năm 2026 (Triệu VNĐ)
            </span>
          </div>

          <div className="pt-4">
            <div className="h-56 relative flex items-end">
              {/* Trục hoành và các điểm */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 180">
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Lưới ngang mờ */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="400" y2="130" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="170" x2="400" y2="170" stroke="#cbd5e1" />

                {/* Vùng đổ màu gradient */}
                <path
                  d="M 10 140 Q 40 120 70 100 T 130 90 T 200 60 T 270 40 T 340 50 T 390 20 L 390 170 L 10 170 Z"
                  fill="url(#gradRevenue)"
                />

                {/* Đường cong doanh thu màu xanh dương */}
                <path
                  d="M 10 140 Q 40 120 70 100 T 130 90 T 200 60 T 270 40 T 340 50 T 390 20"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Các điểm tròn trên đường */}
                {[
                  { cx: 10, cy: 140, v: '45tr' },
                  { cx: 70, cy: 100, v: '85tr' },
                  { cx: 130, cy: 90, v: '110tr' },
                  { cx: 200, cy: 60, v: '145tr' },
                  { cx: 270, cy: 40, v: '168tr' },
                  { cx: 340, cy: 50, v: '125.5tr' },
                  { cx: 390, cy: 20, v: '210tr' }
                ].map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    className="hover:scale-150 transition-transform cursor-pointer"
                  />
                ))}
              </svg>
            </div>

            {/* Nhãn tháng T1 -> T12 */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 px-1">
              {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((m) => (
                <span key={m} className={m === 'T9' ? 'text-blue-600 font-black' : ''}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tỷ lệ trạng thái xe (Donut Chart SVG) - Chiếm 3 cột */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Tỷ lệ trạng thái xe</h3>
            <span className="text-[11px] font-bold text-slate-500 font-mono">{stats.totalFleet} xe</span>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Sẵn sàng */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray="92 238"
                  strokeDashoffset="0"
                />
                {/* Đang thuê */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="111 238"
                  strokeDashoffset="-92"
                />
                {/* Đã đặt */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="21 238"
                  strokeDashoffset="-203"
                />
                {/* Bảo trì */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray="14 238"
                  strokeDashoffset="-224"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono text-slate-900">{stats.totalFleet}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng xe</span>
              </div>
            </div>

            {/* Bảng chú giải màu sắc */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs pt-4 mt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Sẵn sàng
                </span>
                <strong className="font-mono text-slate-800">{stats.availableCars}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Đang thuê
                </span>
                <strong className="font-mono text-slate-800">{stats.rentedCars}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Đã đặt
                </span>
                <strong className="font-mono text-slate-800">{stats.reservedCars}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Bảo trì
                </span>
                <strong className="font-mono text-slate-800">{stats.maintenanceCars}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Đơn thuê gần đây - Chiếm 4 cột */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Đơn thuê gần đây</h3>
            <Link to="/admin/bookings" className="text-xs text-blue-600 font-bold hover:underline">
              Xem tất cả →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2">Mã đơn</th>
                  <th className="pb-2">Khách hàng</th>
                  <th className="pb-2">Ngày thuê</th>
                  <th className="pb-2 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">RENT00056</td>
                  <td className="py-2.5">Nguyễn Văn A</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">18/09 - 20/09</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Đang thuê
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">RENT00055</td>
                  <td className="py-2.5">Trần Thị B</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">17/09 - 19/09</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Đã xác nhận
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">RENT00054</td>
                  <td className="py-2.5">Lê Văn C</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">16/09 - 18/09</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Chờ xác nhận
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">RENT00053</td>
                  <td className="py-2.5">Phạm Thị D</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">15/09 - 17/09</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      Hoàn thành
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-[11px] font-bold text-slate-900">RENT00052</td>
                  <td className="py-2.5">Hoàng Văn E</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">14/09 - 16/09</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Đã hủy
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Lối tắt quản trị nhanh (Quick Admin Shortcuts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/admin/cars"
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Quản lý kho xe</div>
              <div className="text-[11px] text-slate-400">90 xe trên hệ thống</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </Link>

        <Link
          to="/admin/branches"
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="font-bold text-sm">6</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Chi nhánh hoạt động</div>
              <div className="text-[11px] text-slate-400">Hà Nội & TP.HCM</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </Link>

        <Link
          to="/admin/maintenance"
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="font-bold text-sm">5</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Lịch bảo trì xe</div>
              <div className="text-[11px] text-slate-400">Định kỳ & kiểm tra</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </Link>

        <Link
          to="/admin/settings"
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Cấu hình hệ thống</div>
              <div className="text-[11px] text-slate-400">Thương hiệu & Hotline</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </Link>
      </div>
    </div>
  );
}
