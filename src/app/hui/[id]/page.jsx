// src/app/hui/[id]/page.jsx
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHuiById } from '@/store/huiSlice'
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import MemberList from '@/components/members/MemberList'
import PaymentList from '@/components/payments/PaymentList'
import Link from 'next/link'

export default function HuiDetailPage({ params }) {
  const dispatch = useDispatch()
  const { selectedHui, status, error } = useSelector((state) => state.hui) // Changed from state.huis to state.hui

  useEffect(() => {
    dispatch(fetchHuiById(params.id))
  }, [dispatch, params.id])

  if (status === 'loading') {
    return <Layout><div>Đang tải...</div></Layout>
  }

  if (status === 'failed') {
    return <Layout><div>Lỗi: {error}</div></Layout>
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Thông tin hụi
            </h3>
            <div className="mt-4 flex space-x-3">
                <Link href={`/hui/${params.id}/edit`}> {/* Assuming an edit page */} 
                    <Button variant="outline">Chỉnh sửa</Button>
                </Link>
                <Button variant="danger" onClick={() => alert('Chức năng xóa chưa được cài đặt')}>Xóa</Button>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tên hụi</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedHui?.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedHui?.description}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Số tiền</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedHui?.amount.toLocaleString()}đ
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(selectedHui?.startDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Ngày kết thúc</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(selectedHui?.endDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {selectedHui?.status}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Danh sách thành viên</h2>
            <Button onClick={() => window.location.href = `/members/create?huiId=${selectedHui?.id}`}>
              Thêm thành viên
            </Button>
          </div>
          <MemberList members={selectedHui?.members || []} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Lịch sử thanh toán</h2>
            <Button onClick={() => window.location.href = `/payments/create?huiId=${selectedHui?.id}`}>
              Thêm thanh toán
            </Button>
          </div>
          <PaymentList payments={selectedHui?.payments || []} />
        </div>
      </div>
    </Layout>
  )
}