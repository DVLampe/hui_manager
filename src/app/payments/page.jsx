// src/app/payments/page.jsx
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPayments } from '@/store/paymentSlice'
import { Layout } from '@/components/shared/Layout'
import { PaymentList } from '@/components/payments/PaymentList'
import { Button } from '@/components/ui/Button'

export default function PaymentsPage() {
  const dispatch = useDispatch()
  const { items: payments, status, error } = useSelector((state) => state.payments)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPayments())
    }
  }, [status, dispatch])

  if (status === 'loading') {
    return <Layout><div>Đang tải...</div></Layout>
  }

  if (status === 'failed') {
    return <Layout><div>Lỗi: {error}</div></Layout>
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
        <Button onClick={() => window.location.href = '/payments/create'}>
          Tạo thanh toán mới
        </Button>
      </div>
      <PaymentList payments={payments} />
    </Layout>
  )
}