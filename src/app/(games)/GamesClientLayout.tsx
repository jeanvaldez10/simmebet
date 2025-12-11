'use client';

import '@/styles/globals.css';
import { Geist } from 'next/font/google';
import { AuthProvider } from '@/context/AuthProvider';
import { ToastProvider } from '@/components/common/ToastContext';
import GamesPageLayout from '@/components/GamesPageLayout';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700', '800'],
});

function GamesClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <main className={`${geist.variable} font-geist`}>
          <GamesPageLayout>{children}</GamesPageLayout>
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}

export default GamesClientLayout;
