import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import { User, Phone, Mail, ShieldCheck, CreditCard, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function UserProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const toast = useToastStore();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || 'Quận 1, TP. Hồ Chí Minh',
    driverLicenseNo: user?.driverLicenseNo || 'B2-790123849',
    licenseFrontImage: user?.licenseFrontImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&fit=crop&q=80',
    licenseBackImage: user?.licenseBackImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&fit=crop&q=80',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Cập nhật hồ sơ cá nhân và thông tin GPLX thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Hồ Sơ Cá Nhân & Bằng Lái Xe</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý thông tin tài khoản và xác minh giấy phép lái xe để rút ngắn thời gian bàn giao xe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cá nhân cơ bản */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng ký</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Giấy phép lái xe (GPLX) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Giấy phép lái xe (GPLX)
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Số GPLX (Bằng B1, B2, C...)</label>
            <input
              type="text"
              value={formData.driverLicenseNo}
              onChange={(e) => setFormData({ ...formData, driverLicenseNo: e.target.value })}
              className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Ảnh mặt trước GPLX</div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden aspect-16/10 bg-slate-50 relative group">
                <img
                  src={formData.licenseFrontImage}
                  alt="GPLX mặt trước"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Ảnh mặt sau GPLX</div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden aspect-16/10 bg-slate-50 relative group">
                <img
                  src={formData.licenseBackImage}
                  alt="GPLX mặt sau"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Lưu thay đổi hồ sơ
          </Button>
        </div>
      </form>
    </div>
  );
}
