'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HuiDetailPageContent from '@/components/hui/HuiDetailPageContent';

const GUEST_SESSION = { user: { id: 'guest', name: 'Khách', role: 'GUEST' } };

export default function PublicHuiPage() {
  const params = useParams();
  const { publicId } = params;
  const { data: session, status } = useSession();
  const [hui, setHui] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) return;
    fetch(`/api/public/hui/${publicId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy hụi hoặc link đã hết hạn');
        return res.json();
      })
      .then(data => { setHui(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [publicId]);

  if (loading || status === 'loading') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className="text-center text-gray-600">Đang tải thông tin chi tiết hụi, vui lòng chờ...</div>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!hui) return <div className="p-4 text-gray-600">Không tìm thấy thông tin hụi.</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <HuiDetailPageContent
        huiData={hui}
        session={session || GUEST_SESSION}
        isGuestView={true}
        huiId={hui.id}
      />
    </div>
  );
}

