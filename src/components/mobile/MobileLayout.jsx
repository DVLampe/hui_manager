'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Calendar, User, Menu, X, Bell, Settings, UserPlus
} from 'lucide-react';

// Placeholder for notifications data
const notifications = [
  { id: 1, title: 'Sắp đến hạn thanh toán', message: 'Hụi Gia Đình - còn 3 ngày', time: '2 giờ trước', unread: true },
  { id: 2, title: 'Kỳ mới đã bắt đầu', message: 'Hụi Bạn Bè - Kỳ 4', time: '1 ngày trước', unread: true },
];

const SideMenu = ({ onClose, onNavigate }) => (
  <div className="fixed inset-0 z-50">
    <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl animate-slide-in-right">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-2">
          <button onClick={() => onNavigate('/dashboard')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Bảng thống kê</span>
          </button>
          <button onClick={() => onNavigate('/hui')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Danh sách Hụi</span>
          </button>
          <button onClick={() => onNavigate('/members')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <UserPlus className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Thành viên</span>
          </button>
          <button onClick={() => onNavigate('/profile')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Hồ sơ</span>
          </button>
          <button onClick={() => onNavigate('/settings')} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Cài đặt</span>
          </button>
          <div className="border-t border-gray-200 my-4"></div>
          <button onClick={() => { /* Handle Logout */ }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600">
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const NotificationsPanel = ({ onClose }) => (
  <div className="fixed inset-0 z-50">
    <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl animate-slide-in-right">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Thông báo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-4 rounded-lg border ${notif.unread ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm">{notif.title}</h3>
                {notif.unread && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
              </div>
              <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
              <p className="text-xs text-gray-500">{notif.time}</p>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 text-center text-sm text-red-600 font-medium">
          Đánh dấu đã đọc tất cả
        </button>
      </div>
    </div>
  </div>
);

const BottomNavItem = ({ href, icon: Icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex flex-col items-center py-2 rounded-lg ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-500'}`}>
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
};

export default function MobileLayout({ children }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  const handleNavigate = (path) => {
    // This would be handled by Next.js Link, but we keep it for the side menu logic
    window.location.pathname = path;
    setShowMenu(false);
  };

  const getHeaderTitle = () => {
    if (pathname.includes('/dashboard')) return 'Hụi Online';
    if (pathname.includes('/hui')) return 'Danh sách Hụi';
    if (pathname.includes('/members')) return 'Thành viên';
    if (pathname.includes('/profile')) return 'Hồ sơ';
    return 'Hụi Online';
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-gray-40 to-gray-100/90 min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">{getHeaderTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotifications(true)} className="relative p-2 hover:bg-gray-50 rounded-lg">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={() => setShowMenu(true)} className="p-2 hover:bg-gray-50 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-2">
          <BottomNavItem href="/dashboard" icon={Users} label="Trang chủ" />
          <BottomNavItem href="/hui" icon={Calendar} label="Hụi" />
          <BottomNavItem href="/members" icon={UserPlus} label="Thành viên" />
          <BottomNavItem href="/profile" icon={User} label="Cá nhân" />
        </div>
      </nav>

      {showMenu && <SideMenu onClose={() => setShowMenu(false)} onNavigate={handleNavigate} />}
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
    </div>
  );
}
