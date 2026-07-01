/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a0e1a",
        cardBg: "#0d1117",
      },
    },
  },
  plugins: [],
}
