/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2337ff',
          dark: '#000d8a',
        },
        gray: {
          DEFAULT: 'rgb(96, 115, 159)',
          light: 'rgb(229, 233, 240)',
          dark: 'rgb(34, 41, 57)',
        },
        black: 'rgb(15, 18, 25)',
      },
      fontFamily: {
        'atkinson': ['Atkinson', 'sans-serif'],
      },
      fontSize: {
        'heading-1': '3.052em',
        'heading-2': '2.441em',
        'heading-3': '1.953em',
        'heading-4': '1.563em',
        'heading-5': '1.25em',
      },
      boxShadow: {
        'custom': '0 2px 6px rgba(96, 115, 159, 0.25), 0 8px 24px rgba(96, 115, 159, 0.33), 0 16px 32px rgba(96, 115, 159, 0.33)',
      },
      backgroundImage: {
        'gradient-custom': 'linear-gradient(rgba(229, 233, 240, 0.5), #fff)',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Atkinson, sans-serif',
            fontSize: '20px',
            lineHeight: '1.7',
            color: 'rgb(34, 41, 57)',
            h1: { color: 'rgb(15, 18, 25)' },
            h2: { color: 'rgb(15, 18, 25)' },
            h3: { color: 'rgb(15, 18, 25)' },
            h4: { color: 'rgb(15, 18, 25)' },
            h5: { color: 'rgb(15, 18, 25)' },
            h6: { color: 'rgb(15, 18, 25)' },
            a: { color: '#2337ff' },
            code: { color: 'rgb(34, 41, 57)' },
            blockquote: {
              borderLeftColor: '#2337ff',
              color: 'rgb(34, 41, 57)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}