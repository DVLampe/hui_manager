// src/app/members/page.jsx
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMembers } from '@/store/memberSlice'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/Button'

export default function MembersPage() {
  const dispatch = useDispatch()
  const { items: members, status, error } = useSelector((state) => state.members)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMembers())
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
        <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
        <Button onClick={() => window.location.href = '/members/create'}>
          Thêm thành viên
        </Button>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id}>
              <a href={`/members/${member.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {member.user.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {member.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Tham gia: {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}