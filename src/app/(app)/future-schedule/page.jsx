'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function FutureSchedulePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/future-schedule');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch future schedules');
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [isAuthenticated]);

  let content;

  if (status === 'loading' || (isAuthenticated && loading)) {
    content = <Loading message="Загрузка графика платежей..." />;
  } else if (!isAuthenticated) {
    content = (
      <div className="bg-white shadow rounded-lg p-6 text-center mt-8">
        <p className="text-gray-500">Пожалуйста, войдите в систему, чтобы просмотреть график платежей.</p>
        <Link href="/auth/signin" className="mt-4 inline-block">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    );
  } else if (error) {
    content = <p className="text-center text-red-500 mt-8">Ошибка загрузки графика: {error}</p>;
  } else if (schedules.length === 0) {
    content = (
      <div className="bg-white shadow rounded-lg p-6 text-center mt-8">
        <p className="text-gray-500">
          На данный момент у вас нет запланированных будущих платежей.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-2 mt-4">
        {schedules.map((payment, index) => (
          <div key={`${payment.huiId}-${payment.periodNumber}-${index}`} className="bg-white shadow rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
            <div className="flex-grow">
                <span className="font-semibold text-indigo-600">{payment.huiName}</span>
                <div className="text-sm text-gray-600">
                    <span>Kỳ {payment.periodNumber}/{payment.totalPeriods}</span>
                    <span className="mx-2">|</span>
                    <span>{new Date(payment.paymentDate).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <span className="text-lg text-gray-800">{Number(payment.amount).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-theme(spacing.16))]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">График будущих платежей</h1>
          <p className="text-gray-600 mt-1">
            Здесь отображаются ваши предстоящие платежи по всем hụi, в которых вы участвуете.
          </p>
        </div>
        {content}
      </div>
    </main>
  );
}
