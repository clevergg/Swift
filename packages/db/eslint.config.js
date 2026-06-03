import base from '@swift/config/eslint/base';

export default [
  ...base,
  {
    // Сгенерированный Prisma клиент не линтим — это не наш код.
    ignores: ['src/generated/**'],
  },
];
