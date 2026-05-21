/** @type {import('tailwindcss').Config} */
export default {
  // tells tailwind which files to scan for class names
  // so it only includes CSS you actually use
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}