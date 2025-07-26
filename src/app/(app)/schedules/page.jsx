// src/app/schedules/page.jsx (Trang lịch thanh toán)
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchedules } from '@/store/scheduleSlice'
import { Layout } from '@/components/shared/Layout'
import { ScheduleCalendar } from '@/components/schedules/ScheduleCalendar'

export default function SchedulesPage() {
  const dispatch = useDispatch()
  const { items: schedules, status, error } = useSelector((state) => state.schedules)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSchedules())
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
        <h1 className="text-2xl font-bold">Lịch thanh toán</h1>
      </div>
      <ScheduleCalendar schedules={schedules} />
    </Layout>
  )
}