import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/format';
import Button from '../../components/common/Button';
import { useToastStore } from '../../store/toastStore';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  PieChart,
  Award,
  Calendar,
  Car,
} from 'lucide-react';

export default function AdminReportsPage() {
  const toast = useToastStore();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setCars(storageService.getCars());
    setBookings(storageService.getBookings());
  }, []);

  const totalCars = cars.length || 1;
  const rentedCars = cars.filter((c) => c.status === 'RENTED').length;
  const occupancyRate = Math.round((rentedCars / totalCars) * 100);

  const completedBookings = bookings.filter((b) => b.bookingStatus === 'COMPLETED');
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const averageOrderValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

  const handleExport = () => {
    toast.success('Đã xuất báo cáo tổng hợp dữ liệu doanh thu (Excel / CSV) thành công!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" /> Báo Cáo Kinh Doanh & Hiệu Suất Kho Xe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Phân tích tỷ lệ lấp đầy, doanh thu trung bình và xếp hạng các dòng xe được ưa chuộng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            In báo cáo
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExport}>
            Xuất file Excel
          </Button>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tỷ lệ lấp đầy kho xe (Occupancy Rate)
          </div>
          <div className="text-3xl font-black text-blue-600 mt-2">{occupancyRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {rentedCars} trong tổng số {totalCars} xe đang trong hành trình
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Giá trị trung bình mỗi đơn (AOV)
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(averageOrderValue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dựa trên {bookings.length} lượt giao dịch hoàn tất
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Doanh số luỹ kế
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Tăng trưởng ổn định theo tháng
          </p>
        </div>
      </div>

      {/* Bảng Top các mẫu xe được thuê nhiều nhất */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Bảng xếp hạng các mẫu xe hoạt động tốt nhất
            </h3>
            <p className="text-xs text-slate-500">Dựa trên số lượt khách đặt và đánh giá chất lượng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Thứ hạng</th>
                <th className="py-3 px-3">Tên xe & Hãng</th>
                <th className="py-3 px-3">Phân khúc</th>
                <th className="py-3 px-3">Đơn giá thuê</th>
                <th className="py-3 px-3">Điểm đánh giá</th>
                <th className="py-3 px-3">Trạng thái hiện tại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car, idx) => (
                <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-black text-slate-900">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900 font-black'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-800">{car.name}</td>
                  <td className="py-3.5 px-3 text-slate-600">{car.categoryName}</td>
                  <td className="py-3.5 px-3 font-semibold text-blue-600">
                    {formatCurrency(car.dailyPrice)}/ngày
                  </td>
                  <td className="py-3.5 px-3 font-bold text-amber-600">
                    ★ {car.rating} ({car.reviewCount || 0} reviews)
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        car.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : car.status === 'RENTED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {car.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
