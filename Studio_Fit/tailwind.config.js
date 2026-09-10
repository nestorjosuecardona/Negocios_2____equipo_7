/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#d4af37',
        'gold-light': '#e6c563',
        dark: '#0a0e27',
        darker: '#050813',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#d4af37",
          "primary-focus": "#e6c563",
          "secondary": "#8a8a8a",
          "accent": "#c0c0c0",
          "neutral": "#0a0e27",
          "base-100": "#050813",
          "base-200": "#0a0e27",
          "base-300": "#111635",
          "info": "#3b82f6",
          "success": "#4caf50",
          "warning": "#f59e0b",
          "error": "#f44336",
        },
      },
    ],
  },
}
