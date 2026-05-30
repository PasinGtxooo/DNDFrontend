/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        bg: '#0a0c0f',
        surface: { DEFAULT: '#111418', 2: '#181d24', 3: '#1e2530' },
        border: '#2a3340',
        omni: {
          DEFAULT: '#00e676',
          dim: '#00c853',
          dark: '#003d1a',
          glow: 'rgba(0,230,118,0.15)',
        },
      },
      boxShadow: {
        omni: '0 0 12px rgba(0,230,118,0.25)',
        'omni-lg': '0 0 24px rgba(0,230,118,0.4)',
      },
      keyframes: {
        dot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
      },
      animation: { dot: 'dot 1.5s ease-in-out infinite' },
    },
  },
  plugins: [],
}

