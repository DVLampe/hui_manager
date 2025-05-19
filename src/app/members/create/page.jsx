// src/app/members/create/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createMember, resetCreateStatus } from '@/store/memberSlice'
import { fetchHuis } from '@/store/huiSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Link from 'next/link'
import axios from 'axios'

export default function CreateMemberPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const huiIdFromUrl = searchParams.get('huiId')
  
  const { huis } = useSelector(state => state.hui)
  const { createStatus, createError } = useSelector(state => state.member)
  const { isAuthenticated } = useSelector(state => state.auth)
  
  const [formData, setFormData] = useState({
    userId: '',
    huiId: huiIdFromUrl || '',
    status: 'ACTIVE'
  })
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch huis on component mount
  useEffect(() => {
    dispatch(fetchHuis())
  }, [dispatch])
  
  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const response = await axios.get('/api/users')
        setUsers(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])
  
  // Handle successful member creation
  useEffect(() => {
    if (createStatus === 'succeeded') {
      router.push('/members')
      dispatch(resetCreateStatus())
    }
  }, [createStatus, router, dispatch])

  // Update huiId when URL parameter changes
  useEffect(() => {
    if (huiIdFromUrl) {
      setFormData(prev => ({ ...prev, huiId: huiIdFromUrl }))
    }
  }, [huiIdFromUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(createMember(formData))
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-6 text-center">
          <p className="mb-4">Bạn cần đăng nhập để thêm thành viên</p>
          <Link href="/auth/signin">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Thêm thành viên mới</h1>
        
        {createError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {createError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn hụi</label>
            <Select
              value={formData.huiId}
              onChange={(e) => setFormData({ ...formData, huiId: e.target.value })}
            >
              <option value="">Chọn hụi</option>
              {huis && huis.map(hui => (
                <option key={hui.id} value={hui.id}>
                  {hui.name} - {hui.amount.toLocaleString()}đ
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn người dùng</label>
            <Select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              disabled={loading}
            >
              <option value="">Chọn người dùng</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </Select>
            {loading && <p className="text-sm text-gray-500 mt-1">Đang tải danh sách người dùng...</p>}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createStatus === 'loading' || !formData.huiId || !formData.userId}
            >
              {createStatus === 'loading' ? 'Đang thêm...' : 'Thêm thành viên'}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              className="flex-1"
              onClick={() => router.back()}
            >
              Hủy bỏ
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}