
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Notification() {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Kiểm tra lịch trình mỗi phút
    const interval = setInterval(checkSchedules, 60000)
    checkSchedules() // Kiểm tra ngay khi component mount

    return () => clearInterval(interval)
  }, [])

  const checkSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules', {
        params: {
          status: 'due',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 ngày tới
        }
      })

      setNotifications(response.data.map(schedule => ({
        id: schedule.id,
        message: `Hụi "${schedule.huiGroup.name}" đến hạn đóng tiền vào ngày ${new Date(schedule.date).toLocaleDateString('vi-VN')}`,
        amount: schedule.amount
      })))
    } catch (error) {
      console.error('Error checking schedules:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Thông báo</h3>
            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className="p-2 bg-yellow-50 rounded"
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-sm font-medium">
                    Số tiền: {notification.amount.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}