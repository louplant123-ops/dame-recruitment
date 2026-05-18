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
        // Dame Recruitment 2026 brand board
        charcoal: '#0A0F1A',
        graphite: '#111827',
        ink: '#030712',
        'light-text': '#E8ECF3',
        'dark-text': '#F7F8FC',
        'neutral-white': '#0A0F1A',
        'neutral-light': '#111827',
        'primary-red': '#FF4D6D',
        'accent-teal': '#00E5FF',
        'accent-yellow': '#F4C95D',
        'accent-blue': '#2563FF',
        'accent-green': '#00C781',
        'accent-purple': '#7C3AED',
        'accent-pink': '#D946EF',
        'panel': '#101827',
        'panel-soft': '#151F32',
        'line': '#263244',
      },
      fontFamily: {
        'heading': ['var(--font-playfair)', 'Georgia', 'serif'],
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
        'lift': '0 14px 34px rgba(0, 0, 0, 0.28)',
        'lift-lg': '0 24px 70px rgba(0, 0, 0, 0.36)',
        'card': '0 16px 40px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 24px 70px rgba(0, 0, 0, 0.34)',
        'glow': '0 0 34px rgba(124, 58, 237, 0.24), 0 0 22px rgba(0, 229, 255, 0.18)',
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(circle at 15% 15%, rgba(0,229,255,0.16), transparent 28%), radial-gradient(circle at 85% 18%, rgba(217,70,239,0.15), transparent 30%), linear-gradient(135deg, #030712 0%, #0A0F1A 46%, #111827 100%)',
        'gradient-charcoal': 'linear-gradient(180deg, #030712 0%, #0A0F1A 100%)',
        'gradient-teal': 'linear-gradient(135deg, #00E5FF 0%, #2563FF 100%)',
        'gradient-red': 'linear-gradient(135deg, #FF4D6D 0%, #D946EF 56%, #7C3AED 100%)',
        'gradient-neon': 'linear-gradient(90deg, #00E5FF 0%, #2563FF 34%, #7C3AED 66%, #FF4D6D 100%)',
      },
    },
  },
  plugins: [],
}
export default config
