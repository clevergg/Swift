// Tailwind 4 подключается через @tailwindcss/postcss.
// autoprefixer не нужен — встроен в движок Tailwind 4.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
