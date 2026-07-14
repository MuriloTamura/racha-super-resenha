/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Identidade visual do Racha Super Resenha
        racha: {
          black: '#0d0d0d',
          dark: '#161616',
          card: '#1f1f1f',
          yellow: '#FFD400',
          'yellow-dark': '#E0B800',
          'yellow-soft': '#FFE985',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};