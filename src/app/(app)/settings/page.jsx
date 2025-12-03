'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { Bell, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/Toaster'
import Loading from '@/components/ui/Loading'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { showToast } = useToast()
  
  const [settings, setSettings] = useState({
    notifyPaymentDue: true,
    notifyGeneral: true,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/user/settings')
        if (res.ok) {
          const data = await res.json()
          // If data is empty object (first time), default to true
          setSettings({
            notifyPaymentDue: data.notifyPaymentDue !== undefined ? data.notifyPaymentDue : true,
            notifyGeneral: data.notifyGeneral !== undefined ? data.notifyGeneral : true,
          })
        }
      } catch (error) {
        console.error("Failed to load settings", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (res.ok) {
        showToast({ message: "Đã lưu cài đặt thông báo.", type: 'success' })
      } else {
        showToast({ message: "Lỗi lưu cài đặt.", type: 'error' })
      }
    } catch (err) {
      showToast({ message: "Lỗi kết nối.", type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cài đặt</h1>
        <p className="text-gray-500 mt-1">Quản lý tùy chọn thông báo của bạn</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cài đặt thông báo</h2>
              <p className="text-sm text-gray-500">Chọn cách bạn muốn nhận thông báo từ hệ thống</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Nhắc nhở đóng tiền</p>
                <p className="text-sm text-gray-500">Thông báo trước khi đến hạn đóng hụi</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notifyPaymentDue} 
                onChange={() => handleToggle('notifyPaymentDue')} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Thông báo</p>
                <p className="text-sm text-gray-500">Thông báo về tin nhắn, thêm vào nhóm, cập nhật khác</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notifyGeneral} 
                onChange={() => handleToggle('notifyGeneral')} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  )
}
