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
// import { Header } from '@/components/shared/Header'; // Assuming Header is part of the page content or conditionally rendered
// import { Sidebar } from '@/components/shared/Sidebar'; // Assuming Sidebar is part of the page content or conditionally rendered
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
    <html lang="en" className={cn('h-full bg-gray-100', inter.className)}>
      <body className="h-full">
        <StoreProvider> { /* Wrap with StoreProvider */}
          <AuthInitializer> { /* Initialize auth status */}
            {/* <Header /> */}
            {/* <div className="flex"> */}
              {/* <Sidebar /> */}
              {/* <main className="flex-grow p-6 md:p-10"> */}
                {/* The old container mx-auto can be here or within individual page layouts */}
                {/* <div className="container mx-auto px-4 py-8"> */}
                {children}
                {/* </div> */}
              {/* </main> */}
            {/* </div> */}
            <Toaster /> { /* Toaster for notifications */}
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
