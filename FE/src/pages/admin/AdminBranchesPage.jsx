import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Search, MapPin, Phone, User, Navigation } from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    carCount: 20,
    status: 'ACTIVE',
  });

  const toast = useToastStore();

  const loadBranches = () => {
    setBranches(storageService.getBranches());
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager: 'Chuyên viên quản lý',
      carCount: 20,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      manager: branch.manager || 'Chuyên viên quản lý',
      carCount: branch.carCount || 20,
      status: branch.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${name}"?`)) {
      storageService.deleteBranch(id);
      toast.success(`Đã xóa chi nhánh ${name}`);
      loadBranches();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Vui lòng nhập tên và địa chỉ chi nhánh');
      return;
    }

    storageService.saveBranch({
      id: editingBranch ? editingBranch.id : undefined,
      ...formData,
    });

    toast.success(editingBranch ? 'Cập nhật chi nhánh thành công' : 'Thêm chi nhánh mới thành công');
    setIsModalOpen(false);
    loadBranches();
  };

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Quản lý chi nhánh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Hệ thống showroom, bãi xe và văn phòng giao nhận toàn quốc</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm chi nhánh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên chi nhánh, địa chỉ, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Tên chi nhánh</th>
                <th className="py-3.5 px-4">Địa chỉ giao nhận</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4 text-center">Bản đồ</th>
                <th className="py-3.5 px-4 text-center">Số lượng xe</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((b, idx) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span>{b.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">{b.address}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      {b.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/60"
                      title="Xem vị trí trên Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Xem Map</span>
                    </a>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                      {b.carCount || 20} xe
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Chi Nhánh */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên chi nhánh *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Ví dụ: Hà Nội - Cầu Giấy, TP.HCM - Tân Sơn Nhất..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ chi nhánh *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại bàn / Hotline *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                placeholder="0243 123 4567"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quản lý phụ trách</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                placeholder="Họ tên quản lý"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingBranch ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
