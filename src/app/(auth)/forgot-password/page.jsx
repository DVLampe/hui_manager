'use client';

import { useState } from 'react';
import Link from 'next/link';

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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Quên mật khẩu
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
            </p>
        </div>
        <div className="bg-white py-8 px-8 shadow-lg rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}
                 {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Địa chỉ email
                    </label>
                    <div className="mt-1">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Gửi liên kết đặt lại'}
                    </button>
                </div>
            </form>
             <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                    Nhớ mật khẩu?{' '}
                    <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default ForgotPasswordPage;
