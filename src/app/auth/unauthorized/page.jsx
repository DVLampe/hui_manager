// src/app/auth/unauthorized/page.jsx
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
        <p className="text-lg text-gray-700 mb-6">
          Sorry, you do not have permission to access this page.
        </p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Go to Homepage
        </Link>
      </div>
    </div>
  );
}
