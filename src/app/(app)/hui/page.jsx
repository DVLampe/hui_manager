// src/app/(app)/hui/page.jsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { HuiCard } from '@/components/hui/HuiCard';
import MobileHuiCard from '@/components/mobile/MobileHuiCard';
import { useIsMobile } from '@/lib/hooks';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';
import { Plus, Filter, ArrowUpDown, Users, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HuiPage() {
  const router = useRouter();
  const [huis, setHuis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('nearest');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

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
          throw new Error(errorData.message || 'Không tải được dữ liệu.');
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
      .filter(hui => {
        const statusMatch = statusFilter === 'all' || hui.status === statusFilter;
        const searchMatch = hui.name.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
      })
      .sort((a, b) => {
        const dateA = a.nextPaymentDate ? new Date(a.nextPaymentDate) : 0;
        const dateB = b.nextPaymentDate ? new Date(b.nextPaymentDate) : 0;
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
  }, [huis, statusFilter, sortOrder, searchTerm]);

  // 3. Conditional UI rendering based on the local state
  if (loading) {
    return <Loading message="Đang tải danh sách hụi..." />;
  }

  if (error) {
    return <Alert type="error" message={`Lỗi tải danh sách hụi: ${error}`} />;
  }

  if (isMobile) {
    return (
      <div className="pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button className="p-2 bg-gray-50 rounded-lg border border-gray-200">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm hụi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAndSortedHuis.map(hui => (
            <MobileHuiCard key={hui.id} hui={hui} />
          ))}
        </div>

        <Link href="/hui/create">
          <button className="fixed bottom-20 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-40">
            <Plus className="w-7 h-7" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh sách Hụi</h1>
          <p className="text-gray-500 mt-1">Quản lý tất cả các hụi của bạn</p>
        </div>
        <Link href="/hui/create">
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl font-medium">
            <Plus className="w-5 h-5" />
            Tạo Hụi Mới
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="PENDING">Đang chờ</option>
            <option value="COMPLETED">Đã đóng</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-gray-500" />
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="nearest">Gần nhất</option>
            <option value="farthest">Xa nhất</option>
          </select>
        </div>
      </div>

      {filteredAndSortedHuis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSortedHuis.map(hui => (
            <HuiCard key={hui.id} hui={hui} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Bạn chưa tham gia hoặc quản lý hụi nào</h3>
          <p className="text-gray-500 mb-6">Tạo hụi đầu tiên của bạn để bắt đầu</p>
          <Link href="/hui/create">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Tạo Hụi Đầu Tiên
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
