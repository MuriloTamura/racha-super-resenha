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
        // Identidade visual do Racha Super Resenha — grená e dourado
        racha: {
          black: '#120608',
          dark: '#1c0c0f',
          card: '#2a1114',
          yellow: '#D4AF37',
          'yellow-dark': '#A87F1F',
          'yellow-soft': '#E8CB6A',
          garnet: '#6B121F',
          'garnet-dark': '#4A0D16',
          'garnet-light': '#8C1B2B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};