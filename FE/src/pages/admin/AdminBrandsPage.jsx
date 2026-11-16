import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Search, Tag, Globe, Car } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: 'Nhật Bản',
    logoUrl: '',
    carCount: 0,
  });

  const toast = useToastStore();

  const loadBrands = () => {
    // Khởi tạo danh sách hãng có quốc gia nếu chưa có
    const initialWithCountries = [
      { id: 1, name: 'Toyota', country: 'Nhật Bản', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Toyota.svg', carCount: 12 },
      { id: 2, name: 'Mazda', country: 'Nhật Bản', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Mazda_logo_with_wordmark.svg', carCount: 8 },
      { id: 3, name: 'Hyundai', country: 'Hàn Quốc', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg', carCount: 15 },
      { id: 4, name: 'Kia', country: 'Hàn Quốc', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/KIA_logo2.svg', carCount: 6 },
      { id: 5, name: 'BMW', country: 'Đức', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg', carCount: 5 },
      { id: 6, name: 'Mercedes-Benz', country: 'Đức', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg', carCount: 4 },
      { id: 7, name: 'Ford', country: 'Mỹ', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg', carCount: 3 },
      { id: 8, name: 'VinFast', country: 'Việt Nam', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/VinFast_logo.svg', carCount: 10 },
    ];
    const current = storageService.getBrands();
    if (current && current.length) {
      // Merge country info if missing
      const merged = current.map((b, idx) => ({
        ...b,
        country: b.country || initialWithCountries[idx % initialWithCountries.length]?.country || 'Nhật Bản',
        carCount: b.carCount || initialWithCountries[idx % initialWithCountries.length]?.carCount || 5,
      }));
      setBrands(merged);
    } else {
      setBrands(initialWithCountries);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData({ name: '', country: 'Nhật Bản', logoUrl: '', carCount: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      country: brand.country || 'Nhật Bản',
      logoUrl: brand.logoUrl || '',
      carCount: brand.carCount || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hãng "${name}"?`)) {
      storageService.deleteBrand(id);
      toast.success(`Đã xóa hãng ${name}`);
      loadBrands();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên hãng xe');
      return;
    }

    storageService.saveBrand({
      id: editingBrand ? editingBrand.id : undefined,
      ...formData,
    });

    toast.success(editingBrand ? 'Cập nhật hãng xe thành công' : 'Thêm hãng xe mới thành công');
    setIsModalOpen(false);
    loadBrands();
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.country && b.country.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-blue-600" />
            <span>Quản lý hãng xe</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Danh mục thương hiệu và nguồn gốc xuất xứ phương tiện</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm hãng xe
        </Button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hãng xe, quốc gia..."
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
                <th className="py-3.5 px-4">Logo</th>
                <th className="py-3.5 px-4">Tên hãng</th>
                <th className="py-3.5 px-4">Quốc gia</th>
                <th className="py-3.5 px-4 text-center">Số lượng xe</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((b, idx) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 p-1.5 flex items-center justify-center border border-slate-200/60">
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt={b.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Car className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{b.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {b.country || 'Chưa cập nhật'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                      {b.carCount || 0} xe
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

      {/* Modal Thêm / Sửa Hãng Xe */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Chỉnh sửa hãng xe' : 'Thêm hãng xe mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên hãng xe *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              placeholder="Ví dụ: Toyota, VinFast, BMW..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quốc gia xuất xứ *</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="Việt Nam">Việt Nam</option>
              <option value="Nhật Bản">Nhật Bản</option>
              <option value="Hàn Quốc">Hàn Quốc</option>
              <option value="Đức">Đức</option>
              <option value="Mỹ">Mỹ</option>
              <option value="Thụy Điển">Thụy Điển</option>
              <option value="Anh">Anh</option>
              <option value="Pháp">Pháp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL Logo (Ảnh SVG hoặc PNG)</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-mono"
              placeholder="https://upload.wikimedia.org/..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingBrand ? 'Lưu thay đổi' : 'Tạo hãng xe'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
