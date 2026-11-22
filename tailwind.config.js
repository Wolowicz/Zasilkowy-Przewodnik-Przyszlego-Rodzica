import fs from 'node:fs';
const names = JSON.parse(fs.readFileSync(new URL('./tailwind.colors.json', import.meta.url)));
const colors = Object.fromEntries(names.map((n) => [n, `rgb(var(--c-${n}) / <alpha-value>)`]));
const head = ['var(--font-head)'];
const body = ['var(--font-body)'];

/** Tokeny 1:1 z DESIGN.md „Tender Guidance”; kolory przez zmienne CSS (motyw Otula / ZUS). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      borderRadius: { DEFAULT: '1rem', lg: '2rem', xl: '3rem', full: '9999px' },
      spacing: { 'gutter-desktop': '1.5rem', 'space-md': '1rem', 'space-xs': '0.5rem', 'margin-desktop': '3rem', margin: '1rem', 'space-sm': '0.75rem', 'space-xl': '2rem', gutter: '1rem', 'space-lg': '1.5rem', 'margin-tablet': '2rem' },
      fontFamily: Object.fromEntries(['headline-lg', 'headline-md', 'headline-sm', 'headline-xl', 'headline-lg-mobile', 'headline-xl-mobile'].map((k) => [k, head]).concat(['body-md-medium', 'body-sm', 'body-lg', 'body-md', 'caption', 'label-uppercase', 'button-text', 'mono-data'].map((k) => [k, body]))),
      fontSize: {
        'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body-md-medium': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', letterSpacing: '0em', fontWeight: '700' }],
        'headline-md': ['22px', { lineHeight: '30px', fontWeight: '700' }],
        'headline-sm': ['18px', { lineHeight: '26px', fontWeight: '700' }],
        'headline-xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-uppercase': ['12px', { lineHeight: '16px', letterSpacing: '0.1em', fontWeight: '800' }],
        'button-text': ['15px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '700' }],
        'headline-xl-mobile': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
