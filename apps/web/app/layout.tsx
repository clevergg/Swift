import type { Metadata } from 'next';
import Script from 'next/script';

import { ThemeProvider } from '@/components/theme/theme-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Swift — CRM-платформа',
  description: 'Управляй командой легко и спокойно',
};

// Корневой layout. Оборачивает всё приложение в провайдер тем.
// suppressHydrationWarning на html - тема применяется до отрисовки (класс dark),
// это ожидаемое расхождение сервер/клиент, подавляем предупреждение.
//
// Скрипт через next/script со strategy beforeInteractive выполняется ДО
// гидратации React, ставит класс dark на <html> по сохранённой или системной
// теме. Так нет мерцания (светлая -> тёмная) и тема не "сбрасывается" при загрузке.
// (В App Router ручной <script> в <head> не работает надёжно - используем Script.)
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
}){
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
