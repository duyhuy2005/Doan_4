import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  CreditCard,
  QrCode,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  FileText,
  Building,
  Download,
  Zap,
} from 'lucide-react';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('VIETQR'); // 'VIETQR' | 'VNPAY'
  const [countdown, setCountdown] = useState(1800); // 30 phút = 1800 giây
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  // VNPAY Mock card input
  const [vnpayForm, setVnpayForm] = useState({
    bank: 'NCB',
    cardNumber: '9704198526191432',
    cardHolder: 'NGUYEN VAN KHACH',
    issueDate: '07/24',
    otp: '123456',
  });

  useEffect(() => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn thuê xe.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId));
  }, [bookingId, navigate]);

  // Đồng hồ đếm ngược 30 phút giữ chỗ xe
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCompletePayment = async (method) => {
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      storageService.processDepositPayment(booking.id, {
        method,
        bankName: method === 'VIETQR' ? 'MB Bank - Napas 24/7' : 'VNPAY - Ngân hàng Quốc Dân NCB',
      });
      toast.success('Thanh toán tiền cọc thành công! Hợp đồng chính thức có hiệu lực.');
      navigate(`/contract/${booking.id}`);
    } catch (err) {
      toast.error(err.message || 'Thanh toán thất bại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSimulatingWebhook(true);
    toast.info('Đang kết nối cổng Webhook Napas 24/7...');
    await new Promise((r) => setTimeout(r, 1500));
    try {
      storageService.processDepositPayment(booking.id, {
        method: 'VIETQR',
        bankName: 'MB Bank - VietQR Napas 24/7 (IPN Webhook Auto)',
      });
      toast.success('Webhook Napas 24/7: Đã nhận được 5.000.000đ tiền cọc! Hệ thống tự động xác nhận đơn.');
      navigate(`/contract/${booking.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang tải thông tin thanh toán...</div>;
  }

  // Cú pháp chuyển khoản tự động
  const transferSyntax = `AUTORENTAL ${booking.bookingCode}`;
  const bankAccount = '090912345688';
  const bankCode = 'MB';
  const bankName = 'MB Bank (Ngân hàng Quân Đội)';
  const accountHolder = 'CONG TY CP THUE XE AUTORENTAL';
  const depositAmount = booking.depositAmount || 5000000;

  // Link VietQR chuẩn quốc tế Napas 24/7
  const vietQrImageUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(
    transferSyntax
  )}&accountName=${encodeURIComponent(accountHolder)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Stepper */}
      <JourneyStepper currentStepId={4} bookingId={booking.id} />

      {/* Header & Đồng hồ đếm ngược */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/60 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Cổng Thanh Toán Trực Tuyến Tự Động 24/7
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2">
            Thanh Toán Đặt Cọc: {formatCurrency(depositAmount)}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Đơn thuê: <strong className="font-mono text-white">{booking.bookingCode}</strong> • Xe: <strong className="text-white">{booking.carName}</strong>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center sm:text-right shrink-0">
          <div className="text-[11px] text-slate-300 flex items-center gap-1 justify-center sm:justify-end">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Thời gian giữ xe còn lại
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
            {formatTimer(countdown)}
          </div>
        </div>
      </div>

      {/* Tabs chọn hình thức thanh toán */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setPaymentMethod('VIETQR')}
          className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            paymentMethod === 'VIETQR'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>1. Quét mã VietQR Napas 24/7 (Khuyên dùng)</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('VNPAY')}
          className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            paymentMethod === 'VNPAY'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Thẻ ATM / Visa qua VNPAY Gateway</span>
        </button>
      </div>

      {/* NỘI DUNG 1: VIETQR */}
      {paymentMethod === 'VIETQR' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Cột trái: Mã QR Code Napas 24/7 */}
          <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 max-w-xs">
              <img
                src={vietQrImageUrl}
                alt="Mã QR Napas 24/7 MB Bank"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-xs text-slate-500 mt-3 font-medium">
              Quét bằng bất kỳ App ngân hàng nào (Vietcombank, MB, Techcombank, VPBank, MoMo, ZaloPay...)
            </div>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={vietQrImageUrl}
                target="_blank"
                rel="noreferrer"
                download={`VietQR-${booking.bookingCode}.png`}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Tải ảnh QR về máy</span>
              </a>
            </div>
          </div>

          {/* Cột phải: Thông tin tài khoản thụ hưởng & Cú pháp */}
          <div className="space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Thông tin tài khoản nhận tiền đặt cọc
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Ngân hàng thụ hưởng:</span>
                  <strong className="text-slate-800 text-sm">{bankName}</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Số tài khoản:</span>
                  <strong className="text-slate-900 font-mono text-base">{bankAccount}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankAccount, 'Số tài khoản')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Chép</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Tên chủ tài khoản:</span>
                  <strong className="text-slate-800">{accountHolder}</strong>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-blue-600 font-semibold block">Số tiền cọc chính xác:</span>
                  <strong className="text-blue-900 font-black text-base">{formatCurrency(depositAmount)}</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-amber-800 font-semibold block">Nội dung chuyển khoản (Bắt buộc giữ nguyên):</span>
                  <strong className="text-amber-900 font-mono text-sm">{transferSyntax}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(transferSyntax, 'Nội dung chuyển khoản')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'Nội dung chuyển khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Chép</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="accent"
                size="lg"
                className="w-full font-bold shadow-lg shadow-red-600/30"
                isLoading={isProcessing}
                onClick={() => handleCompletePayment('VIETQR')}
              >
                Tôi đã chuyển khoản thành công
              </Button>

              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isSimulatingWebhook}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isSimulatingWebhook ? 'Đang nhận IPN Webhook...' : 'Mô phỏng VietQR Webhook (Xác nhận tự động tức thì)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NỘI DUNG 2: CỔNG VNPAY SIMULATOR */}
      {paymentMethod === 'VNPAY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">Cổng thanh toán điện tử VNPAY Sandbox</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Bảo mật SSL 256-bit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngân hàng phát hành</label>
              <select
                value={vnpayForm.bank}
                onChange={(e) => setVnpayForm({ ...vnpayForm, bank: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="NCB">NCB - Ngân hàng Quốc Dân</option>
                <option value="VIETCOMBANK">Vietcombank</option>
                <option value="MBBANK">MB Bank</option>
                <option value="TECHCOMBANK">Techcombank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số thẻ ATM / Visa</label>
              <input
                type="text"
                value={vnpayForm.cardNumber}
                onChange={(e) => setVnpayForm({ ...vnpayForm, cardNumber: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chủ thẻ (Không dấu)</label>
              <input
                type="text"
                value={vnpayForm.cardHolder}
                onChange={(e) => setVnpayForm({ ...vnpayForm, cardHolder: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã xác thực OTP (Demo: 123456)</label>
              <input
                type="text"
                value={vnpayForm.otp}
                onChange={(e) => setVnpayForm({ ...vnpayForm, otp: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Tổng trừ tiền: <strong className="text-slate-900">{formatCurrency(depositAmount)}</strong>
            </span>
            <Button
              variant="blue"
              size="lg"
              isLoading={isProcessing}
              onClick={() => handleCompletePayment('VNPAY')}
            >
              Xác thực thanh toán VNPAY
            </Button>
          </div>
        </div>
      )}

      {/* Cam kết hoàn tiền cọc & Đối soát 2 đợt */}
      <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block text-emerald-950">Chính sách bảo toàn tiền cọc & Đối soát 2 đợt an tâm 100%:</strong>
            <p className="mt-1 leading-relaxed">
              • <strong>Đợt 1 (3.000.000đ):</strong> Hoàn trả tức thì vào tài khoản ngân hàng của bạn ngay khi biên bản bàn giao trả xe được hai bên ký duyệt.
            </p>
            <p className="leading-relaxed">
              • <strong>Đợt 2 (2.000.000đ):</strong> Tạm giữ 15–20 ngày để đối soát dữ liệu vi phạm giao thông phạt nguội từ Cục CSGT. Nếu không có vi phạm, số tiền còn lại sẽ được hoàn trả tự động 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
