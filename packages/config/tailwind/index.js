/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tz: {
          bg: '#0A0A0A',
          surface: '#141414',
          'surface-2': '#1E1E1E',
          border: '#2A2A2A',
          gold: '#C8A96E',
          'gold-light': '#E4C98A',
          'gold-dark': '#A88A52',
          electric: '#D4FF3C',
          'electric-dark': '#AACC00',
          white: '#F0EDE8',
          muted: '#6B6868',
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        tz: '12px',
        'tz-sm': '8px',
        'tz-lg': '16px',
        'tz-xl': '24px',
      },
      boxShadow: {
        'tz-gold': '0 0 20px rgba(200, 169, 110, 0.15)',
        'tz-electric': '0 0 20px rgba(212, 255, 60, 0.20)',
        'tz-card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 169, 110, 0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(200, 169, 110, 0.1)' },
        },
      },
    },
  },
  plugins: [],
}
