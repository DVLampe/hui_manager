import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hui Manager App",
  description: "Your trusted Hui management solution",
};

// This is the root layout. It only contains the providers and basic HTML structure.
// It no longer contains the Header or Sidebar.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`h-full ${inter.className}`}>
        <AuthProvider>
                {children}
        </AuthProvider>
      </body>
    </html>
  );
}
