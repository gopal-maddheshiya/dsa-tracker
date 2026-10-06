/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}-rgb), ${opacityValue})`;
    }
    return `var(${variableName})`;
  };
}

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"DM Sans"', '"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        bg: withOpacity('--bg'),
        surface: {
          DEFAULT: withOpacity('--surface'),
          1: withOpacity('--surface'),
          2: withOpacity('--surface-2'),
          hover: withOpacity('--surface-hover'),
          elevated: withOpacity('--surface-elevated'),
          muted: withOpacity('--surface-2'),
          3: withOpacity('--surface-3'),
        },
        'surface-1': withOpacity('--surface'),
        'surface-2': withOpacity('--surface-2'),
        'surface-3': withOpacity('--surface-3'),
        'surface-hover': withOpacity('--surface-hover'),
        'surface-elevated': withOpacity('--surface-elevated'),
        line: {
          DEFAULT: withOpacity('--line'),
          subtle: withOpacity('--line-subtle'),
        },
        'line-subtle': withOpacity('--line-subtle'),
        text: {
          DEFAULT: withOpacity('--text'),
          secondary: withOpacity('--text-secondary'),
        },
        'text-secondary': withOpacity('--text-secondary'),
        muted: withOpacity('--muted'),
        accent: {
          DEFAULT: withOpacity('--accent'),
          hover: withOpacity('--accent-hover'),
          muted: 'var(--accent-muted)',
          secondary: withOpacity('--accent-secondary'),
        },
        'accent-hover': withOpacity('--accent-hover'),
        'accent-muted': 'var(--accent-muted)',
        'accent-secondary': withOpacity('--accent-secondary'),
        easy: withOpacity('--easy'),
        medium: withOpacity('--medium'),
        hard: withOpacity('--hard'),
        success: withOpacity('--success'),
        warning: withOpacity('--warning'),
        danger: withOpacity('--danger'),
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
        elevated: '0 10px 25px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        glow: '0 0 20px -2px rgba(237, 134, 65, 0.35)',
        'glow-lg': '0 0 30px -4px rgba(237, 134, 65, 0.45)',
      },
    },
  },
  plugins: [],
};
