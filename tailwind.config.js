/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: 'rgba(23, 25, 35, 0.72)',
        glassLight: 'rgba(255, 255, 255, 0.08)',
        glassBorder: 'rgba(255, 255, 255, 0.14)',
        dockBg: 'rgba(15, 17, 26, 0.75)',
        accent: '#3b82f6',
      },
    },
  },
  plugins: [],
}
