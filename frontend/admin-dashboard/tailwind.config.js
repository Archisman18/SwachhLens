/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F0EBE3',
        },
        maroon: {
          DEFAULT: '#7B3B3A',
          dark: '#5E2B2A',
          light: '#9B5B5A',
        },
        forest: {
          DEFAULT: '#2D5A3D',
          dark: '#1E3E2A',
          light: '#3D7A53',
        },
        charcoal: '#2C2C2C',
        stone: {
          DEFAULT: '#8A8578',
          light: '#B5AFA5',
          border: '#E5E0D8',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
