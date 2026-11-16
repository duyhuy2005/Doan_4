import React from 'react';
import { Search, RotateCcw, Filter, SlidersHorizontal } from 'lucide-react';
import Button from '../common/Button';

export default function CarFilter({
  filters,
  onChange,
  onReset,
  brands = [],
  categories = [],
}) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Tìm kiếm từ khóa */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Tên xe hoặc Hãng
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="vd: Camry, VF8, Ford..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Chọn Hãng xe */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Hãng sản xuất
        </label>
        <select
          value={filters.brandId || ''}
          onChange={(e) => handleChange('brandId', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        >
          <option value="">Tất cả các hãng</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chọn Phân khúc / Danh mục */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Phân khúc dáng xe
        </label>
        <select
          value={filters.categoryId || ''}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        >
          <option value="">Tất cả phân khúc</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Số chỗ ngồi */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Số chỗ ngồi
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Tất cả', value: '' },
            { label: '4 chỗ', value: '4' },
            { label: '5 chỗ', value: '5' },
            { label: '7 chỗ', value: '7' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleChange('seats', item.value)}
              className={`py-1.5 text-xs rounded-lg font-medium border transition-all cursor-pointer ${
                filters.seats === item.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hộp số */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Hộp số truyền động
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Tự động', value: 'AUTOMATIC' },
            { label: 'Số sàn', value: 'MANUAL' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                handleChange('transmission', filters.transmission === item.value ? '' : item.value)
              }
              className={`py-1.5 text-xs rounded-lg font-medium border transition-all cursor-pointer ${
                filters.transmission === item.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nhiên liệu */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Loại nhiên liệu
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Xăng', value: 'GASOLINE' },
            { label: 'Dầu', value: 'DIESEL' },
            { label: 'Điện (EV)', value: 'ELECTRIC' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                handleChange('fuelType', filters.fuelType === item.value ? '' : item.value)
              }
              className={`py-1.5 text-xs rounded-lg font-medium border transition-all cursor-pointer ${
                filters.fuelType === item.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sắp xếp */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Sắp xếp theo
        </label>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        >
          <option value="">Mặc định (Xe mới nhất)</option>
          <option value="price_asc">Giá thuê: Thấp đến cao</option>
          <option value="price_desc">Giá thuê: Cao đến thấp</option>
          <option value="rating">Được đánh giá cao nhất</option>
        </select>
      </div>
    </div>
  );
}
