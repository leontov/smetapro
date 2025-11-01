import type { Config } from 'tailwindcss';

export default {
  content: ['index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#22d3ee',
          dark: '#0f172a'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
