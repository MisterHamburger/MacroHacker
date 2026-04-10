/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        din: ['"D-DIN"', 'Arial', 'Verdana', 'sans-serif'],
        sans: ['"D-DIN"', 'Arial', 'Verdana', 'sans-serif'],
        mono: ['"D-DIN"', 'Arial', 'Verdana', 'sans-serif'],
      },
      colors: {
        base: '#000000',
        surface: '#050505',
        elevated: '#0a0a0a',
        card: '#050505',
        border: 'rgba(240,240,250,0.12)',
        'border-subtle': 'rgba(240,240,250,0.06)',
        accent: '#f0f0fa',
        'accent-dim': 'rgba(240,240,250,0.1)',
        'ghost-border': 'rgba(240,240,250,0.35)',
        'status-over': '#ff4040',
        'text-primary': '#f0f0fa',
        'text-secondary': 'rgba(240,240,250,0.5)',
        'text-muted': 'rgba(240,240,250,0.25)',
      },
      borderRadius: {
        sm: '4px',
        md: '4px',
        lg: '4px',
        button: '32px',
      },
      letterSpacing: {
        display: '0.96px',
        label: '1.17px',
        micro: '1px',
      },
    },
  },
  plugins: [],
}
