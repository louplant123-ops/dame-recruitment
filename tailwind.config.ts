import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Purge unused CSS in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    options: {
      safelist: [
        // Keep utility classes that might be used dynamically
        'btn-lift',
        'card-hover',
        'form-input',
        'section-accent-teal',
        'section-accent-blue',
        'section-accent-yellow',
        'section-accent-green',
        'animate-fade-in',
        'animate-slide-up',
      ],
    },
  },
  theme: {
    extend: {
      colors: {
        // Dame Recruitment Brand Colors
        charcoal: '#222222',
        'light-text': '#222222',
        'dark-text': '#F7F7F7',
        'neutral-white': '#FFFFFF',
        'neutral-light': '#F4F4F4',
        'primary-red': '#C8102E',
        'accent-teal': '#1CA6A3',
        'accent-yellow': '#FFD23F',
        'accent-blue': '#0077B6',
        'accent-green': '#34A853',
      },
      fontFamily: {
        'heading': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'body': ['var(--font-lato)', 'Lato', 'sans-serif'],
      },
      fontSize: {
        // Typography scale following user requirements
        'h1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 48px
        'h1-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 56px
        'h2': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 32px
        'h3': ['1.5rem', { lineHeight: '1.3' }], // 24px
        'body': ['1rem', { lineHeight: '1.6' }], // 16px
        'body-lg': ['1.125rem', { lineHeight: '1.6' }], // 18px
      },
      maxWidth: {
        'container': '1280px',
        'prose': '70ch', // ~70 character line length
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'lift': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lift-lg': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config
