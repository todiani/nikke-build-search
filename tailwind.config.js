/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nikke: {
          dark: '#1a1a1a',
          card: '#252525',
          accent: '#c0a062', // Gold-ish
          red: '#e63946',
          text: '#e0e0e0',
          subtext: '#a0a0a0'
        }
      }
    },
  },
  plugins: [],
}
