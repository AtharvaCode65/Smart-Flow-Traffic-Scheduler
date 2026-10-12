/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { navy: '#071a33', panel: '#0d2747', blue: '#2b8cff', signal: '#22c55e' },
      boxShadow: { glow: '0 0 30px rgba(43, 140, 255, .18)' },
    },
  },
  plugins: [],
};
