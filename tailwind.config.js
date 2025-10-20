/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './angular-dashboard/src/**/*.{html,ts}',
    './react-recommender/src/**/*.{js,jsx,ts,tsx}',
    './shared-types/src/**/*.{js,jsx,ts,tsx}',
    './shared-api/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#14b7cd',
        'brand-light': '#3cc5d9',
        'brand-dark': '#0f9bb0',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};