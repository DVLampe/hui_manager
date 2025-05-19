// src/app/members/create/page.jsx
'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createMember } from '@/store/memberSlice'
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

export default function CreateMemberPage() {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    userId: '',
    huiId: '',
    status: 'ACTIVE'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(createMember(formData))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Thêm thành viên mới</h1>
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
            <label className="block text-sm font-medium text-gray-700">Chọn người dùng</label>
            <Select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            >
              <option value="">Chọn người dùng</option>
              {/* Add user options here */}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </Select>
          </div>
          <Button type="submit">Thêm thành viên</Button>
        </form>
      </div>
    </Layout>
  )
}