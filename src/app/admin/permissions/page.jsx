// src/app/admin/permissions/page.jsx
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPermissions } from '@/store/permissionSlice'
import { Button } from '@/components/ui/Button'

export function Layout({ children }) {
  return (
    <div className="w-full mx-auto"> {/* Используйте w-full и mx-auto */}
      {children}
    </div>
  );
}

export default function AdminPermissionsPage() {
  const dispatch = useDispatch()
  const { items: permissions, status, error } = useSelector((state) => state.permissions)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPermissions())
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
          <h1 className="text-2xl font-bold">Quản lý quyền hạn</h1>
          <Button onClick={() => window.location.href = '/admin/permissions/create'}>
            Thêm quyền hạn
          </Button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {permissions.map((permission) => (
              <li key={permission.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {permission.name}
                      </p>
                      <p className="ml-2 text-sm text-gray-500">
                        ({permission.code})
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {permission.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {permission.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Số vai trò: {permission.roleCount}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  )
}