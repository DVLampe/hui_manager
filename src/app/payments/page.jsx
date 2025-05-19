// src/app/payments/page.jsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPayments } from '@/store/paymentSlice'
import Layout from '@/components/shared/Layout'
import PaymentList from '@/components/payments/PaymentList'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function PaymentsPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { items: payments, status, error } = useSelector((state) => state.payments)
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  useEffect(() => {
    // If not authenticated, don't bother making the API call
    if (status === 'idle' && isAuthenticated) {
      dispatch(fetchPayments())
    }
  }, [status, dispatch, isAuthenticated])
  // Check if the user is not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-bold text-red-600 mb-4">Vui lòng đăng nhập để xem danh sách thanh toán</h2>
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
  
  if (status === 'loading') {
    return <Layout><div className="flex justify-center py-8">Đang tải...</div></Layout>
  }

  if (status === 'failed') {
    return (
      <Layout>
        <div className="text-red-600 py-4">
          <p><strong>Lỗi:</strong> {error}</p>
          <p className="mt-2">Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
        <Button onClick={() => router.push('/payments/create')}>
          Tạo thanh toán mới
        </Button>
      </div>
      <PaymentList payments={payments} />
    </Layout>
  )
}