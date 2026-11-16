import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import JourneyStepper from '../../components/common/JourneyStepper';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Car,
  PenTool,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export default function ContractPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToastStore();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [signerName, setSignerName] = useState(user?.fullName || '');
  const [citizenId, setCitizenId] = useState('079098123456');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const b = storageService.getBookingById(bookingId);
    if (!b) {
      toast.error('Không tìm thấy thông tin đơn hợp đồng.');
      navigate('/my-bookings');
      return;
    }
    setBooking(b);
    setCar(storageService.getCarById(b.carId));
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const handleSignContract = (e) => {
    e.preventDefault();
    if (!hasAgreed) {
      toast.warning('Vui lòng tích chọn đồng ý với toàn bộ điều khoản hợp đồng.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      storageService.signContract(booking.id, {
        signerName,
        citizenId,
        signatureBase64: 'DIGITAL_SIGNATURE_VERIFIED',
      });
      toast.success('Ký kết hợp đồng điện tử thành công! Chuyển sang bước Bàn giao & Nhận xe.');
      setIsSubmitting(false);
      navigate(`/pickup/${booking.id}`);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!booking || !car) {
    return <div className="p-16 text-center text-slate-500">Đang chuẩn bị văn bản hợp đồng...</div>;
  }

  const isSigned = Boolean(booking.contract?.signedAt);
  const contractCode = booking.contract?.contractCode || `HD-${booking.bookingCode.replace('BK-', '')}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 11-Step Journey Stepper */}
      <div className="print:hidden">
        <JourneyStepper currentStepId={5} bookingId={booking.id} />
      </div>

      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link to={`/tracking/${booking.id}`}>
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Theo dõi đơn
            </Button>
          </Link>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Hợp đồng điện tử xác thực số
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            In hợp đồng
          </Button>
        </div>
      </div>

      {/* VĂN BẢN HỢP ĐỒNG CHÍNH THỨC */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-xl space-y-8 text-slate-800 leading-relaxed font-serif text-xs sm:text-sm print:border-none print:shadow-none print:p-0">
        {/* Quốc hiệu tiêu ngữ */}
        <div className="text-center space-y-1 border-b-2 border-slate-900 pb-6">
          <div className="font-bold tracking-widest text-sm uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="italic text-xs font-semibold">Độc lập - Tự do - Hạnh phúc</div>
          <div className="text-xs tracking-widest">---o0o---</div>
          <h1 className="text-xl sm:text-2xl font-black font-sans uppercase tracking-tight text-slate-900 pt-3">
            HỢP ĐỒNG THUÊ XE Ô TÔ TỰ LÁI ĐIỆN TỬ
          </h1>
          <div className="text-xs text-slate-500 font-sans">
            Mã số hợp đồng: <strong className="text-slate-900 font-mono">{contractCode}</strong> • Ngày lập:{' '}
            {formatDate(booking.createdAt)}
          </div>
        </div>

        {/* Căn cứ pháp lý */}
        <div className="italic text-slate-600 space-y-1 text-xs">
          <p>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 của Quốc hội nước CHXHCN Việt Nam;</p>
          <p>- Căn cứ Luật Giao thông đường bộ và các quy định hiện hành liên quan;</p>
          <p>- Căn cứ vào nhu cầu và sự thỏa thuận tự nguyện của hai bên tham gia hợp đồng.</p>
        </div>

        {/* Thông tin 2 bên */}
        <div className="space-y-4 font-sans text-xs sm:text-sm">
          {/* BÊN A */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <h3 className="font-bold text-slate-900 uppercase">BÊN CHO THUÊ XE (BÊN A): CÔNG TY CỔ PHẦN AUTORENTAL</h3>
            <div>- Mã số thuế: <strong>0318999888</strong> do Sở KH&ĐT TP.HCM cấp</div>
            <div>- Địa chỉ trụ sở: Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</div>
            <div>- Đại diện theo pháp luật: Ông <strong>Lê Hoàng Long</strong> - Chức vụ: Giám đốc Điều hành</div>
            <div>- Tổng đài hỗ trợ 24/7: <strong>1900 8899</strong></div>
          </div>

          {/* BÊN B */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <h3 className="font-bold text-slate-900 uppercase">BÊN THUÊ XE (BÊN B): ÔNG / BÀ {booking.userName.toUpperCase()}</h3>
            <div>- Họ và tên: <strong>{booking.userName}</strong></div>
            <div>- Số CCCD / Hộ chiếu: <strong>{citizenId}</strong></div>
            <div>- Số điện thoại liên hệ: <strong>{booking.userPhone}</strong></div>
            <div>- Email: <strong>{booking.userEmail}</strong></div>
            <div>- Giấy phép lái xe hạng B2 trở lên số: <strong>B2-790123849</strong></div>
          </div>
        </div>

        {/* Điều khoản hợp đồng */}
        <div className="space-y-4 text-justify">
          <div>
            <h3 className="font-bold text-slate-900 font-sans uppercase">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG VÀ PHƯƠNG TIỆN CHO THUÊ</h3>
            <p className="mt-1">
              Bên A đồng ý cho Bên B thuê một (01) xe ô tô tự lái có các thông số kỹ thuật như sau:
            </p>
            <div className="my-2 p-3 bg-slate-100 rounded-xl font-sans text-xs space-y-1">
              <div>- Tên dòng xe: <strong>{car.name}</strong> ({car.categoryName})</div>
              <div>- Biển số xe đăng ký: <strong>{car.licensePlate}</strong></div>
              <div>- Số chỗ ngồi: <strong>{car.seats} chỗ</strong> | Hộp số: <strong>{car.transmission}</strong></div>
              <div>- Định mức di chuyển quy định: <strong>{car.mileageLimitPerDay || 300} km / ngày</strong></div>
              <div>- Phụ thu vượt định mức: <strong>{formatCurrency(car.extraMileageCharge || 5000)} / km</strong></div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 font-sans uppercase">ĐIỀU 2: THỜI GIAN VÀ ĐỊA ĐIỂM GIAO NHẬN XE</h3>
            <p className="mt-1">
              - Thời gian bắt đầu bàn giao xe: <strong>{formatDateTime(booking.startDate)}</strong>
            </p>
            <p>
              - Thời gian Bên B hoàn trả xe: <strong>{formatDateTime(booking.endDate)}</strong> (Tổng thời gian thuê:{' '}
              <strong>{booking.totalDays} ngày</strong>).
            </p>
            <p>- Địa điểm bàn giao và hoàn trả: <strong>{booking.pickupLocation}</strong>.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 font-sans uppercase">ĐIỀU 3: GIÁ THUÊ XE, TIỀN ĐẶT CỌC VÀ THANH TOÁN</h3>
            <div className="my-2 p-3 bg-slate-100 rounded-xl font-sans text-xs space-y-1">
              <div>- Tổng chi phí thuê xe trọn gói: <strong>{formatCurrency(booking.totalPrice)}</strong></div>
              <div>- Tiền đặt cọc bảo đảm thực hiện hợp đồng: <strong>{formatCurrency(booking.depositAmount)}</strong></div>
              <div>- Tình trạng thanh toán cọc: <strong className="text-emerald-700">ĐÃ THANH TOÁN ĐỦ</strong></div>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              * Khoản tiền cọc sẽ được Bên A giải tỏa hoàn trả 100% cho Bên B trong vòng 24 giờ sau khi nghiệm thu trả xe nếu xe không phát sinh hư hại do lỗi người lái và không vi phạm định mức km.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 font-sans uppercase">ĐIỀU 4: TRÁCH NHIỆM VÀ NGHĨA VỤ PHÁP LÝ</h3>
            <p className="mt-1">
              1. Bên B cam kết điều khiển xe tuân thủ tuyệt đối Luật Giao thông đường bộ Việt Nam. Không chở chất cấm, không sử dụng rượu bia chất kích thích khi lái xe, không chuyển nhượng hoặc cho người thứ ba thuê lại xe.
            </p>
            <p className="mt-1">
              2. Bên B chịu hoàn toàn trách nhiệm đối với các biên bản vi phạm giao thông ghi nhận qua hình ảnh (Phạt nguội) phát sinh trong suốt thời gian thuê xe được ghi nhận trong hợp đồng này.
            </p>
          </div>
        </div>

        {/* Chữ ký số 2 bên */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center font-sans">
          <div>
            <div className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)</div>
            <div className="text-xs text-slate-500 italic mt-0.5">(Đã ký điện tử và đóng dấu xác thực)</div>
            <div className="h-28 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center p-2 transform -rotate-12 select-none">
                <span className="text-[9px] font-bold uppercase text-center leading-tight">CÔNG TY CP AUTORENTAL</span>
                <span className="text-[8px] font-black mt-1">ĐÃ XÁC THỰC</span>
              </div>
            </div>
            <div className="font-bold text-slate-900">Lê Hoàng Long</div>
          </div>

          <div>
            <div className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN THUÊ XE (BÊN B)</div>
            <div className="text-xs text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</div>
            <div className="h-28 flex flex-col items-center justify-center">
              {isSigned ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-800 text-xs">
                  <div className="font-black text-sm italic">{booking.contract?.signerName}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Đã ký lúc: {formatDateTime(booking.contract?.signedAt)}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa ký số</span>
              )}
            </div>
            <div className="font-bold text-slate-900">{booking.userName}</div>
          </div>
        </div>
      </div>

      {/* FORM KÝ HỢP ĐỒNG TRỰC TUYẾN DÀNH CHO KHÁCH (NẾU CHƯA KÝ) */}
      {!isSigned ? (
        <form onSubmit={handleSignContract} className="bg-white rounded-3xl p-6 border-2 border-blue-600 shadow-xl space-y-4 print:hidden">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
            <PenTool className="w-5 h-5 text-blue-600" /> Ký kết hợp đồng điện tử trực tuyến
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên người ký xác nhận *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD / Định danh VNeID *
              </label>
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Tôi xác nhận đã đọc kỹ, hiểu rõ và đồng ý với tất cả các điều khoản, quyền lợi và nghĩa vụ quy định trong hợp đồng thuê xe điện tử số <strong>{contractCode}</strong>.
            </span>
          </label>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={CheckCircle2}
              className="w-full sm:w-auto font-bold shadow-lg"
            >
              Ký hợp đồng trực tuyến ngay
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Hợp đồng điện tử đã được hai bên xác lập thành công với giá trị pháp lý đầy đủ.</span>
          </div>
          <Link to={`/pickup/${booking.id}`}>
            <Button variant="accent" size="md" className="font-bold shadow-md shadow-red-600/20 whitespace-nowrap">
              Tiếp tục: Bàn giao & Nhận xe →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
