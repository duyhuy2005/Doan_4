import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  History,
  Car,
  Award,
  TrendingUp,
  FileText,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function RentalHistoryPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [completedBookings, setCompletedBookings] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalSpent: 0,
    totalDiscount: 0,
    loyaltyTier: 'Thành Viên Vàng',
  });

  useEffect(() => {
    const list = storageService.getBookings({ userId: user?.id || 3 });
    const completed = list.filter((b) => b.bookingStatus === 'COMPLETED');
    setCompletedBookings(completed);

    const totalKm = completed.reduce((sum, b) => {
      const driven = b.handoverCheckOut?.actualDrivenKm || b.totalDays * 150;
      return sum + driven;
    }, 0);

    const totalSpent = completed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalDiscount = completed.reduce((sum, b) => sum + (b.discountAmount || 0), 0);

    setStats({
      totalTrips: completed.length,
      totalKm,
      totalSpent,
      totalDiscount,
      loyaltyTier: completed.length >= 3 ? 'Thành Viên Kim Cương' : 'Thành Viên Vàng',
    });
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
          <History className="w-7 h-7 text-blue-600" /> Lịch Sử Thuê Xe & Thống Kê Hành Trình
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hồ sơ ghi nhận những chặng đường bạn đã trải nghiệm cùng nền tảng AutoRental.
        </p>
      </div>

      {/* Loyalty & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-3xl shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Hạng thành viên
            </span>
            <Award className="w-6 h-6 text-amber-200" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">{stats.loyaltyTier}</div>
          <p className="text-[11px] text-amber-100 mt-1">Được ưu tiên chọn xe đời mới & miễn 50% tiền cọc</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Số chuyến đi hoàn tất
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalTrips} chuyến</div>
          <p className="text-xs text-slate-400 mt-1">100% đánh giá 5 sao hài lòng</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quãng đường đã đồng hành
          </div>
          <div className="text-3xl font-black text-blue-600 mt-2 font-mono">
            {stats.totalKm.toLocaleString()} km
          </div>
          <p className="text-xs text-slate-400 mt-1">Ghi nhận qua chỉ số công tơ mét ODO</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tiết kiệm từ Voucher
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(stats.totalDiscount)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Từ các mã ưu đãi độc quyền AutoRental</p>
        </div>
      </div>

      {/* Bảng danh sách các chuyến xe đã hoàn thành */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Chi tiết các chuyến xe đã hoàn thành</h3>
          <Link to="/cars">
            <Button variant="primary" size="sm">
              Thuê chuyến tiếp theo
            </Button>
          </Link>
        </div>

        {completedBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Mã đơn & Xe</th>
                  <th className="py-3 px-4">Thời gian thuê</th>
                  <th className="py-3 px-4">Quãng đường ODO</th>
                  <th className="py-3 px-4">Tổng chi phí</th>
                  <th className="py-3 px-4">Đánh giá</th>
                  <th className="py-3 px-4 text-right">Biên nhận & Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img
                        src={b.carThumbnail}
                        alt={b.carName}
                        className="w-16 h-11 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{b.carName}</div>
                        <div className="text-xs font-mono text-slate-400">{b.bookingCode}</div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600">
                      <div>Từ: {formatDateTime(b.startDate)}</div>
                      <div>Đến: {formatDateTime(b.endDate)} ({b.totalDays} ngày)</div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-700">
                      {b.handoverCheckOut?.actualDrivenKm || b.totalDays * 150} km
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-blue-600">{formatCurrency(b.totalPrice)}</div>
                      <div className="text-[11px] text-slate-400">Đã hoàn trả 100% cọc</div>
                    </td>

                    <td className="py-4 px-4">
                      {b.review ? (
                        <div className="text-amber-500 font-bold text-xs flex items-center gap-1">
                          ★ {b.review.rating} sao
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Chưa đánh giá</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right space-x-2">
                      <Link to={`/contract/${b.id}`}>
                        <Button variant="outline" size="sm" icon={FileText}>
                          Hợp đồng
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={RotateCcw}
                        onClick={() => navigate(`/checkout?carId=${b.carId}`)}
                      >
                        Thuê lại
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            Bạn chưa có chuyến đi nào hoàn thành trong lịch sử.
          </div>
        )}
      </div>
    </div>
  );
}
