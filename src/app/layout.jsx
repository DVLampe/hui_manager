'use client';
import { useEffect } from 'react'; // Added useEffect
// import { SessionProvider } from 'next-auth/react'; // next-auth SessionProvider might not be needed if using custom JWT auth with Redux
// import { Provider } from 'react-redux'; // Provider is now in StoreProvider
// import { store } from '@/store'; // store is used within StoreProvider
import { StoreProvider } from '@/store/StoreProvider'; // Import StoreProvider
import { useDispatch } from 'react-redux'; // Import useDispatch
import { checkAuthStatus } from '@/store/authSlice'; // Import checkAuthStatus

import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/Toaster';
import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Component to handle auth check, needs to be a child of StoreProvider to use useDispatch
function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);
  return <>{children}</>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`h-full ${inter.className}`}>
        <AuthProvider>
          <div className="flex flex-col h-full">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
