// src/app/(app)/hui/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { HuiCard } from '@/components/hui/HuiCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function HuiPage() {
  // 1. Local state management for this component
  const [huis, setHuis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []); // The empty dependency array `[]` means this effect runs only once

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
        {/* The user is guaranteed to be authenticated here because of middleware */}
          <Link href="/hui/create"><Button variant="primary">Tạo Hụi Mới</Button></Link>
      </div>

      {huis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {huis.map(hui => (
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

