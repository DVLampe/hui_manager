// src/app/(auth)/layout.jsx
// This is the layout for the authentication pages.
// It does not include the main site's Header or Sidebar.

export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
