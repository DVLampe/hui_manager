'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  console.log('[SignInPage] Component rendered/mounted. isAuthenticated:', isAuthenticated, 'User:', !!user);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    console.log('[SignInPage] useEffect triggered. isAuthenticated:', isAuthenticated, 'User:', !!user);
    if (isAuthenticated && user) {
      console.log('[SignInPage] useEffect redirecting to /');
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/auth/singup" className="font-medium text-indigo-600 hover:text-indigo-500">
              đăng ký tài khoản mới
            </Link>
          </p>
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          <Button 
            type="submit" 
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
            disabled={loading === 'pending'}
          >
            {loading === 'pending' ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
}
