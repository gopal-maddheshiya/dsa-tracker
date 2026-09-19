/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#E07A38',
          foreground: '#12151B',
        },
        brand: {
          50: '#FDF8F5',
          100: '#F9EDE5',
          200: '#F3DACB',
          300: '#EABFA7',
          400: '#E29E7A',
          500: '#E07A38', // portfolio warm ember primary
          600: '#C76326',
          700: '#A44D1B',
          800: '#843C16',
          900: '#6A3114',
        },
        surface: {
          canvas: '#0A0B0D',
          elevated: '#101216',
          panel: '#131519',
          card: '#16191E',
          active: '#1C2026',
        },
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'premium-hover': '0 10px 32px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glow-sm': '0 0 12px -2px rgba(224, 122, 56, 0.2)',
        'glow-md': '0 0 18px -2px rgba(224, 122, 56, 0.3)',
        'glow-lg': '0 0 28px -4px rgba(224, 122, 56, 0.35)',
      },
    },
  },
  plugins: [],
};
