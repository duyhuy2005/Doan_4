import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Receipt,
  FileCheck2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Printer,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export default function InvoiceSettlementPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId));
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang chuẩn bị bảng kê quyết toán...</div>;
  }

  // Lấy phụ phí từ biên bản nghiệm thu
  const checkOutData = booking.handoverCheckOut || {
    extraMileageCost: 0,
    damagePenalty: 0,
    totalExtraCharge: 0,
    depositRefundAmount: booking.depositAmount,
  };

  const handleConfirmSettlement = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      storageService.confirmInvoiceSettlement(booking.id);
      toast.success('Xác nhận chốt hóa đơn thành công! Hệ thống kích hoạt quy trình giải tỏa hoàn tiền cọc.');
      setIsSubmitting(false);
      // Chuyển tiếp liền mạch sang Bước 10: Hoàn cọc
      navigate(`/refund/${booking.id}`);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Stepper */}
      <JourneyStepper currentStepId={9} bookingId={booking.id} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Bước 9 trong hành trình: Chốt hóa đơn
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-blue-600" /> Bảng Kê Thanh Quyết Toán Chi Phí
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bảng đối soát chi tiết tiền thuê, phụ phí phát sinh và số tiền đặt cọc được giải tỏa hoàn trả.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint} className="print:hidden">
          In bảng kê
        </Button>
      </div>

      {/* VĂN BẢN QUYẾT TOÁN TÀI CHÍNH */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 text-xs sm:text-sm">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <div className="font-bold text-slate-800 text-base">HÓA ĐƠN QUYẾT TOÁN CHUYẾN ĐI</div>
            <div className="text-slate-500 text-xs mt-0.5">
              Mã đơn: <strong className="font-mono text-slate-900">{booking.bookingCode}</strong>
            </div>
            <div className="text-slate-500 text-xs">
              Khách hàng: <strong>{booking.userName}</strong> ({booking.userPhone})
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-xs">Phương tiện:</div>
            <div className="font-bold text-slate-900">{booking.carName}</div>
            <div className="text-xs font-mono text-slate-500">{booking.carLicensePlate}</div>
          </div>
        </div>

        {/* Bảng chi tiết chi phí */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Khoản mục chi phí</th>
                <th className="py-2.5 px-3">Chi tiết tính toán</th>
                <th className="py-2.5 px-3 text-right">Thành tiền (VND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">1. Tiền thuê xe ô tô gốc</td>
                <td className="py-3 px-3 text-slate-600">
                  {booking.totalDays} ngày x {formatCurrency(car.dailyPrice)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                  {formatCurrency(booking.carRentalFee)}
                </td>
              </tr>

              {booking.selectedServices && booking.selectedServices.length > 0 && (
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-800">2. Dịch vụ bổ sung đã dùng</td>
                  <td className="py-3 px-3 text-slate-600">
                    {booking.selectedServices.map((s) => s.name).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    +{formatCurrency(booking.serviceFee)}
                  </td>
                </tr>
              )}

              {booking.discountAmount > 0 && (
                <tr className="text-emerald-700">
                  <td className="py-3 px-3 font-semibold">3. Giảm trừ Voucher ưu đãi</td>
                  <td className="py-3 px-3">Mã ưu đãi: {booking.promotionCode}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    -{formatCurrency(booking.discountAmount)}
                  </td>
                </tr>
              )}

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">4. Phụ phí vượt định mức km</td>
                <td className="py-3 px-3 text-slate-600">
                  {checkOutData.extraMileageCount || 0} km vượt x {formatCurrency(car.extraMileageCharge || 5000)}/km
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                  +{formatCurrency(checkOutData.extraMileageCost || 0)}
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">5. Phụ phí hư tổn / vi phạm</td>
                <td className="py-3 px-3 text-slate-600">Theo biên bản nghiệm thu xe</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                  +{formatCurrency(checkOutData.damagePenalty || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Hộp đối trừ tiền cọc & số tiền hoàn lại */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>Tiền cọc khách hàng đã thanh toán trước:</span>
            <span className="font-mono font-bold text-white text-sm">{formatCurrency(booking.depositAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>Khấu trừ các phụ phí phát sinh:</span>
            <span className="font-mono font-bold text-rose-400">-{formatCurrency(checkOutData.totalExtraCharge || 0)}</span>
          </div>

          <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
            <span className="text-sm sm:text-base font-bold text-emerald-400">
              SỐ TIỀN CỌC THỰC TẾ HOÀN TRẢ CHO BẠN:
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(checkOutData.depositRefundAmount)}
            </span>
          </div>
        </div>

        {/* Form xác nhận chốt hóa đơn */}
        <form onSubmit={handleConfirmSettlement} className="flex justify-between items-center pt-2">
          <Link to={`/return/${booking.id}`} className="text-xs text-slate-500 hover:text-slate-800">
            ← Quay lại bước Trả xe
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={CheckCircle2}
            className="font-bold shadow-lg"
          >
            Tiếp tục: Xác nhận chốt hóa đơn & Nhận hoàn cọc →
          </Button>
        </form>
      </div>
    </div>
  );
}
