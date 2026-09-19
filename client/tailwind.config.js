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
          2: withOpacity('--surface-2'),
        },
        'surface-2': withOpacity('--surface-2'),
        line: withOpacity('--line'),
        text: {
          DEFAULT: withOpacity('--text'),
          secondary: withOpacity('--text-secondary'),
        },
        'text-secondary': withOpacity('--text-secondary'),
        muted: withOpacity('--muted'),
        accent: {
          DEFAULT: withOpacity('--accent'),
          hover: withOpacity('--accent-hover'),
        },
        'accent-hover': withOpacity('--accent-hover'),
        easy: withOpacity('--easy'),
        medium: withOpacity('--medium'),
        hard: withOpacity('--hard'),
        success: withOpacity('--success'),
        danger: withOpacity('--danger'),
      },
      boxShadow: {
        modal: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
