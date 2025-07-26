'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '@/components/shared/Layout';
import { fetchFutureSchedules, resetFutureSchedules } from '@/store/futureScheduleSlice';
import { selectIsAuthenticated } from '@/store/authSlice';

export default function FutureSchedulePage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const {
    schedules,
    status: scheduleStatus,
    error: scheduleError,
  } = useSelector((state) => state.futureSchedule);

  useEffect(() => {
    if (isAuthenticated && scheduleStatus === 'idle') {
      dispatch(fetchFutureSchedules());
    }
  }, [dispatch, isAuthenticated, scheduleStatus]);

  useEffect(() => {
    if (!isAuthenticated && scheduleStatus !== 'idle') {
        dispatch(resetFutureSchedules());
    }
  }, [isAuthenticated, dispatch, scheduleStatus]);

  let content;
  if (!isAuthenticated) {
     content = (
        <div className="bg-white shadow rounded-lg p-6 text-center mt-8">
            <p className="text-gray-500">Пожалуйста, войдите в систему, чтобы просмотреть график платежей.</p>
        </div>
     );
  } else if (scheduleStatus === 'loading') {
    content = <p className="text-center text-gray-500 mt-8">Загрузка графика платежей...</p>;
  } else if (scheduleStatus === 'failed') {
    content = <p className="text-center text-red-500 mt-8">Ошибка загрузки графика: {scheduleError || 'Неизвестная ошибка'}</p>;
  } else if (scheduleStatus === 'succeeded' && schedules.length === 0) {
    content = (
      <div className="bg-white shadow rounded-lg p-6 text-center mt-8">
        <p className="text-gray-500">
          На данный момент у вас нет запланированных будущих платежей.
        </p>
      </div>
    );
  } else if (scheduleStatus === 'succeeded' && schedules.length > 0) {
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
  } else if (scheduleStatus === 'idle') {
     content = (
        <div className="bg-white shadow rounded-lg p-6 text-center mt-8">
            <p className="text-gray-500">Нажмите кнопку, чтобы загрузить расписание.</p>
             <button
                onClick={() => dispatch(fetchFutureSchedules())}
                disabled={scheduleStatus === 'loading'}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50"
            >
                Загрузить расписание
            </button>
        </div>
     );
  } else {
    content = <p className="text-center text-gray-500 mt-8">Пожалуйста, подождите...</p>;
  }

  return (
    <Layout>
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
    </Layout>
  );
}
