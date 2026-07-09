/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0a0a0a',
        'brand-accent': '#00f0ff',
      },
    },
  },
  plugins: [],
};
