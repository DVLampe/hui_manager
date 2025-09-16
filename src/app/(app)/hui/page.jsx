// src/app/(app)/hui/page.jsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { HuiCard } from '@/components/hui/HuiCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';

export default function HuiPage() {
  // 1. Local state management for this component
  const [huis, setHuis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  // 2. Data fetching logic
  useEffect(() => {
    // This function will be called once when the component mounts
    const fetchHuis = async () => {
      try {
        setLoading(true); // Start loading
        setError(null);   // Reset previous errors

        // Fetch data from our secured API endpoint
        const response = await fetch('/api/hui');

        // Handle non-successful responses
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Не удалось загрузить данные');
        }

        // On success, parse the JSON and update the state
        const data = await response.json();
        setHuis(data);

      } catch (err) {
        // If any error occurs, update the error state
        setError(err.message);
      } finally {
        // Stop loading, regardless of success or error
        setLoading(false);
      }
    };

    fetchHuis();
  }, []);

  const filteredAndSortedHuis = useMemo(() => {
    return huis
      .filter(hui => statusFilter === 'all' || hui.status === statusFilter)
      .sort((a, b) => {
        const dateA = a.nextPaymentDate ? new Date(a.nextPaymentDate) : 0;
        const dateB = b.nextPaymentDate ? new Date(b.nextPaymentDate) : 0;
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
  }, [huis, statusFilter, sortOrder]);

  // 3. Conditional UI rendering based on the local state
  if (loading) {
    return <Loading message="Đang tải danh sách hụi..." />;
  }

  if (error) {
    return <Alert type="error" message={`Lỗi tải danh sách hụi: ${error}`} />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Hụi</h1>
          <Link href="/hui/create"><Button variant="primary">Tạo Hụi Mới</Button></Link>
      </div>

      <div className="flex justify-end items-center mb-4 space-x-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="PENDING">Đang chờ</option>
          <option value="CLOSED">Đã đóng</option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-48"
        >
          <option value="asc">Thanh toán kế tiếp: Gần nhất</option>
          <option value="desc">Thanh toán kế tiếp: Xa nhất</option>
        </Select>
      </div>

      {filteredAndSortedHuis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedHuis.map(hui => (
            <HuiCard key={hui.id} hui={hui} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">Bạn chưa tham gia hoặc quản lý hụi nào.</p>
            <Link href="/hui/create" className="mt-4 inline-block"><Button variant="secondary">Tạo Hụi Đầu Tiên</Button></Link>
        </div>
      )}
    </div>
  );
}
