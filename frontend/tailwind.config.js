/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af' },
        accent: { 400: '#60a5fa', 500: '#3b82f6' },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
