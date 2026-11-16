import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Shield, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  Car, 
  Receipt, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../services/storageService';

export default function AdminHeader({ onToggleSidebar }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const data = await storageService.getNotifications();
      if (data) {
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Lỗi khi tải thông báo:', e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    await storageService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      await storageService.markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setIsOpen(false);

    if (notif.relatedTarget === 'DON_THUE' || notif.type?.includes('CHO_') || notif.type === 'SAN_SANG_GIAO') {
      navigate('/admin/bookings');
    }
  };

  const displayedList = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'CHO_XAC_NHAN':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'SAN_SANG_GIAO':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'CHO_HOAN_COC':
        return <Receipt className="w-4 h-4 text-indigo-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'CHO_XAC_NHAN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SAN_SANG_GIAO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHO_HOAN_COC':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 hidden sm:block" />
          <h1 className="text-base sm:text-lg font-bold text-slate-800">
            Hệ thống Quản lý Vận hành & Kho xe
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phiên làm việc: {user?.role || 'STAFF'}</span>
        </div>

        {/* NOTIFICATION CENTER */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
              isOpen
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Trung tâm thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* POPOVER DROPDOWN */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-sm">Thông báo vận hành</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500/80 text-white text-[10px] font-bold rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      await fetchNotifs();
                      setIsLoading(false);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                    title="Làm mới"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Actions */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterUnread(false)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      !filterUnread
                        ? 'bg-white shadow-xs text-slate-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilterUnread(true)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      filterUnread
                        ? 'bg-white shadow-xs text-slate-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Chưa đọc ({unreadCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Đọc tất cả
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                {displayedList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Không có thông báo nào trong mục này.
                  </div>
                ) : (
                  displayedList.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left flex gap-3 ${
                        !notif.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border ${getBadgeStyle(
                            notif.type
                          )}`}
                        >
                          {getNotifIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              !notif.isRead
                                ? 'font-bold text-slate-900'
                                : 'font-semibold text-slate-700'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {notif.timeAgo || 'vừa xong'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {notif.content}
                        </p>
                      </div>

                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/admin/bookings');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full"
                >
                  Xem danh sách đơn thuê <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&fit=crop&q=80'
            }
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-xs font-bold text-slate-700 hidden md:block">
            {user?.fullName}
          </span>
        </div>
      </div>
    </header>
  );
}
