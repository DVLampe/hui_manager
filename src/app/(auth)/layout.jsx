// src/app/(auth)/layout.jsx
// This is the layout for the authentication pages.
// It does not include the main site's Header or Sidebar.

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
