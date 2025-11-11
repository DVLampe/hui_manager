'use client';
import { useIsMobile } from '@/lib/hooks';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';
import { StoreProvider } from '@/store/StoreProvider';
import MobileLayout from '@/components/mobile/MobileLayout';

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();

  return (
    <StoreProvider>
      {isMobile ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <div className="flex h-screen bg-gray-100">
          <div className="fixed h-full z-30">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col ml-64">
            <Header />
            <main className="flex-grow p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </StoreProvider>
  );
}
