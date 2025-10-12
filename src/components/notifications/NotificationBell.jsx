'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const router = useRouter();
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelRef]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}`, { method: 'PUT' });
        fetchNotifications(); // Refresh list
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    setIsOpen(false);
    // Navigate
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'unread' ? !n.isRead : true);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-600 hover:text-gray-800">
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={panelRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-20 border border-gray-200"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Thông báo</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="text-sm text-indigo-600 hover:underline font-semibold">
                  Đánh dấu tất cả là đã đọc
                </button>
              )}
            </div>
            <div className="mt-4 flex space-x-4">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm font-semibold rounded-full ${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm font-semibold rounded-full ${filter === 'unread' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Chưa đọc
              </button>
            </div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <li key={n.id} onClick={() => handleNotificationClick(n)}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">{n.title}</span>
                        <span className="text-gray-600"> - {n.message}</span>
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.isRead && (
                      <div className="ml-3">
                        <span className="block h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-sm text-gray-500">
                {filter === 'unread' ? 'Không có thông báo chưa đọc.' : 'Bạn không có thông báo nào.'}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
