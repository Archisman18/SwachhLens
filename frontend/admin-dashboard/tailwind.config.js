/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2e7d32',
          dark: '#1b5e20',
          light: '#e8f5e9',
        },
      },
    },
  },
  plugins: [],
}
