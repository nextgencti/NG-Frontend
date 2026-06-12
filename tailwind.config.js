/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        accent: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
        },
        text: {
          main: '#111827',
          muted: '#6B7280',
        },
        border: {
          main: '#E5E7EB',
        },
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        'helvetica-light': ['Plus Jakarta Sans', 'sans-serif'],
        'neue-machina-ultrabold': ['Outfit', 'sans-serif'],
        'neue-machina-medium': ['Plus Jakarta Sans', 'sans-serif'],
        'juana-regular': ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        soft: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
      },
      backgroundImage: {
        'dashboard-grid': 'linear-gradient(to right, rgba(0, 0, 0, 0.01) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
