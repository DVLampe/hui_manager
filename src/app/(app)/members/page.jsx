'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';

export default function MembersPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembersData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch('/api/members');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data.members || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembersData();
  }, [isAuthenticated]);

  if (status === 'loading' || (isAuthenticated && loading)) {
    return <Loading message="Đang tải danh sách thành viên..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p>Vui lòng đăng nhập để xem danh sách thành viên.</p>
        <Link href="/auth/signin" className="mt-4 inline-block">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
        <Link href="/members/create" passHref>
          <Button>Thêm thành viên</Button>
        </Link>
      </div>
      {members.length === 0 ? (
        <div className="text-center py-4">Không có thành viên nào để hiển thị.</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id}>
                <Link href={`/members/${member.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {member.user?.name || 'N/A'}
                        </p>
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
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
