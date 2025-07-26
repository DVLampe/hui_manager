'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import RequireAuth from '@/components/auth/RequireAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER'
  })

  // Fetch danh sách người dùng
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data)
    } catch (error) {
      setError('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý thêm người dùng mới
  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/users', formData)
      setUsers([...users, response.data])
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'USER'
      })
      setShowAddForm(false)
    } catch (error) {
      setError(error.response?.data?.error || 'Không thể thêm người dùng mới')
    }
  }

  // Xử lý cập nhật người dùng
  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`/api/users/${editingUser.id}`, formData)
      setUsers(users.map(user => 
        user.id === editingUser.id ? response.data : user
      ))
      setEditingUser(null)
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'USER'
      })
    } catch (error) {
      setError(error.response?.data?.error || 'Không thể cập nhật người dùng')
    }
  }

  // Xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
      await axios.delete(`/api/users/${userId}`)
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      setError(error.response?.data?.error || 'Không thể xóa người dùng')
    }
  }

  if (loading) return <div>Đang tải...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="container mx-auto">
      <div className="w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Permissions</h2>
            {/* ... */}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Other Info</h2>
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  )
}