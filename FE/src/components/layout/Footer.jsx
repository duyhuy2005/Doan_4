import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Auto<span className="text-blue-400">Rental</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Nền tảng đặt xe ô tô tự lái và có tài xế trực tuyến hàng đầu Việt Nam. Cam kết 100% xe đời mới, bảo hiểm vật chất toàn diện, thủ tục minh bạch và nhận xe trong 15 phút.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bảo hiểm 100%
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> Hỗ trợ 24/7
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Xe đời mới
              </div>
            </div>
          </div>

          {/* Cột 2: Danh mục xe phổ biến */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Phân khúc xe</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/cars?category=1" className="hover:text-white transition-colors">Sedan 4-5 chỗ</Link></li>
              <li><Link to="/cars?category=2" className="hover:text-white transition-colors">SUV 7 chỗ gầm cao</Link></li>
              <li><Link to="/cars?category=5" className="hover:text-white transition-colors">Xe điện cao cấp (EV)</Link></li>
              <li><Link to="/cars?category=3" className="hover:text-white transition-colors">Hatchback đô thị</Link></li>
              <li><Link to="/cars?category=4" className="hover:text-white transition-colors">Bán tải Pick-up</Link></li>
            </ul>
          </div>

          {/* Cột 3: Chính sách & Hỗ trợ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Chính sách</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/#how-it-works" className="hover:text-white transition-colors">Quy trình thuê xe</Link></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Chính sách đặt cọc & hoàn tiền</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Quy định hủy chuyến</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Bảo mật thông tin</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Điều khoản dịch vụ</span></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>1900 8899 / 0909 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@autorental.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 AutoRental Inc. Dự án Hệ thống Quản lý và Cho thuê xe Ô tô Trực tuyến.</p>
          <div className="flex items-center gap-4">
            <span>Phiên bản 1.0 (MVP)</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hệ thống đang hoạt động ổn định
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
