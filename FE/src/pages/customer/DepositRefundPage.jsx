import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  Banknote,
  CheckCircle2,
  Download,
  Building,
  CreditCard,
  ShieldCheck,
  Star,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

export default function DepositRefundPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form tài khoản nhận hoàn cọc
  const [bankInfo, setBankInfo] = useState({
    bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
    accountNumber: '090912345688',
    beneficiaryName: 'NGUYEN VAN KHACH',
  });

  const loadData = () => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId));
    if (b.userName) {
      setBankInfo((prev) => ({ ...prev, beneficiaryName: b.userName.toUpperCase() }));
    }
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang kiểm tra giao dịch hoàn cọc...</div>;
  }

  const refundAmount = booking.handoverCheckOut?.depositRefundAmount || booking.depositAmount;
  const isRefunded = Boolean(booking.refundReceipt?.status === 'SUCCESS');

  const handleClaimRefund = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      storageService.processDepositRefund(booking.id, bankInfo);
      toast.success(`Hệ thống đã giải tỏa và chuyển khoản thành công ${formatCurrency(refundAmount)} về tài khoản của bạn!`);
      setIsProcessing(false);
      loadData();
    }, 700);
  };

  const handleDownloadReceipt = () => {
    toast.success('Đang tạo và tải về Biên lai giải tỏa cọc điện tử (PDF)...');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Stepper */}
      <JourneyStepper currentStepId={10} bookingId={booking.id} />

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Bước 10 trong hành trình: Hoàn cọc
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
              <Banknote className="w-7 h-7 text-emerald-600" /> Giải Tỏa & Hoàn Trả Tiền Cọc
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Xác nhận số tiền cọc được hoàn trả tự động 100% về tài khoản ngân hàng của khách hàng.
            </p>
          </div>

          <Badge status="REFUNDED" type="payment" />
        </div>
      </div>

      {/* THẺ BIÊN LAI HOÀN TIỀN CỌC */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl text-center space-y-2 shadow-lg shadow-emerald-500/20">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div className="text-xs uppercase tracking-wider text-emerald-100 font-bold">
            Số tiền cọc thực nhận
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono">
            {formatCurrency(refundAmount)}
          </div>
          <p className="text-xs text-emerald-100 max-w-md mx-auto">
            Giao dịch chuyển khoản 24/7 tức thì Napas247 từ AutoRental Inc.
          </p>
        </div>

        {/* Thông tin tài khoản nhận tiền */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" /> Tài khoản ngân hàng nhận hoàn tiền
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Ngân hàng thụ hưởng:</span>
              <strong className="text-slate-900">{bankInfo.bankName}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Số tài khoản:</span>
              <strong className="text-slate-900 font-mono text-sm">{bankInfo.accountNumber}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Chủ tài khoản:</span>
              <strong className="text-slate-900">{bankInfo.beneficiaryName}</strong>
            </div>
          </div>
        </div>

        {/* Chi tiết biên lai nếu đã hoàn tất */}
        {isRefunded ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>MÃ GIAO DỊCH HOÀN CỌC: {booking.refundReceipt.refundCode}</span>
              <span className="text-emerald-700">CHUYỂN KHOẢN THÀNH CÔNG</span>
            </div>
            <p className="text-slate-600">
              Thời gian giải tỏa hoàn tiền: <strong>{formatDateTime(booking.refundReceipt.refundedAt)}</strong>. Bạn vui lòng kiểm tra biến động số dư tài khoản ngân hàng.
            </p>
          </div>
        ) : (
          <form onSubmit={handleClaimRefund} className="space-y-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              className="w-full font-bold shadow-lg"
            >
              Bấm để giải tỏa & nhận tiền cọc ngay
            </Button>
          </form>
        )}

        {/* Nút hành động chuyển tiếp sang Đánh giá */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownloadReceipt}
          >
            Tải biên nhận hoàn cọc PDF
          </Button>

          <Link to={`/review-trip/${booking.id}`}>
            <Button variant="accent" size="lg" icon={Star} className="font-bold shadow-lg shadow-red-600/20">
              Tiếp tục: Đánh giá chất lượng chuyến đi →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
