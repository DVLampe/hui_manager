// src/app/(auth)/signin/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
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

      if (result.error) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Đăng nhập vào tài khoản
            </h2>
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
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                    </label>
                    <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Đăng ký ngay
                </Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default SignInPage;
