/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a2e1a',
        accent: '#c9a84c',
        light: '#f5f0e8',
      },
    },
  },
  plugins: [],
}
