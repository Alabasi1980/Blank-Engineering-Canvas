
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1. The Core Dynamic Palette (Mapped to CSS Variables)
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
          glass: 'var(--color-primary-glass)',
          glow: 'var(--color-primary-glow)',
        },
        secondary: 'var(--color-secondary)',
        
        // 2. Semantic Surfaces
        surface: {
          app: 'var(--surface-app)',
          card: 'var(--surface-card)',
          input: 'var(--surface-input)',
          sidebar: 'var(--surface-sidebar)',
          overlay: 'var(--surface-overlay)',
        },

        // 3. Text Semantics
        txt: {
          main: 'var(--text-main)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          onBrand: 'var(--text-on-primary)',
        }
      },
      fontFamily: {
        sans: ['var(--app-font)', 'Cairo', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      backgroundImage: {
        'atmosphere': 'var(--bg-atmosphere)',
      },
      boxShadow: {
        'neon': 'var(--shadow-neon)',
        'glass': 'var(--shadow-card)',
      },
      borderColor: {
        DEFAULT: 'var(--border-subtle)',
        highlight: 'var(--border-highlight)',
      }
    },
  },
  plugins: [],
}
