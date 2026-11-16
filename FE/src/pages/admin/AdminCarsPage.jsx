import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import { formatCurrency } from '../../utils/format';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Wrench, CheckCircle, Car as CarIcon, Search } from 'lucide-react';

export default function AdminCarsPage() {
  const toast = useToastStore();
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  // Form thêm / sửa xe
  const [form, setForm] = useState({
    name: '',
    brandId: 1,
    categoryId: 1,
    licensePlate: '',
    dailyPrice: 1000000,
    depositRequired: 5000000,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    fuelConsumption: '7.0L / 100km',
    mileageLimitPerDay: 300,
    extraMileageCharge: 5000,
    currentMileage: 10000,
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&fit=crop&q=80',
    description: '',
    rentalConditions: 'Yêu cầu GPLX B2, cọc tiền mặt hoặc tài sản tương đương.',
    status: 'AVAILABLE',
  });

  const loadData = () => {
    setCars(storageService.getCars());
    setBrands(storageService.getBrands());
    setCategories(storageService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setForm({
      name: '',
      brandId: brands[0]?.id || 1,
      categoryId: categories[0]?.id || 1,
      licensePlate: '',
      dailyPrice: 1000000,
      depositRequired: 5000000,
      seats: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      fuelConsumption: '7.0L / 100km',
      mileageLimitPerDay: 300,
      extraMileageCharge: 5000,
      currentMileage: 10000,
      thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&fit=crop&q=80',
      description: 'Xe đời mới tiện nghi đầy đủ, bảo hiểm 2 chiều.',
      rentalConditions: 'Yêu cầu GPLX B2, cọc tiền mặt hoặc tài sản tương đương.',
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setForm({
      ...car,
      brandId: car.brandId,
      categoryId: car.categoryId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const selectedBrand = brands.find((b) => b.id === Number(form.brandId));
      const selectedCategory = categories.find((c) => c.id === Number(form.categoryId));

      const payload = {
        ...form,
        id: editingCar ? editingCar.id : undefined,
        brandName: selectedBrand?.name || 'Khác',
        categoryName: selectedCategory?.name || 'Khác',
        dailyPrice: Number(form.dailyPrice),
        depositRequired: Number(form.depositRequired),
        seats: Number(form.seats),
        currentMileage: Number(form.currentMileage),
        mileageLimitPerDay: Number(form.mileageLimitPerDay),
        extraMileageCharge: Number(form.extraMileageCharge),
      };

      storageService.saveCar(payload);
      toast.success(editingCar ? 'Cập nhật thông tin xe thành công!' : 'Thêm xe mới vào kho thành công!');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chiếc xe này khỏi hệ thống?')) {
      storageService.deleteCar(id);
      toast.success('Đã xóa xe thành công.');
      loadData();
    }
  };

  const handleToggleMaintenance = (car) => {
    const newStatus = car.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    storageService.updateCarStatus(car.id, newStatus);
    toast.info(`Đã chuyển trạng thái xe sang: ${newStatus}`);
    loadData();
  };

  const filteredCars = cars.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      c.brandName?.toLowerCase().includes(search.toLowerCase());

    const matchBrand = !selectedBrand || String(c.brandId) === selectedBrand || c.brandName === selectedBrand;
    const matchCategory =
      !selectedCategory || String(c.categoryId) === selectedCategory || c.categoryName === selectedCategory;
    const matchStatus =
      !selectedStatus ||
      c.status === selectedStatus ||
      (selectedStatus === 'AVAILABLE' && (c.status === 'HOAT_DONG' || c.status === 'AVAILABLE')) ||
      (selectedStatus === 'RENTED' && (c.status === 'DANG_THUE' || c.status === 'RENTED')) ||
      (selectedStatus === 'MAINTENANCE' && (c.status === 'BAO_TRI' || c.status === 'MAINTENANCE'));

    return matchSearch && matchBrand && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filteredCars.length / pageSize) || 1;
  const paginatedCars = filteredCars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    toast.info(`Đã áp dụng bộ lọc: Tìm thấy ${filteredCars.length} xe.`);
  };

  const handleResetFilter = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <CarIcon className="w-7 h-7 text-blue-600" /> Quản Lý Kho Xe Ô Tô
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-900">{cars.length}</strong> xe trong hệ thống
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Thêm xe mới
        </Button>
      </div>

      {/* Search & Filter Bar (Khớp 100% demo) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên xe, biển số..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Dropdown Hãng xe */}
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Hãng xe (Tất cả)</option>
          {brands.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Dropdown Loại xe */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Loại xe (Tất cả)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Dropdown Trạng thái */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Trạng thái (Tất cả)</option>
          <option value="AVAILABLE">Sẵn sàng</option>
          <option value="RENTED">Đang thuê</option>
          <option value="MAINTENANCE">Bảo trì</option>
        </select>

        <Button variant="primary" size="sm" onClick={handleApplyFilter}>
          Lọc
        </Button>
        {(search || selectedBrand || selectedCategory || selectedStatus) && (
          <Button variant="outline" size="sm" onClick={handleResetFilter}>
            Xóa lọc
          </Button>
        )}
      </div>

      {/* Bảng danh sách xe */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Ảnh & Tên xe</th>
                <th className="py-3 px-4">Hãng</th>
                <th className="py-3 px-4">Biển số</th>
                <th className="py-3 px-4 text-center">Số chỗ</th>
                <th className="py-3 px-4">Giá thuê/ngày</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCars.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Không tìm thấy xe nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedCars.map((car, idx) => (
                  <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={car.thumbnail}
                        alt={car.name}
                        className="w-14 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{car.name}</div>
                        <div className="text-[11px] text-slate-400">{car.categoryName}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{car.brandName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {car.licensePlate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{car.seats}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 font-mono">
                      {formatCurrency(car.dailyPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge status={car.status} type="car" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleToggleMaintenance(car)}
                        title={car.status === 'MAINTENANCE' ? 'Đưa về sẵn sàng' : 'Chuyển bảo dưỡng'}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(car)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        title="Xóa xe"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang (Pagination) */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredCars.length)} trong {filteredCars.length} xe
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa xe */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCar ? 'Chỉnh sửa thông tin xe' : 'Thêm xe ô tô mới vào kho'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên xe hiển thị *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="vd: Toyota Camry 2.5Q 2024"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Biển số xe *</label>
              <input
                type="text"
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                placeholder="vd: 51K-123.45"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hãng sản xuất</label>
              <select
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phân khúc dáng xe</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số chỗ ngồi</label>
              <input
                type="number"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giá thuê ngày (VND) *</label>
              <input
                type="number"
                value={form.dailyPrice}
                onChange={(e) => setForm({ ...form, dailyPrice: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiền cọc bắt buộc (VND) *</label>
              <input
                type="number"
                value={form.depositRequired}
                onChange={(e) => setForm({ ...form, depositRequired: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hộp số</label>
              <select
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="AUTOMATIC">Tự động (Automatic)</option>
                <option value="MANUAL">Số sàn (Manual)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nhiên liệu</label>
              <select
                value={form.fuelType}
                onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="GASOLINE">Xăng</option>
                <option value="DIESEL">Dầu</option>
                <option value="ELECTRIC">Điện (EV)</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ODO hiện tại (km)</label>
              <input
                type="number"
                value={form.currentMileage}
                onChange={(e) => setForm({ ...form, currentMileage: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phụ thu vượt km (VND/km)</label>
              <input
                type="number"
                value={form.extraMileageCharge}
                onChange={(e) => setForm({ ...form, extraMileageCharge: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link ảnh Thumbnail</label>
              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingCar ? 'Lưu cập nhật' : 'Thêm xe'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
