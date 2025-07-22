// src/components/AuthProvider.jsx
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  // The SessionProvider component provides session context to all its children.
  // This allows any client component in your app to access the session data
  // using the useSession() hook.
  return <SessionProvider>{children}</SessionProvider>;
}
