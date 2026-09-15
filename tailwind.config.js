/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // ── Dark mode: toggled by adding/removing the `dark` class on <html> ──
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // All colors reference CSS custom properties defined in globals.css.
        // When html.dark is active those variables resolve to dark-palette
        // values, so every Tailwind utility (bg-*, text-*, border-*, etc.)
        // automatically picks up the correct colour without any `dark:` variants.
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          light:   'var(--color-primary-light)',
        },
        background: 'var(--color-background)',
        surface: {
          DEFAULT:   'var(--color-surface)',
          lowest:    'var(--color-surface-lowest)',
          low:       'var(--color-surface-low)',
          container: 'var(--color-surface-container)',
          high:      'var(--color-surface-high)',
          highest:   'var(--color-surface-highest)',
          dim:       'var(--color-surface-dim)',
        },
        'on-surface':         'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'text-secondary':     'var(--color-text-secondary)',
        'text-muted':         'var(--color-text-muted)',
        outline:              'var(--color-outline)',
        'outline-variant':    'var(--color-outline-variant)',
        'border-base':        'var(--color-border-base)',
        success: {
          DEFAULT: 'var(--color-success)',
          bg:      'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg:      'var(--color-warning-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg:      'var(--color-error-bg)',
        },
        tertiary: 'var(--color-tertiary)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'page-title': ['32px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '1.6' }],
        'body-md': ['15px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'label-caps': ['11px', { lineHeight: '1', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.10)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        card: '0 12px 35px rgba(50, 88, 150, 0.08)',
        nav: '0 2px 10px rgba(50, 88, 150, 0.05)',
        'card-hover': '0 16px 40px rgba(50, 88, 150, 0.13)',
      },
      spacing: {
        micro: '4px',
        xs: '6px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        xxxl: '64px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
