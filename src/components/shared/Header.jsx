// src/components/shared/Header.jsx
'use client';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/solid';

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user;
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-end px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        {isLoading ? (
          <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse"></div>
        ) : user ? (
          <>
            <NotificationBell />
            <Link href="/profile" className="flex items-center space-x-2 text-sm text-gray-700 hover:text-red-600">
              <UserCircleIcon className="h-5 w-5 text-gray-500" />
              <span>{user.name || user.email}</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
              Đăng xuất
            </Button>
          </>
        ) : (
          <>
          </>
        )}
      </div>
    </header>
  );
}
