import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Car,
  Filter,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { exportToCsv } from '../../utils/exportExcel';

export default function AdminMaintenancePage() {
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    carId: '',
    carName: '',
    licensePlate: '',
    type: 'Bảo dưỡng định kỳ',
    startDate: '',
    endDate: '',
    cost: 1500000,
    status: 'IN_PROGRESS',
    technician: 'Vũ Văn Nam',
    notes: '',
  });

  const toast = useToastStore();

  const loadData = () => {
    const list = storageService.getMaintenance();
    setRecords(list);
    const carList = storageService.getCars();
    setCars(carList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const today = new Date().toISOString().slice(0, 10);
    const nextThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const defaultCar = cars[0] || {};

    setFormData({
      carId: defaultCar.id || '',
      carName: defaultCar.name || '',
      licensePlate: defaultCar.licensePlate || '',
      type: 'Bảo dưỡng định kỳ',
      startDate: today,
      endDate: nextThreeDays,
      cost: 1500000,
      status: 'IN_PROGRESS',
      technician: 'Vũ Văn Nam',
      notes: 'Bảo dưỡng động cơ, kiểm tra phanh và thay nhớt máy',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      carId: rec.carId || '',
      carName: rec.carName,
      licensePlate: rec.licensePlate,
      type: rec.type,
      startDate: rec.startDate,
      endDate: rec.endDate,
      cost: rec.cost,
      status: rec.status,
      technician: rec.technician || 'Vũ Văn Nam',
      notes: rec.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCarSelect = (carId) => {
    const selected = cars.find((c) => String(c.id) === String(carId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        carId: selected.id,
        carName: selected.name,
        licensePlate: selected.licensePlate,
      }));
    }
  };

  const handleComplete = async (id, carName) => {
    if (!window.confirm(`Xác nhận hoàn tất bảo trì cho xe "${carName}"? Xe sẽ chuyển sang trạng thái Sẵn sàng hoạt động.`)) {
      return;
    }
    setLoading(true);
    try {
      await storageService.completeMaintenance(id);
      toast.success(`Đã hoàn tất bảo trì xe "${carName}" thành công!`);
      loadData();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi hoàn tất bảo trì.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lịch bảo trì xe "${name}"? Trạng thái xe sẽ được tự động đồng bộ lại.`)) {
      return;
    }
    setLoading(true);
    try {
      await storageService.deleteMaintenance(id);
      toast.success('Đã xóa phiếu bảo trì thành công');
      loadData();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xóa phiếu bảo trì.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.carName.trim() || !formData.licensePlate.trim()) {
      toast.error('Vui lòng chọn hoặc nhập thông tin xe bảo dưỡng');
      return;
    }

    setLoading(true);
    try {
      await storageService.createMaintenance({
        carId: Number(formData.carId) || undefined,
        carName: formData.carName,
        licensePlate: formData.licensePlate,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        cost: Number(formData.cost) || 0,
        status: formData.status,
        technician: formData.technician,
        notes: formData.notes,
      });

      toast.success(editingRecord ? 'Cập nhật phiếu bảo trì thành công' : 'Đã tạo phiếu bảo trì và đồng bộ trạng thái xe');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu phiếu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { key: '_index', label: 'STT' },
      { key: 'carName', label: 'Tên xe' },
      { key: 'licensePlate', label: 'Biển số' },
      { key: 'type', label: 'Hạng mục bảo dưỡng' },
      { key: 'startDate', label: 'Ngày bắt đầu' },
      { key: 'endDate', label: 'Ngày hoàn tất dự kiến' },
      {
        key: 'cost',
        label: 'Chi phí (VNĐ)',
        formatter: (val) => formatCurrency(val),
      },
      {
        key: 'status',
        label: 'Trạng thái',
        formatter: (val) => (val === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'),
      },
      { key: 'technician', label: 'Kỹ thuật viên phụ trách' },
      { key: 'notes', label: 'Ghi chú kỹ thuật' },
    ];

    const todayStr = new Date().toISOString().slice(0, 10);
    exportToCsv({
      filename: `Bao-cao-bao-tri-xe-${todayStr}`,
      columns,
      data: filtered,
    });
  };

  const filtered = records.filter((r) => {
    const matchSearch =
      r.carName?.toLowerCase().includes(search.toLowerCase()) ||
      r.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.technician?.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter === 'IN_PROGRESS') return r.status === 'IN_PROGRESS' || r.status === 'DANG_XU_LY';
    if (statusFilter === 'COMPLETED') return r.status === 'COMPLETED' || r.status === 'HOAN_THANH';
    return true;
  });

  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
  const activeCount = records.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'DANG_XU_LY').length;
  const completedCount = records.filter((r) => r.status === 'COMPLETED' || r.status === 'HOAN_THANH').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>Quản lý bảo trì xe</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Lịch trình bảo dưỡng định kỳ, sửa chữa thay thế phụ tùng và kiểm soát trạng thái xe</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportExcel} disabled={filtered.length === 0}>
            Xuất Excel
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Thêm bảo trì
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng phiếu</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{records.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lịch sử toàn hệ thống</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang bảo trì</span>
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Xe tạm khóa lịch thuê</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã hoàn tất</span>
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Xe đã sẵn sàng hoạt động</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Tổng chi phí kỹ thuật</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(totalCost)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bảo dưỡng & sửa chữa</div>
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
            Tất cả ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'IN_PROGRESS' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đang xử lý ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hoàn thành ({completedCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên xe, biển số, hạng mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Xe bảo trì</th>
                <th className="py-3.5 px-4">Hạng mục kỹ thuật</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4 text-right">Chi phí</th>
                <th className="py-3.5 px-4">Kỹ thuật viên</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không có phiếu bảo dưỡng hoặc sửa chữa nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const isDone = r.status === 'COMPLETED' || r.status === 'HOAN_THANH';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{r.carName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{r.licensePlate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{r.type}</div>
                        {r.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{r.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <div>Bắt đầu: {r.startDate}</div>
                        <div>Kết thúc: {r.endDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(r.cost)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.technician || 'Vũ Văn Nam'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Hoàn tất</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Đang xử lý</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDone && (
                            <button
                              onClick={() => handleComplete(r.id, r.carName)}
                              disabled={loading}
                              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Hoàn tất bảo trì & Mở khóa xe"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hoàn tất</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.carName)}
                            disabled={loading}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa phiếu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Phiếu Bảo Trì */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Chỉnh sửa phiếu bảo dưỡng' : 'Tạo phiếu bảo dưỡng bảo trì xe'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Chọn xe từ hệ thống */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn xe trong đội xe *</label>
            <select
              value={formData.carId}
              onChange={(e) => handleCarSelect(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium bg-white"
              required
            >
              <option value="">-- Chọn phương tiện cần bảo dưỡng --</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.licensePlate}] {c.name} ({c.status === 'AVAILABLE' ? 'Sẵn sàng' : c.status === 'RENTED' ? 'Đang thuê' : 'Đang bảo dưỡng'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên xe bảo trì *</label>
              <input
                type="text"
                value={formData.carName}
                onChange={(e) => setFormData({ ...formData, carName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                placeholder="Toyota Camry 2.5Q"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biển số xe *</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                placeholder="51K-889.99"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hạng mục bảo trì kỹ thuật *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium bg-white"
            >
              <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ (Thay dầu, lọc gió, kiểm tra thắng)</option>
              <option value="Sửa chữa kỹ thuật">Sửa chữa kỹ thuật (Động cơ, hộp số, hệ thống điện)</option>
              <option value="Thay lốp & Cân mâm">Thay lốp & Cân mâm bấm chì</option>
              <option value="Đăng kiểm định kỳ">Đăng kiểm định kỳ phương tiện</option>
              <option value="Vệ sinh nội thất & Đánh bóng">Vệ sinh nội thất chuyên sâu & Đánh bóng</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày dự kiến hoàn tất *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chi phí dự kiến (VNĐ)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                step="50000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kỹ thuật viên</label>
              <input
                type="text"
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                placeholder="Vũ Văn Nam"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú kỹ thuật chi tiết</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Chi tiết công việc và phụ tùng thay thế..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? 'Đang xử lý...' : editingRecord ? 'Lưu thay đổi' : 'Tạo phiếu bảo trì'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
