/**
 * Shared Tailwind preset для Swift CRM.
 *
 * Дизайн-система: небесные тона (sky), стекло (glass), размытие (blur).
 *
 * Использование в приложении:
 *   // tailwind.config.ts
 *   import swiftPreset from '@swift/config/tailwind';
 *   export default {
 *     presets: [swiftPreset],
 *     content: ['./src/**\/*.{ts,tsx}', '../../packages/ui/src/**\/*.{ts,tsx}'],
 *   };
 */

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Небесная палитра — основной брендовый цвет.
        // Используем встроенную sky, но добавляем семантические алиасы.
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Стеклянные поверхности (используются с backdrop-blur)
        glass: {
          // RGBA задаётся в utilities ниже; здесь — справочные значения
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
      },
      // Анимация blur-blob'ов на фоне (для auth-страниц)
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        blob: 'blob 12s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        shake: 'shake 0.4s ease-in-out',
      },
      // Кастомные значения backdrop-blur для glass-эффекта
      backdropBlur: {
        xs: '2px',
      },
      // Тени для glass-карточек (мягкие, многослойные)
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.2)',
      },
    },
  },
  plugins: [],
};
