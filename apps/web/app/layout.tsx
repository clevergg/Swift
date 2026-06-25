import type { Metadata } from 'next';
import Script from 'next/script';

import { AuthInitializer } from '@/components/auth/auth-initializer';
import { ThemeProvider } from '@/components/theme/theme-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Swift — CRM-платформа',
  description: 'Управляй командой легко и спокойно',
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('swift-theme');
    var dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {/* Запускает восстановление сессии (refresh -> me) при старте. */}
        <AuthInitializer />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
