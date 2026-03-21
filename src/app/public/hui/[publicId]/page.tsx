'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Prisma } from '@prisma/client';

type HuiGroupWithDetails = Prisma.HuiGroupGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      };
    };
    payments: {
      include: {
        potTakerMember: true;
        memberContributions: true;
      };
    };
    chatRoom: {
      include: {
        messages: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>;

export default function PublicHuiPage() {
  const params = useParams();
  const { publicId } = params;
  const [hui, setHui] = useState<HuiGroupWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    if (publicId) {
      fetch(`/api/public/hui/${publicId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Hui not found or access denied');
          }
          return res.json();
        })
        .then((data) => {
          setHui(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [publicId]);

  useEffect(() => {
    // Generate a unique guest name
    const storedGuestName = localStorage.getItem(`guestName_${publicId}`);
    if (storedGuestName) {
      setGuestName(storedGuestName);
    } else {
      const newGuestName = `Khách ${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem(`guestName_${publicId}`, newGuestName);
      setGuestName(newGuestName);
    }
  }, [publicId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!hui) {
    return <div>Hui not found.</div>;
  }

  const handleHotHui = () => {
    alert('Chỉ chủ hụi và người quản lý có quyền hốt hụi.');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{hui.name}</h1>

      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'info' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Thông tin chi tiết
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'members' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Danh sách thành viên
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'payment-schedule' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('payment-schedule')}
        >
          Lịch thanh toán
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'payment-details' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('payment-details')}
        >
          Lịch chi tiết
        </button>
      </div>

      <div className="mt-4">
        {/* Render tab content based on activeTab */}
        <p>Content for {activeTab}</p>
      </div>

      <div>
        <button onClick={handleHotHui}>Hốt hụi</button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Group Chat</h2>
        {/* Chat implementation */}
        <p>Welcome, {guestName}</p>
      </div>
    </div>
  );
}
