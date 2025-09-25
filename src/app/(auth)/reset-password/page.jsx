'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/auth/PasswordInput';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Không tìm thấy token đặt lại mật khẩu. Vui lòng yêu cầu một liên kết mới.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }
    if (!token) {
        setError('Thiếu token đặt lại. Vui lòng yêu cầu một liên kết mới.');
        return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể đặt lại mật khẩu.');
      }
      
      setSuccess('Mật khẩu của bạn đã được đặt lại thành công! Bây giờ bạn có thể đăng nhập.');
      // Redirect to signin page after a short delay
      setTimeout(() => {
        router.push('/signin');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Đặt lại mật khẩu của bạn
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

                {!success && (
                    <>
                        <PasswordInput
                            id="password"
                            label="Mật khẩu mới"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <PasswordInput
                            id="confirmPassword"
                            label="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !token}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>
                        </div>
                    </>
                )}
            </form>
             <div className="mt-6 text-center text-sm">
                <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Quay lại đăng nhập
                </Link>
            </div>
        </div>
    </div>
  );
};

// Wrap the component in Suspense to use useSearchParams
const ResetPasswordPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResetPasswordForm />
  </Suspense>
);


export default ResetPasswordPage;
