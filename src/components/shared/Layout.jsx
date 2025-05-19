// src/components/shared/Layout.jsx
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64"> {/* Added ml-64 to offset sidebar */}
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
