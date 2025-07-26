// src/app/admin/roles/create/page.jsx
'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createRole } from '@/store/roleSlice'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export default function CreateRolePage() {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    permissions: []
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(createRole(formData))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Thêm vai trò mới</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên vai trò</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã vai trò</label>
            <Input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Quyền hạn</label>
            <div className="mt-2 space-y-2">
              {['CREATE', 'READ', 'UPDATE', 'DELETE'].map((permission) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onChange={(e) => {
                      const newPermissions = e.target.checked
                        ? [...formData.permissions, permission]
                        : formData.permissions.filter(p => p !== permission)
                      setFormData({ ...formData, permissions: newPermissions })
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={permission} className="ml-2 block text-sm text-gray-900">
                    {permission}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit">Thêm vai trò</Button>
        </form>
      </div>
    </Layout>
  )
}