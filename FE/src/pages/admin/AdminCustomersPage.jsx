import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Lock, Unlock, Search, Users, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    citizenId: '',
    driverLicenseNo: '',
  });

  const toast = useToastStore();

  const loadCustomers = () => {
    setCustomers(storageService.getCustomers());
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ fullName: '', phone: '', email: '', citizenId: '', driverLicenseNo: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setFormData({
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      citizenId: c.citizenId || '',
      driverLicenseNo: c.driverLicenseNo || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (c) => {
    const action = c.status === 'ACTIVE' ? 'khóa tài khoản' : 'mở khóa tài khoản';
    if (window.confirm(`Bạn có chắc muốn ${action} "${c.fullName}"?`)) {
      storageService.toggleCustomerStatus(c.id);
      toast.success(`Đã ${action} thành công`);
      loadCustomers();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email');
      return;
    }

    storageService.saveCustomer({
      id: editingCustomer ? editingCustomer.id : undefined,
      ...formData,
    });

    toast.success(editingCustomer ? 'Cập nhật thông tin khách hàng thành công' : 'Thêm khách hàng mới thành công');
    setIsModalOpen(false);
    loadCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Quản lý khách hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách hồ sơ định danh, lịch sử thuê xe và trạng thái tài khoản</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm khách hàng
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo họ tên, số điện thoại, email..."
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
                <th className="py-3.5 px-4">Tên khách hàng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Số chuyến thuê</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">GPLX: {c.driverLicenseNo || 'B2-chưa nhập'}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      {c.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {c.email}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                      {c.rentalCount || 0} chuyến
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {c.status === 'ACTIVE' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          c.status === 'ACTIVE'
                            ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={c.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {c.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Khách Hàng */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                placeholder="0912 345 678"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="vana@gmail.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số CCCD / Định danh</label>
              <input
                type="text"
                value={formData.citizenId}
                onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                placeholder="001200001234"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số GPLX</label>
              <input
                type="text"
                value={formData.driverLicenseNo}
                onChange={(e) => setFormData({ ...formData, driverLicenseNo: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
                placeholder="B2-99887766"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingCustomer ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
