// src/app/payments/create/page.jsx
'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createPayment } from '@/store/paymentSlice'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export default function CreatePaymentPage() {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    huiId: '',
    memberId: '',
    amount: '',
    type: 'CONTRIBUTION',
    status: 'PENDING',
    dueDate: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(createPayment(formData))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Tạo thanh toán mới</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn hụi</label>
            <Select
              value={formData.huiId}
              onChange={(e) => setFormData({ ...formData, huiId: e.target.value })}
            >
              <option value="">Chọn hụi</option>
              {/* Add hui options here */}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn thành viên</label>
            <Select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            >
              <option value="">Chọn thành viên</option>
              {/* Add member options here */}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số tiền</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại thanh toán</label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="CONTRIBUTION">Đóng hụi</option>
              <option value="WITHDRAWAL">Rút hụi</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PENDING">Chờ xử lý</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày đến hạn</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
          <Button type="submit">Tạo thanh toán</Button>
        </form>
      </div>
    </Layout>
  )
}