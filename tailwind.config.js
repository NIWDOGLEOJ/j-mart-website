/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        sub: 'var(--sub)',
        rule: 'var(--rule)',
        rule2: 'var(--rule2)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        ink: 'var(--ink)',
        ink2: 'var(--ink2)',
        ink3: 'var(--ink3)',
        ink4: 'var(--ink4)',
        accent: {
          DEFAULT: 'var(--accent)',
          hi: 'var(--accent-hi)',
          soft: 'var(--accent-soft)',
          soft2: 'var(--accent-soft2)',
          line: 'var(--accent-line)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          strong: 'var(--danger-strong)',
          soft: 'var(--danger-soft)',
          soft2: 'var(--danger-soft2)',
          line: 'var(--danger-line)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          hi: 'var(--warn-hi)',
          soft: 'var(--warn-soft)',
          line: 'var(--warn-line)',
        },
        ok: {
          DEFAULT: 'var(--ok)',
          soft: 'var(--ok-soft)',
          soft2: 'var(--ok-soft2)',
          line: 'var(--ok-line)',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        }
      }
    },
  },
  plugins: [],
}
