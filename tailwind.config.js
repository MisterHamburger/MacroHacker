/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        base: '#0a0a0a',
        surface: '#111111',
        elevated: '#1a1a1a',
        card: '#141414',
        border: '#222222',
        'border-subtle': '#1c1c1c',
        accent: '#c8f135',
        'accent-dim': 'rgba(200, 241, 53, 0.12)',
        'accent-glow': 'rgba(200, 241, 53, 0.25)',
        'status-good': '#c8f135',
        'status-over': '#ff6b6b',
        'text-primary': '#f0f0f0',
        'text-secondary': '#888888',
        'text-muted': '#444444',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
    },
  },
  plugins: [],
}
