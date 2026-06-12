import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

// "Paper & ink" design direction — see DESIGN_SYSTEM.md.
// Two token-level remaps re-skin the whole app:
//   gray    -> stone  (warm paper neutrals instead of cool blue-grays)
//   primary -> indigo (editorial accent instead of default blue)
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.stone,
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
