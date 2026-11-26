/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink:     '#10183F',
        paper:   '#EBF0F8',
        accent:  '#2E4BD8',
        'accent-soft': '#8FA2FF', // accent on dark backgrounds
        muted:   '#4B557F',
        subtle:  '#DCE3F1',
        surface: '#FFFFFF',
      },
      fontFamily: {
        display: ['Schibsted Grotesk', 'sans-serif'],
        body:    ['Schibsted Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      spacing: {
        section: '7rem',
      },
      maxWidth: {
        prose2: '68ch',
      },
      animation: {
        'fade-up':   'fadeUp 0.7s ease forwards',
        'fade-in':   'fadeIn 0.6s ease forwards',
        'line-grow': 'lineGrow 0.8s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        lineGrow: {
          '0%':   { width: '0' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};
