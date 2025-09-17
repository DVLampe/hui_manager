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

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with Google</span>
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Zalo Button */}
                <div>
                  <button
                    onClick={() => signIn('zalo', { callbackUrl: '/dashboard' })}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with Zalo</span>
                     <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7.34 12.1a.33.33 0 01-.48-.39c.26-1.04.8-1.96 1.5-2.6.4-.37.9-.66 1.43-.85.57-.2 1.17-.26 1.78-.18a.33.33 0 01.3.45c-.07.15-.24.22-.4.17-.5-.1-1-.05-1.47.12-.45.17-.87.42-1.23.75-.6.54-1.07 1.3-1.3 2.2a.33.33 0 01-.46.18zM12.7 8.9a.33.33 0 01.48.39c-.26 1.04-.8 1.96-1.5 2.6-.4.37-.9.66-1.43-.85-.57.2-1.17.26-1.78-.18a.33.33 0 01-.3-.45c.07-.15.24-.22.4-.17.5.1 1 .05 1.47-.12.45-.17.87-.42 1.23-.75.6-.54 1.07-1.3 1.3-2.2a.33.33 0 01.46-.18z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

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
