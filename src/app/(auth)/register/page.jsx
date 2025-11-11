// src/app/(auth)/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/auth/PasswordInput';
import SocialLogins from '@/components/auth/SocialLogins';
import { Users, Mail, Lock, User } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreedToTerms) {
      setError('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register');
      }

      // On successful registration, redirect to the sign-in page with a success query param
      router.push('/signin?registered=true');

    } catch (err) {
      setError(err.message === 'User with this email already exists' 
        ? 'Tài khoản với email này đã tồn tại.' 
        : 'Đã xảy ra lỗi. Vui lòng thử lại.');
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h2>
            <p className="text-gray-500 mb-6">Bắt đầu quản lý hụi của bạn</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
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
                <p className="mt-2 text-xs text-gray-500">Tối thiểu 8 ký tự</p>
              </div>
              <div className="flex items-start">
                <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <span className="text-red-600 hover:text-red-700 font-medium cursor-pointer">Điều khoản dịch vụ</span>
                  {' '}và{' '}
                  <span className="text-red-600 hover:text-red-700 font-medium cursor-pointer">Chính sách bảo mật</span>
                </label>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>
            </form>
            <SocialLogins type="signup" />
          </div>
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/signin">
                <button className="text-red-600 hover:text-red-700 font-semibold">Đăng nhập</button>
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

export default RegisterPage;
