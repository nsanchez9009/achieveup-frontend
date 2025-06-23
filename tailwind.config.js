/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbf0',
          100: '#fff7e6',
          200: '#ffedb3',
          300: '#ffe380',
          400: '#ffd94d',
          500: '#ffca06', // UCF Bright Gold
          600: '#e6b600',
          700: '#cc9f00',
          800: '#b38800',
          900: '#997100',
        },
        ucf: {
          black: '#000000',
          gold: '#ffca06', // Bright Gold RGB(255, 202, 6)
          grey: '#6c757d',
          white: '#ffffff',
        },
        success: '#28a745',
        warning: '#ffca06', // Using UCF gold for warning
        info: '#6c757d', // Using UCF grey for info
        danger: '#dc3545',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
} 