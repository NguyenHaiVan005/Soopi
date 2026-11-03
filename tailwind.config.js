/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soopi: {
          50: '#fff5f0',
          100: '#ffe8dc',
          200: '#ffd0b8',
          300: '#ffb08a',
          400: '#ff8554',
          500: '#ee4d2d', // Classic Shopee/Soopi vibrant coral-red orange
          600: '#e03918',
          700: '#ba2a0f',
          800: '#942311',
          900: '#792013',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

