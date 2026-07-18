import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F5F2',
        surface: '#FFFFFF',
        ink: '#1A1916',
        'ink-2': '#5C5A56',
        'ink-3': '#9E9B95',
        accent: '#2D5A4B',
        'accent-light': '#E8F0ED',
        'accent-2': '#C8A96E',
        border: 'rgba(26,25,22,0.10)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'serif'],
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
