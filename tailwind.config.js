import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // fontWeight: {
    //   normal: 600,
    // },
    extend: {},
  },
  plugins: [
    nextui({
      addCommonColors: true,
    }),
  ],
};
