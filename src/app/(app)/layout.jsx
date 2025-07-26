// src/app/(app)/layout.jsx
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-grow p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
