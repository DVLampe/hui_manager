// src/app/reports/page.jsx
'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReports } from '@/store/reportSlice'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ReportsPage() {
  const dispatch = useDispatch()
  const { items: reports, status, error } = useSelector((state) => state.reports)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(fetchReports(dateRange))
  }

  if (status === 'loading') {
    return <Layout><div>Đang tải...</div></Layout>
  }

  if (status === 'failed') {
    return <Layout><div>Lỗi: {error}</div></Layout>
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Báo cáo</h1>
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
            <Button type="submit">Xem báo cáo</Button>
          </form>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tổng quan
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tổng số hụi</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {reports.totalHuis}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tổng số tiền đã đóng</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {reports.totalPaid.toLocaleString()}đ
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Số tiền cần đóng</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {reports.totalDue.toLocaleString()}đ
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  )
}