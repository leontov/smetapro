import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4C6FFF',
          dark: '#3B5BE0'
        }
      }
    }
  },
  plugins: []
};

export default config;
