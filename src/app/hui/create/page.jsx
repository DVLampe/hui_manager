// src/app/hui/create/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createHui, resetCreateHuiStatus } from '@/store/huiSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';

export default function CreateHuiPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    createHuiLoading,
    createHuiError,
    createHuiSuccess,
    createdHuiData
  } = useSelector((state) => state.hui);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    startDate: '',
    endDate: '',
    cycle: '1',
    totalMembers: '',
    rules: '',
    managerId: ''
  });

  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !createHuiLoading) {
      router.push('/auth/signin?redirect=/hui/create');
    }
    if (user && user.id && formData.managerId === '') {
        setFormData(prev => ({...prev, managerId: user.id }));
    }
  }, [isAuthenticated, user, router, createHuiLoading, formData.managerId]);

  useEffect(() => {
    console.log('[Redirect Effect Check] createHuiSuccess:', createHuiSuccess, 'createdHuiData:', createdHuiData);
    if (createHuiSuccess && createdHuiData) {
      console.log('[Redirect Effect Action] Both conditions met. Redirecting to /hui');
      router.push('/hui');
      // No need to dispatch resetCreateHuiStatus() here, cleanup will handle it upon unmount.
    } else if (createHuiSuccess && !createdHuiData) {
      console.warn('[Redirect Effect Warn] createHuiSuccess is true, but createdHuiData is missing or null. Not redirecting. Check Redux slice.');
    } else if (!createHuiSuccess && createdHuiData) {
      console.warn('[Redirect Effect Warn] createdHuiData is present, but createHuiSuccess is false. Not redirecting. Check Redux slice logic for setting success flag.');
    }

    return () => {
      // This cleanup function runs when the component unmounts (e.g., after a successful redirect)
      // or if the dependencies change before a redirect occurs.
      console.log('[Redirect Effect Cleanup] Called. Current createHuiSuccess:', createHuiSuccess, '. Dispatching resetCreateHuiStatus.');
      // dispatch(resetCreateHuiStatus()); // Commented out to prevent SEGMENT MISMATCH
    };
  }, [createHuiSuccess, createdHuiData, router, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setClientError('');
  };
  
  const tryParseJson = (jsonString) => {
    if (typeof jsonString !== 'string' || jsonString.trim() === '') {
      return null; 
    }
    try {
      const parsed = JSON.parse(jsonString);
      return parsed; 
    } catch (e) {
      setClientError('Quy định (Rules) không phải là JSON hợp lệ.');
      return 'INVALID_JSON'; 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');
    // Important: Reset status *before* a new attempt if you want to clear old errors/success messages immediately.
    // However, for redirect logic, the useEffect handles the success flag.
    // If createHuiSuccess is already true from a previous attempt and not reset, it might cause issues.
    // dispatch(resetCreateHuiStatus()); // Consider if this is needed here or if useEffect cleanup is sufficient.

    if (!formData.name || !formData.amount || !formData.startDate || !formData.cycle || !formData.totalMembers || !formData.managerId) {
      setClientError('Vui lòng điền đầy đủ các trường bắt buộc: Tên hụi, Số tiền, Ngày bắt đầu, Chu kỳ, Tổng số thành viên, ID Quản lý.');
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
        setClientError('Số tiền mỗi kỳ phải là một số dương.');
        return;
    }
    if (parseInt(formData.cycle, 10) <= 0) {
        setClientError('Chu kỳ phải là một số nguyên dương.');
        return;
    }
    if (parseInt(formData.totalMembers, 10) <= 0) {
        setClientError('Tổng số thành viên phải là một số nguyên dương.');
        return;
    }
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        setClientError('Ngày kết thúc không thể trước ngày bắt đầu.');
        return;
    }
    
    let finalEndDate = formData.endDate;
    if (!finalEndDate && formData.startDate && formData.cycle) {
        const startDateObj = new Date(formData.startDate);
        const cycleMonths = parseInt(formData.cycle, 10) * 12; 
        startDateObj.setMonth(startDateObj.getMonth() + cycleMonths);
        finalEndDate = startDateObj.toISOString().split('T')[0];
    }

    let parsedRules = null;
    if (formData.rules && formData.rules.trim() !== '') {
      parsedRules = tryParseJson(formData.rules);
      if (parsedRules === 'INVALID_JSON') {
        return;
      }
    }

    const dataToSubmit = {
      ...formData,
      amount: parseFloat(formData.amount),
      cycle: parseInt(formData.cycle, 10),
      totalMembers: parseInt(formData.totalMembers, 10),
      endDate: finalEndDate, 
      rules: parsedRules, 
    };
    console.log('[Handle Submit] Dispatching createHui with data:', dataToSubmit);
    dispatch(createHui(dataToSubmit));
  };

  if (!isAuthenticated) { 
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Alert type="info" message="Đang chuyển hướng đến trang đăng nhập..." />
            <Loading />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-700">Tạo Hụi Mới</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên hụi <span className="text-red-500">*</span></label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Hụi Tết 2025"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về mục đích hoặc quy định của hụi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền mỗi kỳ (VNĐ) <span className="text-red-500">*</span></label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="VD: 1000000"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="cycle" className="block text-sm font-medium text-gray-700 mb-1">Chu kỳ (tháng) <span className="text-red-500">*</span></label>
              <Input
                id="cycle"
                name="cycle"
                type="number"
                required
                value={formData.cycle}
                onChange={handleChange}
                placeholder="VD: 1"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (tự động tính nếu bỏ trống cho 12 kỳ)</label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate} 
              />
            </div>
          </div>

          <div>
            <label htmlFor="totalMembers" className="block text-sm font-medium text-gray-700 mb-1">Tổng số thành viên <span className="text-red-500">*</span></label>
            <Input
              id="totalMembers"
              name="totalMembers"
              type="number"
              required
              value={formData.totalMembers}
              onChange={handleChange}
              placeholder="VD: 10"
              min="1"
            />
          </div>

          <div>
            <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-1">Quy định (tùy chọn, dạng JSON)</label>
            <textarea
              id="rules"
              name="rules"
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.rules}
              onChange={handleChange}
              placeholder='{"latePaymentPenalty": 50000, "defaultCycleDay": 1}'
            />
            <p className="mt-1 text-xs text-gray-500">Nhập dưới dạng chuỗi JSON hợp lệ nếu có. VD: {JSON.stringify({duesDay: "5th", penalty: "5%"})}</p>
          </div>
          
          <div>
            <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-1">ID Quản lý <span className="text-red-500">*</span> <span className="text-blue-500 text-xs">(Tự động điền nếu bạn đã đăng nhập)</span></label>
            <Input
              id="managerId"
              name="managerId"
              type="text"
              required
              value={formData.managerId}
              onChange={handleChange}
              placeholder="ID người quản lý hụi"
              readOnly={!!(user && user.id)}
            />
            {!(user && user.id) && <p className="mt-1 text-xs text-orange-500">Đăng nhập để tự động điền trường này.</p>}
          </div>

          {clientError && <Alert type="error" message={clientError} />}
          {createHuiError && <Alert type="error" message={`Lỗi từ server: ${createHuiError.message || createHuiError}`} />}
          {createHuiSuccess && <Alert type="success" message="Hụi đã được tạo thành công! Đang xử lý chuyển hướng..." />}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link href="/hui">
                <Button type="button" variant="secondary" disabled={createHuiLoading} onClick={() => dispatch(resetCreateHuiStatus())}>
                    Hủy
                </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={createHuiLoading}>
              {createHuiLoading ? <Loading size="sm" /> : 'Tạo Hụi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
