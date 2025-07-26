// src/app/admin/roles/page.jsx
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRoles } from '@/store/roleSlice'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/Button'

export default function AdminRolesPage() {
  const dispatch = useDispatch()
  const { items: roles, status, error } = useSelector((state) => state.roles)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRoles())
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý vai trò</h1>
          <Button onClick={() => window.location.href = '/admin/roles/create'}>
            Thêm vai trò
          </Button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {roles.map((role) => (
              <li key={role.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {role.name}
                      </p>
                      <p className="ml-2 text-sm text-gray-500">
                        ({role.code})
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {role.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {role.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Số người dùng: {role.userCount}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full lg:w-4/5">
        {/* Контент */}
      </div>
    </Layout>
  )
}