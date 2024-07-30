/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue-rgba': 'rgba(17, 25, 40, 0.75)',
      },
    },
  },
  plugins: [],
}