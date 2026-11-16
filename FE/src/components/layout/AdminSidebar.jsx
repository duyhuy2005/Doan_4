import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Car,
  MapPin,
  Users,
  UserCheck,
  CalendarCheck2,
  FileText,
  ClipboardCheck,
  CreditCard,
  Wrench,
  Percent,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Danh mục menu phân hệ Quản trị & Vận hành (đã lược bỏ Hãng xe & Loại xe theo yêu cầu)
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý xe', path: '/admin/cars', icon: Car },
    { name: 'Chi nhánh', path: '/admin/branches', icon: MapPin },
    { name: 'Khách hàng', path: '/admin/customers', icon: Users },
    { name: 'Nhân viên', path: '/admin/staff', icon: UserCheck, roles: ['ADMIN'] },
    { name: 'Đơn thuê', path: '/admin/bookings', icon: CalendarCheck2 },
    { name: 'Hợp đồng', path: '/admin/contracts', icon: FileText },
    { name: 'Giao nhận', path: '/admin/handovers', icon: ClipboardCheck },
    { name: 'Thanh toán', path: '/admin/payments', icon: CreditCard },
    { name: 'Bảo trì', path: '/admin/maintenance', icon: Wrench },
    { name: 'Khuyến mãi', path: '/admin/promotions', icon: Percent },
    { name: 'Đánh giá', path: '/admin/reviews', icon: Star },
    { name: 'Báo cáo thống kê', path: '/admin/reports', icon: BarChart3, roles: ['ADMIN'] },
    { name: 'Cấu hình hệ thống', path: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:h-full shrink-0 select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            CR
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none tracking-tight">
              Car<span className="text-blue-400">Rental</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
              Admin Console
            </div>
          </div>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="p-3 mx-3 my-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3 shrink-0">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'}
          alt={user?.fullName}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50"
        />
        <div className="overflow-hidden">
          <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wide">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-thin">
        {menuItems
          .filter((item) => !item.roles || item.roles.includes(user?.role || 'ADMIN'))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Footer Switcher & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-1 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ khách hàng</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
