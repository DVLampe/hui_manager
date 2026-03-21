'use client';
import { useIsMobile } from '@/lib/hooks';
import { StoreProvider } from '@/store/StoreProvider';
import MobileLayout from '@/components/mobile/MobileLayout';
import AppWrapper from './AppWrapper';

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();

  return (
    <StoreProvider>
      {isMobile ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <AppWrapper>{children}</AppWrapper>
      )}
    </StoreProvider>
  );
}
