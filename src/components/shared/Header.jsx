// src/components/shared/Header.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function Header() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-end px-4 sm:px-6 lg:px-8">
      {/* Removed the HuiManager title as it's now in the sidebar */}
      
      <div className="flex items-center space-x-4">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-gray-700 flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-1 text-gray-500" />
              {user.name || user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/auth/singup"> 
              <Button variant="solid" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}