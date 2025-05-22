/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'primary': '#AB0E1E',
          'secondary': '#8D0C18',
          'dark': '#243444',
          'medium': '#76848F',
          'light': '#A3AAAE',
          'lightest': '#D0D3D4',
        }
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 