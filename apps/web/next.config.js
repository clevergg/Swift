/** @type {import('next').NextConfig} */

// URL бэкенда. Локально — localhost:3001. На проде (Vercel) — задаётся через
// переменную окружения API_URL (полный адрес Render-сервиса без /api).
// Проксирование через Next позволяет браузеру видеть один origin (домен
// Vercel), поэтому cookie работают как в dev (sameSite strict), без
// cross-origin плясок.
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@swift/types'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
