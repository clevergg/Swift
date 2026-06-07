/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Транспилируем пакеты монорепо (они в TS-исходниках, Next их соберёт сам).
  transpilePackages: ['@swift/types'],
  // Проксируем запросы /api на бэкенд (чтобы не возиться с CORS в dev и
  // чтобы cookie работали с одного origin). Запросы фронта на /api/* уйдут
  // на NestJS (localhost:3001).
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
