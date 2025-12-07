// src/app/(auth)/signin/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/auth/PasswordInput';
import SocialLogins from '@/components/auth/SocialLogins';
import { Users, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Alert from '@/components/ui/Alert';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'AccountLocked') {
      setError('Tài khoản của bạn đã bị khóa.');
    }

    // Show a success message if the user just registered
    if (searchParams.get('registered') === 'true') {
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('Sign in result:', result);
      if (result.error) {
        // Handle specific error from our authorize callback
        if (result.error === 'CredentialsSignin') {
            setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
      } else if (result.ok) {
        // Redirect to a protected page or homepage on successful login
        // The router.replace() is better for login pages to avoid breaking the back button
        router.replace('/dashboard'); 
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-4 shadow-lg">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Hụi Online</h1>
        <p className="text-gray-500 mt-2">Quản lý hụi thông minh và hiện đại</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập vào tài khoản</h2>
            <p className="text-gray-500 mb-6">Chào mừng bạn trở lại!</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {success && <Alert type="success" message={success} />}
              {error && <Alert type="error" message={error} />}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="/forgot-password">
                  <button type="button" className="text-sm text-red-600 hover:text-red-700 font-medium">Quên mật khẩu?</button>
                </Link>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
            <SocialLogins type="signin" />
          </div>
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register">
                <button className="text-red-600 hover:text-red-700 font-semibold">Đăng ký ngay</button>
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>© 2025 Hụi Online. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  );
};

export default SignInPage;
