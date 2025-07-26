// src/app/payments/create/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { createPayment, resetCreateStatus } from '@/store/paymentSlice'
import { fetchHuis } from '@/store/huiSlice'
import axios from 'axios'
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Link from 'next/link'

export default function CreatePaymentPage() {  
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { huis } = useSelector(state => state.hui)
  const { createStatus, createError } = useSelector(state => state.payments)
  const { isAuthenticated } = useSelector(state => state.auth)
  
  const [formData, setFormData] = useState({
    groupId: searchParams.get('huiId') || '',
    memberId: '',
    amount: '',
    type: 'CONTRIBUTION',
    status: 'PENDING',
    dueDate: new Date().toISOString().split('T')[0],
    cycle: 1
  })
  
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch huis on component mount
  useEffect(() => {
    dispatch(fetchHuis())
  }, [dispatch])

  // Fetch members when hui/group is selected
  useEffect(() => {
    async function fetchMembers() {
      if (!formData.groupId) {
        setMembers([])
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await axios.get(`/api/hui/${formData.groupId}/members`)
        setMembers(response.data)
      } catch (err) {
        console.error('Failed to fetch members:', err)
        setError('Failed to load members')
      } finally {
        setLoading(false)
      }
    }
    
    fetchMembers()
  }, [formData.groupId])

  // Handle create payment success/error
  useEffect(() => {
    if (createStatus === 'succeeded') {
      alert('Payment created successfully')
      dispatch(resetCreateStatus())
      router.push('/payments')
    }
  }, [createStatus, dispatch, router])

  // Automatically set amount from selected hui
  useEffect(() => {
    if (formData.groupId && huis) {
      const selectedHui = huis.find(hui => hui.id === formData.groupId)
      if (selectedHui?.amount) {
        setFormData(prev => ({...prev, amount: selectedHui.amount}))
      }
    }
  }, [formData.groupId, huis])

  // If not authenticated, show a message and redirect options
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-bold text-red-600 mb-4">Vui lòng đăng nhập để tạo thanh toán mới</h2>
          <div className="flex space-x-4">
            <Link href="/auth/signin">
              <Button>Đăng nhập</Button>
            </Link>
            <Link href="/auth/singup">
              <Button variant="outline">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(createPayment(formData))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Tạo thanh toán mới</h1>
        <form onSubmit={handleSubmit} className="space-y-6">          <div>            <label className="block text-sm font-medium text-gray-700">Chọn hụi</label>
            <Select
              value={formData.groupId}
              onChange={(e) => setFormData({ 
                ...formData, 
                groupId: e.target.value,
                memberId: '' // Reset member when hui changes
              })}
              disabled={loading}
            >
              <option value="">Chọn hụi</option>
              {huis?.map(hui => (
                <option key={hui.id} value={hui.id}>
                  {hui.name} ({hui.amount?.toLocaleString()}đ)
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn thành viên</label>
            <Select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              disabled={!formData.groupId || loading}
            >
              <option value="">Chọn thành viên</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.user?.name || member.userId}
                </option>
              ))}
            </Select>
            {loading && <p className="text-sm text-gray-500 mt-1">Đang tải...</p>}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
          </div>          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Kỳ</label>
            <Input
              type="number"
              value={formData.cycle}
              onChange={(e) => setFormData({ ...formData, cycle: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <Input
              type="text"
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Ghi chú (tùy chọn)"
            />
          </div>
          {createError && (
            <div className="text-red-500 text-sm mt-2">{createError}</div>
          )}
          <Button 
            type="submit" 
            disabled={createStatus === 'loading' || !formData.groupId || !formData.memberId}
          >
            {createStatus === 'loading' ? 'Đang xử lý...' : 'Tạo thanh toán'}
          </Button>
        </form>
      </div>
    </Layout>
  )
}