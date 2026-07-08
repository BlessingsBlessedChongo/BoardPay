/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#030712',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          400: '#9ca3af',
          300: '#d1d5db',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          900: '#164e63',
        }
      },
    },
  },
  plugins: [],
};
