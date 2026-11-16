import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Search, UserCheck, Phone, Mail, Shield, CheckCircle } from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'Nhân viên',
    phone: '',
    email: '',
    branch: 'Hà Nội - Cầu Giấy',
    status: 'ACTIVE',
  });

  const toast = useToastStore();

  const loadStaff = () => {
    setStaffList(storageService.getStaff());
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      role: 'Nhân viên',
      phone: '',
      email: '',
      branch: 'Hà Nội - Cầu Giấy',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStaff(s);
    setFormData({
      fullName: s.fullName,
      role: s.role || 'Nhân viên',
      phone: s.phone,
      email: s.email,
      branch: s.branch || 'Hà Nội - Cầu Giấy',
      status: s.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên "${name}"?`)) {
      storageService.deleteStaff(id);
      toast.success(`Đã xóa nhân viên ${name}`);
      loadStaff();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng nhập họ tên và số điện thoại nhân viên');
      return;
    }

    storageService.saveStaff({
      id: editingStaff ? editingStaff.id : undefined,
      ...formData,
    });

    toast.success(editingStaff ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên mới thành công');
    setIsModalOpen(false);
    loadStaff();
  };

  const filtered = staffList.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
      (s.role && s.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>Quản lý nhân viên</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách đội ngũ vận hành, bàn giao xe, CSKH và kỹ thuật viên</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm nhân viên
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo họ tên, vai trò, số điện thoại..."
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
                <th className="py-3.5 px-4">Họ tên nhân viên</th>
                <th className="py-3.5 px-4">Vai trò / Chức danh</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Chi nhánh</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{s.fullName}</div>
                    <div className="text-[11px] text-slate-400">{s.email || `${s.phone}@carrental.vn`}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        s.role.includes('Quản lý') || s.role.includes('Admin')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      {s.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{s.branch || 'Trụ sở chính'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {s.status === 'ACTIVE' ? 'Hoạt động' : 'Chờ kích hoạt'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.fullName)}
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

      {/* Modal Thêm / Sửa Nhân Viên */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên nhân viên *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Nguyễn Văn Hùng"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò / Chức danh *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option value="Nhân viên giao nhận">Nhân viên giao nhận</option>
                <option value="Nhân viên CSKH & Duyệt đơn">Nhân viên CSKH & Duyệt đơn</option>
                <option value="Quản lý chi nhánh">Quản lý chi nhánh</option>
                <option value="Kỹ thuật viên bảo trì">Kỹ thuật viên bảo trì</option>
                <option value="Kế toán & Đối soát">Kế toán & Đối soát</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                placeholder="0912 111 222"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email nội bộ</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="hung.nv@carrental.vn"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chi nhánh làm việc</label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="Hà Nội - Cầu Giấy">Hà Nội - Cầu Giấy</option>
              <option value="Hà Nội - Mỹ Đình">Hà Nội - Mỹ Đình</option>
              <option value="Hưng Yên - Mỹ Hào">Hưng Yên - Mỹ Hào</option>
              <option value="Hưng Yên - Văn Giang">Hưng Yên - Văn Giang</option>
              <option value="TP.HCM - Tân Sơn Nhất">TP.HCM - Tân Sơn Nhất</option>
              <option value="TP.HCM - Quận 1">TP.HCM - Quận 1</option>
              <option value="Trụ sở chính">Trụ sở chính</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingStaff ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
