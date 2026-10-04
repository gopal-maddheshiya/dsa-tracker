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
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
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
        },
        'surface-1': withOpacity('--surface'),
        'surface-2': withOpacity('--surface-2'),
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
        },
        'accent-hover': withOpacity('--accent-hover'),
        'accent-muted': 'var(--accent-muted)',
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
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        elevated: '0 4px 12px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
