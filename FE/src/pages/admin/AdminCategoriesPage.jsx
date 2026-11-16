import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Search, Shapes } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    carCount: 0,
  });

  const toast = useToastStore();

  const loadCategories = () => {
    const defaultCategories = [
      { id: 1, name: 'Sedan', slug: 'sedan', description: 'Xe 4-5 chỗ, phù hợp đi trong thành phố', carCount: 35 },
      { id: 2, name: 'SUV', slug: 'suv', description: 'Xe gầm cao, phù hợp mọi địa hình', carCount: 28 },
      { id: 3, name: 'MPV', slug: 'mpv', description: 'Xe 7 chỗ, rộng rãi, gia đình', carCount: 15 },
      { id: 4, name: 'Hatchback', slug: 'hatchback', description: 'Xe nhỏ gọn, tiết kiệm nhiên liệu', carCount: 10 },
      { id: 5, name: 'Bán tải', slug: 'ban-tai', description: 'Xe mạnh mẽ, đi địa hình tốt', carCount: 8 },
    ];
    const current = storageService.getCategories();
    if (current && current.length) {
      const merged = current.map((c, idx) => ({
        ...c,
        description: c.description || defaultCategories[idx % defaultCategories.length]?.description,
        carCount: c.carCount || defaultCategories[idx % defaultCategories.length]?.carCount || 10,
      }));
      setCategories(merged);
    } else {
      setCategories(defaultCategories);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', carCount: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      carCount: cat.carCount || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa loại xe "${name}"?`)) {
      storageService.deleteCategory(id);
      toast.success(`Đã xóa loại xe ${name}`);
      loadCategories();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên loại xe');
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');
    storageService.saveCategory({
      id: editingCategory ? editingCategory.id : undefined,
      ...formData,
      slug,
    });

    toast.success(editingCategory ? 'Cập nhật loại xe thành công' : 'Thêm loại xe mới thành công');
    setIsModalOpen(false);
    loadCategories();
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Shapes className="w-6 h-6 text-blue-600" />
            <span>Quản lý loại xe</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Phân khúc dáng xe, sức chứa và công năng di chuyển</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm loại xe
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên phân khúc, mô tả..."
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
                <th className="py-3.5 px-4">Tên loại xe</th>
                <th className="py-3.5 px-4">Mô tả đặc trưng</th>
                <th className="py-3.5 px-4 text-center">Số lượng xe</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 text-sm bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/60 inline-block">
                      {c.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-md">{c.description || 'Chưa có mô tả'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                      {c.carCount || 0} xe
                    </span>
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
                        onClick={() => handleDelete(c.id, c.name)}
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

      {/* Modal Thêm / Sửa Loại Xe */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa loại xe' : 'Thêm loại xe mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên loại xe / Dáng xe *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Ví dụ: Sedan, SUV, MPV, Crossover..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mã định danh (Slug)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-xs"
              placeholder="Tự động tạo từ tên (ví dụ: suv-7-cho)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả công năng</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Ví dụ: Xe gầm cao 7 chỗ, phù hợp cho gia đình đi du lịch xa..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingCategory ? 'Lưu thay đổi' : 'Tạo loại xe'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
