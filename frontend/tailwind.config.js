/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFCF8',
        sage: '#E8EFE8',
        lavender: '#EFEDF4',
        coral: '#FFB7B2',
        darkText: '#292524',
        mutedText: '#78716C',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        accent: ['Reenie Beanie', 'cursive'],
      },
    },
  },
  plugins: [],
}
