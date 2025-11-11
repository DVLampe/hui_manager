'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Mail, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // We don't want to reveal if an email exists or not for security reasons
        // So, we show a generic success message regardless of the outcome.
        // The backend will only send an email if the user exists.
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSuccess('Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi.');

    } catch (err) {
      // Even in case of an error, we might want to show a generic message
      // to prevent email enumeration attacks.
      setSuccess('Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi.');
    } finally {
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu</h2>
            <p className="text-gray-500 mb-6">Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu</p>
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Email đã được gửi!</h3>
                <p className="text-gray-600 mb-6">{success}</p>
                <Link href="/signin">
                  <button className="text-red-600 hover:text-red-700 font-semibold">Quay lại đăng nhập</button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                </button>
              </form>
            )}
          </div>
          {!success && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Nhớ mật khẩu?{' '}
                <Link href="/signin">
                  <button className="text-red-600 hover:text-red-700 font-semibold">Đăng nhập</button>
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>© 2025 Hụi Online. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
