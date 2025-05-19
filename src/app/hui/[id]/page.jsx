// src/app/hui/[id]/page.jsx
'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHuiById } from '@/store/huiSlice'
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import MemberList from '@/components/members/MemberList'
import PaymentList from '@/components/payments/PaymentList'
import PaymentScheduleTable from '@/components/payments/PaymentScheduleTable'
import Link from 'next/link'
import { 
  CalendarIcon, 
  UserIcon, 
  BanknotesIcon, 
  ChartBarIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

export default function HuiDetailPage({ params }) {
  const dispatch = useDispatch()
  const { selectedHui, status, error } = useSelector((state) => state.hui)
  const [activeTab, setActiveTab] = useState('info') // 'info', 'members', 'payments', 'schedules'

  useEffect(() => {
    dispatch(fetchHuiById(params.id))
  }, [dispatch, params.id])

  if (status === 'loading') {
    return <Layout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    </Layout>
  }

  if (status === 'failed') {
    return <Layout>
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <div className="flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>Lỗi: {error}</p>
        </div>
      </div>
    </Layout>
  }

  // Calculate total number of rounds based on members count
  const totalRounds = selectedHui?.totalMembers || 0;
  
  // Count completed payments
  const completedPayments = selectedHui?.payments?.length || 0;
  
  // Calculate progress percentage
  const progressPercentage = totalRounds > 0 ? (completedPayments / totalRounds) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{selectedHui?.name}</h1>
          <div className="flex space-x-3">
            <Link href={`/hui/${params.id}/edit`}>
              <Button variant="outline" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </Button>
            </Link>
            <Button 
              variant="danger" 
              className="flex items-center"
              onClick={() => alert('Chức năng xóa chưa được cài đặt')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Số tiền mỗi kỳ</p>
                <p className="text-xl font-bold text-gray-800">{selectedHui?.amount?.toLocaleString()}đ</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Số thành viên</p>
                <p className="text-xl font-bold text-gray-800">{selectedHui?.members?.length || 0}/{selectedHui?.totalMembers || 0}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-200" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Chu kỳ</p>
                <p className="text-xl font-bold text-gray-800">{selectedHui?.cycle || 1} tháng</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <p className="text-xl font-bold text-gray-800 flex items-center">
                  {selectedHui?.status === 'ACTIVE' ? 
                    <><span className="text-green-500 mr-1">●</span> Đang hoạt động</> : 
                    <><span className="text-yellow-500 mr-1">●</span> {selectedHui?.status}</>
                  }
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Tiến độ</p>
            <p className="text-sm font-semibold">{completedPayments}/{totalRounds} kỳ</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thành viên
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedules'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch thanh toán
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử thanh toán
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                      {selectedHui?.description || "Không có mô tả"}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Số tiền mỗi kỳ</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedHui?.amount?.toLocaleString()}đ
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedHui?.startDate ? new Date(selectedHui.startDate).toLocaleDateString() : "Chưa thiết lập"}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc (dự kiến)</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedHui?.endDate ? new Date(selectedHui.endDate).toLocaleDateString() : "Chưa thiết lập"}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Chu kỳ</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedHui?.cycle || 1} tháng
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Người quản lý</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedHui?.manager?.name || "N/A"}
                      {selectedHui?.manager?.email && ` (${selectedHui.manager.email})`}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Quy định</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedHui?.rules ? (
                        <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded">
                          {typeof selectedHui.rules === 'string' 
                            ? selectedHui.rules 
                            : JSON.stringify(selectedHui.rules, null, 2)
                          }
                        </pre>
                      ) : "Không có quy định đặc biệt"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Danh sách thành viên</h2>
                <Button onClick={() => window.location.href = `/members/create?huiId=${selectedHui?.id}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm thành viên
                </Button>
              </div>
              <MemberList members={selectedHui?.members || []} />
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Lịch thanh toán và đấu giá</h2>
                <Button onClick={() => alert('Chức năng thêm kỳ thanh toán chưa được cài đặt')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm kỳ
                </Button>
              </div>
              <PaymentScheduleTable 
                payments={selectedHui?.payments} 
                schedules={selectedHui?.schedules} 
                members={selectedHui?.members} 
                amount={selectedHui?.amount} 
              />
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Lịch sử thanh toán</h2>
                <Button onClick={() => window.location.href = `/payments/create?huiId=${selectedHui?.id}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm thanh toán
                </Button>
              </div>
              <PaymentList payments={selectedHui?.payments || []} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}