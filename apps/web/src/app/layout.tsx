import type { Metadata } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { AuthProvider } from '@/context/AuthContext';
import { inter } from '@/theme/theme';

export const metadata: Metadata = {
  title: 'Laundry CRM — Sparkle Clean',
  description: 'Modern CRM for laundry businesses. Manage customers, orders, and analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
