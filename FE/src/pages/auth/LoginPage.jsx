import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/common/Button';
import { Car, Lock, Mail, UserCheck, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, switchRole } = useAuthStore();
  const toast = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const user = login(email, password);
      toast.success(`Đăng nhập thành công! Chào mừng ${user.fullName}`);
      setIsLoading(false);
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }, 400);
  };

  const handleQuickLogin = (role) => {
    switchRole(role);
    toast.success(`Đã đăng nhập nhanh với vai trò: ${role}`);
    if (role === 'ADMIN' || role === 'STAFF') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
            <Car className="w-7 h-7 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            Auto<span className="text-blue-600">Rental</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Đăng nhập tài khoản</h2>
        <p className="text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/90 space-y-6">
          {/* Quick Demo Login Buttons */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              1-Click Đăng Nhập Nhanh (Demo Testing)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('CUSTOMER')}
                className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center gap-1"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>Khách hàng</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('STAFF')}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center gap-1"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Nhân viên</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Quản trị</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold shadow-md"
            >
              Đăng nhập
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-800">
              ← Trở về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
