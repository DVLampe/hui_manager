'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';
import { useState } from 'react';
import { useIsMobile } from '@/lib/hooks';

function AppContent({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-gray-40 to-gray-100/90 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppWrapper({ children }) {
  const pathname = usePathname();
  const isGuestView = pathname.startsWith('/share/hui');

  if (isGuestView) {
    return <main className="bg-gradient-to-b from-gray-50 to-gray-100/90 min-h-screen">{children}</main>;
  }

  return <AppContent>{children}</AppContent>;
}
