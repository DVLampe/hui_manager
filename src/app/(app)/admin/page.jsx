'use client'
import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Link from 'next/link'
import { useToast, Toaster } from '@/components/ui/Toaster';

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const formatDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    return new Date(isoDateString).toLocaleDateString('vi-VN');
};

export default function AdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/users?search=${debouncedSearchQuery}`);
      setUsers(response.data);
    } catch (error) {
      setError('Không thể tải danh sách người dùng');
      showToast({ message: 'Lỗi: Không thể tải danh sách người dùng', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa người dùng này?')) return;

    try {
      // We use the DELETE endpoint which logically deactivates the user
      await axios.delete(`/api/users/${userId}`);
      // Optimistically update the UI or refetch
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: false } : user
      ));
      showToast({ message: 'Người dùng đã được vô hiệu hóa.', type: 'success' });
    } catch (error) {
      setError(error.response?.data?.error || 'Không thể vô hiệu hóa người dùng');
      showToast({ message: `Lỗi: ${error.response?.data?.error || 'Không thể vô hiệu hóa người dùng'}`, type: 'error' });
    }
  }
  
    const handleReactivateUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn kích hoạt lại người dùng này?')) return;

    try {
      // We use the PUT endpoint to update the user's status
      await axios.put(`/api/users/${userId}`, { isActive: true });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: true } : user
      ));
      showToast({ message: 'Người dùng đã được kích hoạt lại.', type: 'success' });
    } catch (error) {
      setError(error.response?.data?.error || 'Không thể kích hoạt lại người dùng');
      showToast({ message: `Lỗi: ${error.response?.data?.error || 'Không thể kích hoạt lại người dùng'}`, type: 'error' });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý người dùng</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm theo email hoặc số điện thoại..."
          className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4">Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="text-center py-4 text-red-500">{error}</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.isActive ? (
                      <button onClick={() => handleDeactivateUser(user.id)} className="text-red-600 hover:text-red-900">
                        Vô hiệu hóa
                      </button>
                    ) : (
                      <button onClick={() => handleReactivateUser(user.id)} className="text-green-600 hover:text-green-900">
                        Kích hoạt
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
