// src/app/hui/page.jsx (Trang danh sách hụi)
'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHuis } from '@/store/huiSlice';
import HuiCard from '@/components/ui/HuiCard';
import Button from '@/components/ui/Button';
import Link from 'next/link'; // Import Link
import Loading from '@/components/ui/Loading'; // Assuming you have a Loading component
import Alert from '@/components/ui/Alert'; // Assuming you have an Alert component

export default function HuiPage() {
  const dispatch = useDispatch();
  const { huis, loading, error } = useSelector((state) => state.hui);
  const { isAuthenticated, user } = useSelector((state) => state.auth); // Get auth state

  useEffect(() => {
    // Only fetch if authenticated, or adjust based on your app's logic
    if (isAuthenticated) {
      dispatch(fetchHuis());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert type="warning" message="Bạn cần đăng nhập để xem danh sách hụi." />
        <Link href="/auth/signin" className="mt-4 inline-block"><Button>Đăng nhập</Button></Link>
      </div>
    );
  }

  if (loading) {
    return <Loading message="Đang tải danh sách hụi..." />;
  }

  if (error) {
    return <Alert type="error" message={`Lỗi tải danh sách hụi: ${error}`} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Danh sách Hụi</h1>
        {/* Optionally, only show Create button if user has permission (e.g., is a manager or admin) */}
        {isAuthenticated && (
          <Link href="/hui/create"><Button variant="primary">Tạo Hụi Mới</Button></Link>
        )}
      </div>

      {huis && huis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {huis.map(hui => (
            <HuiCard key={hui.id} hui={hui} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Chưa có hụi nào được tạo.</p>
          {isAuthenticated && (
            <Link href="/hui/create" className="mt-4 inline-block"><Button variant="secondary">Tạo Hụi Đầu Tiên</Button></Link>
          )}
        </div>
      )}
    </div>
  );
}