'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import HuiDetailPageContent from '@/components/hui/HuiDetailPageContent';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

export default function SharedHuiPage({ params }) {
  const { token } = params;
  const [hui, setHui] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (token) {
      const fetchHuiData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/share/hui/${token}`);
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to fetch shared hui data.');
          }
          const data = await response.json();
          setHui(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchHuiData();
    }
  }, [token]);

  if (loading || status === 'loading') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <Loading message="Đang tải thông tin chi tiết hụi, vui lòng chờ..." />
      </div>
    );
  }

  if (error) {
    return <div className="p-4"><Alert type="error" message={error} /></div>;
  }

  if (!hui) {
    return <div className="p-4"><Alert type="warning" message="Không tìm thấy thông tin hụi." /></div>;
  }

  // We pass a "guest" session to the detail page content
  const guestSession = {
    user: {
      id: 'guest',
      name: 'Guest',
      role: 'GUEST',
    },
  };

  return (
    <HuiDetailPageContent
      huiData={hui}
      session={session || guestSession} // Use real session if available, otherwise guest
      isGuestView={true}
      huiId={hui.id}
    />
  );
}
