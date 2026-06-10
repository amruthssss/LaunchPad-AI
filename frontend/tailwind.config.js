/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        aurora: '0 0 80px rgba(34, 211, 238, 0.18)',
      },
    },
  },
  plugins: [],
}
