// src/app/members/page.jsx
'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers } from '@/store/memberSlice';
import Layout from '@/components/shared/Layout'; // Changed back to named import
import Button from '@/components/ui/Button';   // Changed back to named import
import Link from 'next/link';

export default function MembersPage() {
  const dispatch = useDispatch();

  const {
    members = [],
    loading,
    error: fetchError
  } = useSelector((state) => state.member);

  const [initialFetchTriggered, setInitialFetchTriggered] = useState(false);

  let currentStatus = 'idle';
  if (loading) {
    currentStatus = 'loading';
  } else if (fetchError) {
    currentStatus = 'failed';
  } else if (initialFetchTriggered) {
    currentStatus = 'succeeded';
  }

  useEffect(() => {
    if (!initialFetchTriggered && !loading && !fetchError) {
      dispatch(fetchMembers(undefined));
      setInitialFetchTriggered(true);
    }
  }, [dispatch, initialFetchTriggered, loading, fetchError]);

  if (currentStatus === 'loading') {
    return <Layout><div>Đang tải...</div></Layout>;
  }

  if (currentStatus === 'failed') {
    return <Layout><div>Lỗi: {typeof fetchError === 'object' ? fetchError.message || JSON.stringify(fetchError) : String(fetchError)}</div></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
        <Link href="/members/create" passHref>
          <Button>Thêm thành viên</Button>
        </Link>
      </div>
      {currentStatus === 'succeeded' && members.length === 0 && (
        <div className="text-center py-4">Không có thành viên nào để hiển thị.</div>
      )}
      {currentStatus === 'succeeded' && members.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id}>
                <Link href={`/members/${member.id}`} passHref>
                  <a className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {member.user?.name || 'N/A'}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            member.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {member.user?.email || 'N/A'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Tham gia: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}
