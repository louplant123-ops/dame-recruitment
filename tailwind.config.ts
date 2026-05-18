import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dame Recruitment — refined editorial palette (light)
        charcoal: '#14181d',          /* dark ink — primary headings, also used as dark bg */
        graphite: '#232a32',
        ink: '#14181d',
        'light-text': '#f1ecdf',      /* cream — for use on dark surfaces */
        'dark-text': '#f1ecdf',       /* cream — for use on dark surfaces (legacy name) */
        'neutral-white': '#ffffff',
        'neutral-light': '#f4f1ea',
        'primary-red': '#14181d',     /* primary CTA -> ink (was coral red, now elegant ink) */
        'accent-teal': '#2b9fc6',
        'accent-yellow': '#b89567',
        'accent-blue': '#2f4ed1',
        'accent-green': '#2b9fc6',
        'accent-purple': '#6b4ed0',
        'accent-pink': '#c95aaa',
        'cream': '#f1ecdf',
        'panel': '#ffffff',
        'panel-soft': '#f4f1ea',
        'line': '#e6e1d6',
      },
      fontFamily: {
        'heading': ['"General Sans"', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
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
        'lift': '0 10px 24px rgba(20, 24, 29, 0.08)',
        'lift-lg': '0 24px 60px rgba(20, 24, 29, 0.12)',
        'card': '0 8px 24px rgba(20, 24, 29, 0.06)',
        'card-hover': '0 18px 40px rgba(20, 24, 29, 0.10)',
        'glow': '0 10px 22px rgba(20, 24, 29, 0.08)',
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(ellipse 60% 40% at 18% 12%, rgba(43,159,198,0.18), transparent 60%), radial-gradient(ellipse 55% 35% at 85% 22%, rgba(107,78,208,0.16), transparent 60%), linear-gradient(180deg, #0f1217 0%, #14181d 100%)',
        'gradient-charcoal': 'linear-gradient(180deg, #0f1217 0%, #14181d 100%)',
        'gradient-teal': 'linear-gradient(135deg, #2b9fc6 0%, #2f4ed1 100%)',
        'gradient-red': 'linear-gradient(135deg, #c54b65 0%, #c95aaa 100%)',
        'gradient-neon': 'linear-gradient(90deg, #2b9fc6 0%, #2f4ed1 32%, #6b4ed0 62%, #c54b65 100%)',
      },
    },
  },
  plugins: [],
}
export default config
