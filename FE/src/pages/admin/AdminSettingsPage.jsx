import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import { Settings, Save, Building, Mail, Phone, MapPin, Shield, Bell, Palette, Database } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [settings, setSettings] = useState({
    companyName: 'CarRental Việt Nam',
    slogan: 'Hệ thống quản lý và cho thuê ô tô trực tuyến',
    email: 'support@carrental.com',
    hotline: '0123 456 789',
    emergencyPhone: '1900 8899',
    address: 'Số 123, đường ABC, Hà Nội',
    taxCode: '0109887766',
    bankAccount: '109988776655',
    bankName: 'MBBank - Ngân Hàng Quân Đội',
    accountHolder: 'CONG TY CP THUE XE CARRENTAL',
    dailyMileageLimit: 300,
    extraKmFee: 5000,
    enableVietQR: true,
    enableVNPAY: true,
    requireLicenseVerification: true,
  });

  const toast = useToastStore();

  useEffect(() => {
    const loaded = storageService.getSettings();
    if (loaded) setSettings(loaded);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    toast.success('Cập nhật cấu hình hệ thống thành công!');
  };

  const tabs = [
    { key: 'GENERAL', label: 'Thông tin chung', icon: Building },
    { key: 'REVENUE', label: 'Doanh thu', icon: Database },
    { key: 'BOOKING', label: 'Đơn thuê & Cọc', icon: Settings },
    { key: 'VEHICLE', label: 'Phương tiện', icon: Settings },
    { key: 'EMAIL_SMS', label: 'Email / SMS', icon: Mail },
    { key: 'SECURITY', label: 'Bảo mật', icon: Shield },
    { key: 'APPEARANCE', label: 'Giao diện', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Cấu hình hệ thống</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Quản lý thương hiệu, biểu phí vận hành, cổng thanh toán và thiết lập an toàn</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form & Summary Sidebar */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Card */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Thông tin doanh nghiệp & Liên hệ CSKH
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên website / Thương hiệu *</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khẩu hiệu (Slogan)</label>
              <input
                type="text"
                value={settings.slogan}
                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email hỗ trợ khách hàng *</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotline CSKH toàn quốc *</label>
              <input
                type="text"
                value={settings.hotline}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ trụ sở chính *</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Chính sách định mức & Thanh toán cọc
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Định mức km tối đa/ngày (km)</label>
                <input
                  type="number"
                  value={settings.dailyMileageLimit}
                  onChange={(e) => setSettings({ ...settings, dailyMileageLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phụ phí vượt định mức (VNĐ/km)</label>
                <input
                  type="number"
                  step="500"
                  value={settings.extraKmFee}
                  onChange={(e) => setSettings({ ...settings, extraKmFee: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Các thông số trên sẽ có hiệu lực tức thời cho tất cả các đơn đặt xe mới.
            </div>
            <Button type="submit" variant="primary" icon={Save}>
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* Right Info & Distribution Card (Matching Screenshot) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Doanh thu theo loại xe Donut */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Doanh thu theo loại xe</h3>

            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="90 238" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="60 238" strokeDashoffset="-90" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="36 238" strokeDashoffset="-150" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="29 238" strokeDashoffset="-186" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-400">Tỷ trọng</span>
                  <span className="text-base font-black font-mono text-slate-900">125.5tr</span>
                </div>
              </div>

              <div className="w-full space-y-1.5 text-xs pt-4 mt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Sedan
                  </span>
                  <strong className="font-mono text-slate-800">38%</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> SUV 7 chỗ
                  </span>
                  <strong className="font-mono text-slate-800">25%</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> MPV Gia đình
                  </span>
                  <strong className="font-mono text-slate-800">15%</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Bán tải
                  </span>
                  <strong className="font-mono text-slate-800">12%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Performance Cards */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hiệu suất tháng 9</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Tổng doanh thu:</span>
                <strong className="font-mono text-white">125.500.000đ</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Đơn thuê đã chốt:</span>
                <strong className="font-mono text-white">156 đơn</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Khách hàng mới:</span>
                <strong className="font-mono text-emerald-400">+48 khách</strong>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
