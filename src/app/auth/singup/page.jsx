// src/app/auth/signup/page.jsx
'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, resetRegistrationSuccess } from '@/store/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(resetRegistrationSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
    if (registrationSuccess) {
      alert('Registration successful! Please login.');
      router.push('/auth/signin');
      dispatch(resetRegistrationSuccess());
    }
  }, [registrationSuccess, router, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng ký tài khoản
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{typeof error === 'string' ? error : JSON.stringify(error)}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              label="Họ tên"
              name="name"
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
            <Input
              label="Số điện thoại (tùy chọn)"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="09xxxxxxxx"
              value={formData.phone}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          <Button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={loading === 'pending'}>
            {loading === 'pending' ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>
      </div>
    </div>
  );
}