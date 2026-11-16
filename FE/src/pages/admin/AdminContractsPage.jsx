import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Search,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/format';
import { exportToCsv } from '../../utils/exportExcel';

export function printLegalContract(c) {
  const printWindow = window.open('', '_blank', 'width=850,height=1100');
  if (!printWindow) {
    window.print();
    return;
  }
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hợp đồng thuê xe ${c.contractCode}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #111; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 25px; }
    .header h2 { margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase; }
    .header h3 { margin: 5px 0; font-size: 13pt; font-style: italic; }
    .divider { width: 160px; height: 1.5px; background: #000; margin: 8px auto 20px; }
    .title { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 20px 0 5px; }
    .subtitle { text-align: center; font-size: 11pt; font-style: italic; margin-bottom: 25px; }
    .section-title { font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 5px; }
    .party-box { margin-bottom: 15px; }
    .party-title { font-weight: bold; }
    table.details { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table.details th, table.details td { border: 1px solid #444; padding: 6px 10px; font-size: 12pt; text-align: left; }
    table.details th { background-color: #f2f2f2; font-weight: bold; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; page-break-inside: avoid; }
    .signature-block { width: 45%; }
    .stamp { margin: 20px auto; width: 110px; height: 110px; border: 2px solid #c00; border-radius: 50%; color: #c00; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-10deg); font-size: 9pt; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
  </style>
</head>
<body>
  <div class="header">
    <h2>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
    <h3>Độc lập - Tự do - Hạnh phúc</h3>
    <div class="divider"></div>
  </div>

  <div class="title">HỢP ĐỒNG THUÊ XE Ô TÔ TỰ LÁI</div>
  <div class="subtitle">Số: <strong>${c.contractCode}</strong> • Căn cứ theo Đơn thuê: <strong>${c.bookingCode}</strong></div>

  <p><em>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 của Quốc hội nước CHXHCN Việt Nam;</em></p>
  <p><em>- Căn cứ Luật Giao thông Đường bộ và các văn bản quy phạm pháp luật liên quan;</em></p>
  <p><em>- Căn cứ vào nhu cầu và khả năng thực tế của hai bên;</em></p>

  <p>Hôm nay, hai bên chúng tôi gồm có:</p>

  <div class="party-box">
    <div class="party-title">BÊN CHO THUÊ (BÊN A): CÔNG TY CỔ PHẦN CHO THUÊ XE AUTORENTAL</div>
    <div>- Địa chỉ trụ sở: Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP. HCM</div>
    <div>- Mã số doanh nghiệp: 0318999888 do Sở KH&ĐT TP. Hồ Chí Minh cấp</div>
    <div>- Đại diện theo pháp luật: Ông <strong>Lê Quốc Tuấn</strong> - Chức vụ: Giám đốc Điều hành</div>
    <div>- Hotline hỗ trợ CSKH 24/7: 1900 8899 - Email: support@autorental.vn</div>
  </div>

  <div class="party-box">
    <div class="party-title">BÊN THUÊ XE (BÊN B): ÔNG / BÀ ${(c.customerName || '').toUpperCase()}</div>
    <div>- Số CCCD/Hộ chiếu: <strong>${c.citizenId || 'Chưa cập nhật'}</strong></div>
    <div>- Giấy phép lái xe: <strong>${c.driverLicenseNo || 'B2'}</strong></div>
    <div>- Số điện thoại liên hệ: <strong>${c.customerPhone || ''}</strong></div>
  </div>

  <div class="section-title">ĐIỀU 1: PHƯƠNG TIỆN CHO THUÊ VÀ THỜI HẠN</div>
  <table class="details">
    <tr>
      <th style="width: 30%">Dòng xe cho thuê</th>
      <td><strong>${c.carName}</strong></td>
    </tr>
    <tr>
      <th>Biển số đăng ký</th>
      <td><strong style="font-family: monospace">${c.carLicensePlate}</strong></td>
    </tr>
    <tr>
      <th>Thời hạn thuê</th>
      <td><strong>${c.totalDays} ngày</strong> (Từ <strong>${new Date(c.startDate).toLocaleString('vi-VN')}</strong> đến <strong>${new Date(c.endDate).toLocaleString('vi-VN')}</strong>)</td>
    </tr>
  </table>

  <div class="section-title">ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG, ĐẶT CỌC VÀ THANH TOÁN</div>
  <table class="details">
    <tr>
      <th style="width: 30%">Tổng cước thuê xe</th>
      <td><strong>${Number(c.totalPrice).toLocaleString('vi-VN')} VNĐ</strong></td>
    </tr>
    <tr>
      <th>Tiền cọc bảo đảm (Thế chân)</th>
      <td><strong>${Number(c.depositAmount).toLocaleString('vi-VN')} VNĐ</strong> (Đã xác thực thanh toán ký quỹ)</td>
    </tr>
    <tr>
      <th>Chính sách đối soát hoàn cọc</th>
      <td>Hoàn trả Đợt 1 (3.000.000 VNĐ) ngay khi hoàn tất trả xe; bảo lưu Đợt 2 (2.000.000 VNĐ) trong 15-20 ngày để đối soát dữ liệu phạt nguội CSGT.</td>
    </tr>
  </table>

  <div class="section-title">ĐIỀU 3: TRÁCH NHIỆM VÀ CAM KẾT PHÁP LÝ</div>
  <p>1. Bên B cam kết tự chịu mọi trách nhiệm hành chính và hình sự liên quan đến các lỗi vi phạm Luật Giao thông Đường bộ (bao gồm vi phạm được phát hiện qua hệ thống camera giám sát - Phạt nguội) phát sinh trong suốt thời gian thuê xe.</p>
  <p>2. Bên A bảo đảm phương tiện đủ điều kiện lưu hành theo quy định của pháp luật, có bảo hiểm TNDS bắt buộc và sổ đăng kiểm còn hiệu lực.</p>

  <div class="signatures">
    <div class="signature-block">
      <strong>ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)</strong>
      <div style="font-size: 10pt; font-style: italic;">(Ký điện tử & đóng dấu xác thực)</div>
      <div class="stamp">
        <div>CÔNG TY CP<br>AUTORENTAL<br>★ ĐÃ KÝ SỐ ★</div>
      </div>
      <div><strong>Lê Quốc Tuấn</strong></div>
    </div>
    <div class="signature-block">
      <strong>ĐẠI DIỆN BÊN THUÊ XE (BÊN B)</strong>
      <div style="font-size: 10pt; font-style: italic;">(Ký và ghi rõ họ tên)</div>
      <div style="height: 90px; display: flex; align-items: center; justify-content: center; font-style: italic; color: #15803d; font-weight: bold;">
        ✓ ĐÃ XÁC THỰC KÝ ĐIỆN TỬ
      </div>
      <div><strong>${c.customerName}</strong></div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export default function AdminContractsPage() {
  const [searchParams] = useSearchParams();
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState(searchParams.get('contractCode') || searchParams.get('bookingId') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToastStore();

  const loadContracts = () => {
    const rawContracts = storageService.getContracts();
    const bookings = storageService.getBookings();

    let list = [];
    if (rawContracts && rawContracts.length > 0) {
      list = rawContracts.map((c) => {
        const b = bookings.find((bk) => bk.id === c.bookingId || bk.bookingCode === c.bookingCode);
        return {
          id: c.id,
          bookingId: c.bookingId,
          contractCode: c.contractNumber || c.contractCode || `HD${String(c.id).padStart(5, '0')}`,
          bookingCode: b?.bookingCode || `RENT0000${c.bookingId}`,
          customerName: c.customerName || b?.userName || 'Khách hàng',
          customerPhone: c.phone || b?.userPhone || '0909 123 456',
          citizenId: c.citizenId || '001200001234',
          driverLicenseNo: c.licenseNo || 'B2-99887766',
          carName: c.carName || b?.carName || 'Xe ô tô',
          carLicensePlate: c.licensePlate || b?.carLicensePlate || '51A-999.99',
          signDate: c.signedDate || b?.createdAt || new Date().toISOString(),
          totalPrice: c.totalAmount || b?.totalPrice || 0,
          depositAmount: c.depositAmount || b?.depositAmount || 0,
          totalDays: b?.totalDays || 3,
          startDate: b?.startDate || new Date().toISOString(),
          endDate: b?.endDate || new Date(Date.now() + 86400000 * 3).toISOString(),
          status:
            c.status === 'HOAN_THANH'
              ? 'Hoàn thành'
              : c.status === 'HIEU_LUC' || c.status === 'DA_KY'
              ? 'Đang hiệu lực'
              : c.status === 'KHACH_DA_KY'
              ? 'Khách đã ký'
              : c.status === 'CHO_KY'
              ? 'Chờ ký'
              : c.status === 'NHAP'
              ? 'Bản nháp'
              : c.status === 'HET_HAN'
              ? 'Hết hạn'
              : c.status === 'DA_HUY'
              ? 'Đã hủy'
              : c.status || 'Chờ ký',
          rawStatus: c.status,
        };
      });
    } else {
      list = bookings.map((b) => ({
        id: b.id,
        bookingId: b.id,
        contractCode: `HD${String(b.id + 50).padStart(5, '0')}`,
        bookingCode: b.bookingCode,
        customerName: b.userName || b.customerInfo?.fullName || 'Khách hàng',
        customerPhone: b.userPhone || '0909 123 456',
        citizenId: b.customerInfo?.citizenId || '079201008899',
        driverLicenseNo: b.customerInfo?.driverLicenseNo || 'B2-99887766',
        carName: b.carName,
        carLicensePlate: b.carLicensePlate,
        signDate: b.contractSignedAt || b.createdAt || '2026-09-18T08:30:00',
        totalPrice: b.totalPrice,
        depositAmount: b.depositAmount,
        totalDays: b.totalDays,
        startDate: b.startDate,
        endDate: b.endDate,
        status:
          b.bookingStatus === 'ACTIVE'
            ? 'Đang hiệu lực'
            : b.bookingStatus === 'CONFIRMED'
            ? 'Đã xác nhận'
            : b.bookingStatus === 'DEPOSIT_PAID' || b.bookingStatus === 'PENDING'
            ? 'Chờ ký'
            : b.bookingStatus === 'COMPLETED'
            ? 'Hoàn thành'
            : 'Đã hủy',
        rawStatus: b.bookingStatus,
      }));
    }

    setContracts(list);

    // Auto-select if requested by URL param
    const bParam = searchParams.get('bookingId');
    const cParam = searchParams.get('contractCode');
    if (bParam || cParam) {
      const match = list.find(
        (ct) =>
          String(ct.bookingId) === String(bParam) ||
          ct.bookingCode === bParam ||
          ct.contractCode === cParam
      );
      if (match) {
        setSelectedContract(match);
        setIsModalOpen(true);
      }
    }
  };

  useEffect(() => {
    loadContracts();
  }, [searchParams]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await storageService.syncWithBackend();
      loadContracts();
      toast.success('Đã đồng bộ danh sách hợp đồng mới nhất từ SQL Server!');
    } catch {
      toast.error('Lỗi khi đồng bộ dữ liệu.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleView = (c) => {
    setSelectedContract(c);
    setIsModalOpen(true);
  };

  const handlePrintSelected = () => {
    if (selectedContract) {
      printLegalContract(selectedContract);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { key: '_index', label: 'STT' },
      { key: 'contractCode', label: 'Mã hợp đồng' },
      { key: 'bookingCode', label: 'Mã đơn thuê' },
      { key: 'customerName', label: 'Khách hàng' },
      { key: 'customerPhone', label: 'Số điện thoại' },
      { key: 'citizenId', label: 'Số CCCD' },
      { key: 'carName', label: 'Tên xe thuê' },
      { key: 'carLicensePlate', label: 'Biển số' },
      {
        key: 'signDate',
        label: 'Thời gian lập / Ký',
        formatter: (val) => formatDateTime(val),
      },
      {
        key: 'totalPrice',
        label: 'Giá trị hợp đồng (VNĐ)',
        formatter: (val) => formatCurrency(val),
      },
      {
        key: 'depositAmount',
        label: 'Tiền cọc thế chân (VNĐ)',
        formatter: (val) => formatCurrency(val),
      },
      { key: 'status', label: 'Trạng thái pháp lý' },
    ];

    const todayStr = new Date().toISOString().slice(0, 10);
    exportToCsv({
      filename: `Danh-sach-hop-dong-${todayStr}`,
      columns,
      data: filtered,
    });
  };

  const filtered = contracts.filter((c) => {
    const matchSearch =
      c.contractCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.bookingCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.carName?.toLowerCase().includes(search.toLowerCase()) ||
      String(c.bookingId) === search.trim();

    if (!matchSearch) return false;
    if (statusFilter === 'ACTIVE') return c.status === 'Đang hiệu lực' || c.status === 'Khách đã ký';
    if (statusFilter === 'PENDING') return c.status === 'Chờ ký' || c.status === 'Bản nháp';
    if (statusFilter === 'COMPLETED') return c.status === 'Hoàn thành';
    return true;
  });

  const activeCount = contracts.filter((c) => c.status === 'Đang hiệu lực' || c.status === 'Khách đã ký').length;
  const pendingCount = contracts.filter((c) => c.status === 'Chờ ký' || c.status === 'Bản nháp').length;
  const completedCount = contracts.filter((c) => c.status === 'Hoàn thành').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Quản lý hợp đồng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hợp đồng điện tử cho thuê xe tự lái và điều khoản pháp lý ràng buộc (Đồng bộ trực tiếp với CSDL)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
          >
            Xuất Excel
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
          <Button
            variant="primary"
            size="sm"
            icon={FileText}
            onClick={() => toast.info('Hợp đồng được tạo tự động thông qua quy trình duyệt đơn ở trang Đơn thuê.')}
          >
            + Quy trình tạo HĐ
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng hợp đồng</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{contracts.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Toàn bộ hồ sơ pháp lý</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đang hiệu lực</span>
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đã ký kết & đóng cọc</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ ký xác nhận</span>
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Chờ khách xác nhận</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đã hoàn thành</span>
          </div>
          <div className="mt-1 text-2xl font-black text-blue-600">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đã tất toán & trả cọc</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({contracts.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đang hiệu lực ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Chờ ký ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'COMPLETED' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hoàn thành ({completedCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, mã đơn, tên khách, tên xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã HĐ</th>
                <th className="py-3.5 px-4">Mã đơn thuê</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Tên xe thuê</th>
                <th className="py-3.5 px-4">Ngày ký</th>
                <th className="py-3.5 px-4 text-right">Tổng tiền thuê</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Không tìm thấy hợp đồng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60">
                        {c.contractCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600 font-semibold">{c.bookingCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.customerName}</div>
                      <div className="text-[11px] text-slate-400">{c.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.carName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.carLicensePlate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {formatDateTime(c.signDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600 text-sm">
                      {formatCurrency(c.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                          c.status === 'Đang hiệu lực' || c.status === 'Khách đã ký'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Chờ ký' || c.status === 'Bản nháp'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'Hoàn thành'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem hợp đồng chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printLegalContract(c)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="In bản pháp lý chuẩn A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem Hợp Đồng Chi Tiết */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Hợp đồng điện tử: ${selectedContract?.contractCode}`}
      >
        {selectedContract && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 font-serif">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                <p className="text-xs text-slate-500 italic">Độc lập - Tự do - Hạnh phúc</p>
                <h5 className="font-bold text-base text-blue-900 mt-2 uppercase font-sans">
                  HỢP ĐỒNG CHO THUÊ PHƯƠNG TIỆN Ô TÔ TỰ LÁI
                </h5>
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  Mã HĐ: <strong>{selectedContract.contractCode}</strong> | Mã đơn thuê: <strong>{selectedContract.bookingCode}</strong>
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p><strong>BÊN CHO THUÊ (BÊN A):</strong> CÔNG TY CỔ PHẦN CHO THUÊ XE AUTORENTAL</p>
                  <p className="text-[11px] text-slate-500">MST: 0318999888 • Địa chỉ: Tòa nhà Bitexco, Q1, TP. HCM</p>
                  <p className="text-[11px] text-slate-500">Người đại diện: Lê Quốc Tuấn - Chức vụ: Giám đốc Điều hành</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p><strong>BÊN THUÊ XE (BÊN B):</strong> {selectedContract.customerName}</p>
                  <p className="text-[11px] text-slate-500">CCCD: {selectedContract.citizenId} • SĐT: {selectedContract.customerPhone}</p>
                  <p className="text-[11px] text-slate-500">GPLX: {selectedContract.driverLicenseNo}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <p><strong>THÔNG TIN PHƯƠNG TIỆN & CHI PHÍ:</strong></p>
                  <p>- Xe thuê: <strong>{selectedContract.carName}</strong> (Biển số: <span className="font-mono">{selectedContract.carLicensePlate}</span>)</p>
                  <p>- Thời hạn thuê: <strong>{selectedContract.totalDays} ngày</strong> (Từ {formatDateTime(selectedContract.startDate)} đến {formatDateTime(selectedContract.endDate)})</p>
                  <p>- Giá trị hợp đồng trọn gói: <strong className="text-blue-700 font-bold">{formatCurrency(selectedContract.totalPrice)}</strong></p>
                  <p>- Tiền đặt cọc thế chân: <strong className="text-emerald-700 font-bold">{formatCurrency(selectedContract.depositAmount)}</strong></p>
                  <p>- Trạng thái pháp lý hiện tại: <strong className="text-slate-900">{selectedContract.status}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">Đại diện Bên A</p>
                  <span className="text-[11px] text-emerald-600 font-bold">✓ Đã ký số & đóng dấu điện tử</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Đại diện Bên B</p>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    ✓ {selectedContract.customerName} ({selectedContract.status})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" icon={Printer} onClick={handlePrintSelected}>
                In bản pháp lý (A4)
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
