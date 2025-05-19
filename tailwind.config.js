const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "bg-blue-100",
    "border-4",
    "border-blue-500",
    "rounded-xl",
    "p-8",
    "m-8",
    "text-3xl",
    "font-bold",
    "text-blue-800",
    "mb-4",
    "text-lg",
    "text-blue-700"
  ],
  theme: {
    extend: {
      colors: {
        blue: colors.blue,
        gray: colors.gray,
        primary: colors.blue, // Added primary color alias
      }
    },
  },
  plugins: [],
}
