import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Car,
  CalendarCheck,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Tìm & Thuê xe', path: '/cars' },
    { name: 'Lịch sử thuê', path: '/history' },
    { name: 'Đánh giá', path: '/reviews' },
    { name: 'Khuyến mãi', path: '/#promotions' },
  ];

  const handleRoleSwitch = (role) => {
    switchRole(role);
    setIsRoleDropdownOpen(false);
    if (role === 'ADMIN' || role === 'STAFF') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner Thông tin hỗ trợ */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Giao nhận xe tận nơi 24/7 tại sân bay & nội thành
            </span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-slate-400" /> Hotline: 1900 8899 (Hỗ trợ 24/7)
            </span>
          </div>

          {/* Quick Demo Role Switcher tiện lợi kiểm thử */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer border border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Chế độ Demo: <strong className="text-amber-400">{user?.role || 'GUEST'}</strong></span>
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Chuyển đổi vai trò kiểm thử
                </div>
                <button
                  onClick={() => handleRoleSwitch('CUSTOMER')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    user?.role === 'CUSTOMER' ? 'font-bold text-blue-600 bg-blue-50/50' : ''
                  }`}
                >
                  <span>1. Khách hàng (Customer)</span>
                  {user?.role === 'CUSTOMER' && <span className="text-blue-600">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleSwitch('STAFF')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    user?.role === 'STAFF' ? 'font-bold text-indigo-600 bg-indigo-50/50' : ''
                  }`}
                >
                  <span>2. Nhân viên vận hành (Staff)</span>
                  {user?.role === 'STAFF' && <span className="text-indigo-600">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleSwitch('ADMIN')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    user?.role === 'ADMIN' ? 'font-bold text-red-600 bg-red-50/50' : ''
                  }`}
                >
                  <span>3. Quản trị viên (Admin)</span>
                  {user?.role === 'ADMIN' && <span className="text-red-600">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Auto<span className="text-blue-600">Rental</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Thuê xe tự lái uy tín
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Portal Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Nếu là Staff hoặc Admin, có nút chuyển nhanh vào Console */}
            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Button
                variant="outline"
                size="sm"
                icon={ShieldCheck}
                onClick={() => navigate('/admin')}
                className="border-slate-300 text-slate-800 hover:bg-slate-100"
              >
                Trang Quản trị ({user.role})
              </Button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link to="/my-bookings">
                  <Button variant="ghost" size="sm" icon={CalendarCheck}>
                    Đơn của tôi
                  </Button>
                </Link>

                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=80'}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div className="text-left text-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{user.fullName}</div>
                      <div className="text-slate-500">{user.role}</div>
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    title="Đăng xuất"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={ShieldCheck}
                onClick={() => {
                  navigate('/admin');
                  setIsMobileMenuOpen(false);
                }}
              >
                Vào Bảng Quản trị ({user.role})
              </Button>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-start" icon={CalendarCheck}>
                    Đơn thuê của tôi
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" icon={User}>
                    Hồ sơ ({user.fullName})
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  icon={LogOut}
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Đăng nhập</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
