/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        forest: '#164D3D',
        ink: '#20372E',
        muted: '#64756C',
        cream: '#F7F8F3',
        mint: '#EDF3E7',
        line: '#E5E9DF',
      },
      fontFamily: { sans: ['Inter', 'Segoe UI', 'sans-serif'] },
      boxShadow: { soft: '0 8px 32px -16px rgb(32 55 46 / 18%)' },
    },
  },
  plugins: [],
};
