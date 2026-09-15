/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swiss Typographic Design System palette
        'background': '#f2f2f2',
        'primary-text': '#111111',
        'secondary-text': '#b6b5b5',
        'muted-text': '#838282',
        'echo-layer-1': '#bfbfbf',
        'echo-layer-2': '#c9c9c9',
        'echo-layer-3': '#d1d1d1',
        'echo-layer-4': '#d9d9d9',
        'border-light': '#1e1e1e/10',
        'border-dark': '#1e1e1e',
        'footer-bg': '#1e1e1e',
        'footer-text': '#f6f6f6',
      },
      fontFamily: {
        // Already set via CSS variables, but we can define here too for direct usage
        'clash': ['Clash Display', 'sans-serif'],
        'satoshi': ['Satoshi', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.primary-text'),
            '[class~="lead"]': {
              color: theme('colors.secondary-text'),
            },
            a: {
              color: theme('colors.primary-text'),
              '&:hover': {
                color: theme('colors.secondary-text'),
              },
            },
            strong: {
              color: theme('colors.primary-text'),
            },
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.primary-text'),
              fontFamily: theme('fontFamily.clash'),
            },
          },
        },
      }),
      keyframes: {
        // For micro-interactions
        'fade-in': {
          '0%': { opacity: '0', filter: 'grayscale(100%)' },
          '100%': { opacity: '1', filter: 'grayscale(0%)' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1.05)' },
        },
        'rotate-icon': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(12deg)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 700ms cubic-bezier(0.77, 0, 0.175, 1) forwards',
        'scale-up': 'scale-up 700ms cubic-bezier(0.77, 0, 0.175, 1)',
        'rotate-icon': 'rotate-icon 700ms cubic-bezier(0.77, 0, 0.175, 1)',
      }
    },
  },
  plugins: [],
}