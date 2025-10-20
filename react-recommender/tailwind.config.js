/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#14b7cd',
        'brand-light': '#3cc5d9',
        'brand-dark': '#0f9bb0',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-delayed': 'fadeIn 0.5s ease-out 0.2s both',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'bounce-delayed-1': 'bounce 1s infinite 0.1s',
        'bounce-delayed-2': 'bounce 1s infinite 0.2s',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBrand: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      borderWidth: {
        '3': '3px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};