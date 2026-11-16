import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Percent, Plus, Edit2, Trash2, Search, Tag, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discountPercentage: 10,
    discountAmountMax: 300000,
    minOrderValue: 800000,
    usageLimit: 500,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
  });

  const toast = useToastStore();

  const loadData = () => {
    setPromotions(storageService.getPromotions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      title: '',
      discountPercentage: 10,
      discountAmountMax: 300000,
      minOrderValue: 800000,
      usageLimit: 500,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPromo(p);
    setFormData({
      code: p.code,
      title: p.title,
      discountPercentage: p.discountPercentage,
      discountAmountMax: p.discountAmountMax || 300000,
      minOrderValue: p.minOrderValue || 0,
      usageLimit: p.usageLimit || 500,
      startDate: p.startDate ? p.startDate.slice(0, 10) : '2026-01-01',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '2026-12-31',
      isActive: p.isActive,
    });
    setIsModalOpen(true);
  };

  const handleToggle = (p) => {
    const updated = promotions.map((item) =>
      item.id === p.id ? { ...item, isActive: !item.isActive } : item
    );
    localStorage.setItem('autorental_promotions', JSON.stringify(updated));
    setPromotions(updated);
    toast.success(`Đã ${!p.isActive ? 'kích hoạt' : 'tạm dừng'} mã ${p.code}`);
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Bạn có chắc muốn xóa mã ưu đãi "${code}"?`)) {
      const updated = promotions.filter((item) => item.id !== id);
      localStorage.setItem('autorental_promotions', JSON.stringify(updated));
      setPromotions(updated);
      toast.success(`Đã xóa mã ${code}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) {
      toast.error('Vui lòng nhập mã và tiêu đề chương trình');
      return;
    }

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      discountPercentage: Number(formData.discountPercentage),
      discountAmountMax: Number(formData.discountAmountMax),
      minOrderValue: Number(formData.minOrderValue),
      usageLimit: Number(formData.usageLimit),
    };

    let updated;
    if (editingPromo) {
      updated = promotions.map((p) => (p.id === editingPromo.id ? { ...p, ...payload } : p));
      toast.success('Cập nhật khuyến mãi thành công');
    } else {
      const newId = promotions.length ? Math.max(...promotions.map((p) => p.id)) + 1 : 1;
      updated = [...promotions, { id: newId, usedCount: 0, ...payload }];
      toast.success('Tạo mã khuyến mãi mới thành công');
    }

    localStorage.setItem('autorental_promotions', JSON.stringify(updated));
    setPromotions(updated);
    setIsModalOpen(false);
  };

  const filtered = promotions.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Percent className="w-6 h-6 text-blue-600" />
            <span>Quản lý khuyến mãi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Voucher giảm giá, chiến dịch ưu đãi theo mùa và chiết khấu đơn hàng</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm khuyến mãi
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã voucher, tên ưu đãi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Tên chương trình</th>
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-4">Mức giảm giá</th>
                <th className="py-3.5 px-4">Thời gian áp dụng</th>
                <th className="py-3.5 px-4 text-center">Đã dùng / Giới hạn</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Đơn tối thiểu: {formatCurrency(p.minOrderValue || 0)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/80 inline-flex items-center gap-1">
                      <Tag className="w-3 h-3 text-blue-600" />
                      {p.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="text-emerald-600 text-sm">Giảm {p.discountPercentage}%</span>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      Tối đa {formatCurrency(p.discountAmountMax || 0)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {p.startDate?.slice(0, 10)} → {p.endDate?.slice(0, 10)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="font-bold text-slate-800">{p.usedCount || 0}</span>
                    <span className="text-slate-400"> / {p.usageLimit || 500}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggle(p)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {p.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.code)}
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

      {/* Modal Thêm / Sửa Khuyến Mãi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo chương trình ưu đãi mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã Voucher (Code) *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold uppercase"
                placeholder="WELCOME2026"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phần trăm giảm (%) *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề chương trình *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Ưu đãi thành viên mới - Giảm ngay 10%"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                step="50000"
                value={formData.discountAmountMax}
                onChange={(e) => setFormData({ ...formData, discountAmountMax: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn tối thiểu (VNĐ)</label>
              <input
                type="number"
                step="100000"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingPromo ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
