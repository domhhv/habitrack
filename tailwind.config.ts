import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      utilities: {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          layout: {
            disabledOpacity: 0.5,
          },
          colors: {
            background: {
              50: '#F3FBF7',
              100: '#E8F7EE',
              200: '#DFF2E7',
              300: '#D5EEDF',
              400: '#C4E4D1',
              500: '#B4DAC5',
              600: '#A4D0B9',
              700: '#8EBCA5',
              800: '#78A891',
              900: '#648F7C',
              foreground: '#333333',
              DEFAULT: '#F3FBF7',
            },
            foreground: '#333333',
            primary: {
              100: '#D2FCDD',
              200: '#A7F9C4',
              300: '#78EEAE',
              400: '#54DEA0',
              500: '#23C98F',
              600: '#19AC87',
              700: '#11907D',
              800: '#0B746E',
              900: '#065C60',
              DEFAULT: '#23C98F',
            },
            success: {
              100: '#D6FCCB',
              200: '#A5FA98',
              300: '#69F063',
              400: '#3CE245',
              500: '#05d023',
              600: '#03B22D',
              700: '#029533',
              800: '#017834',
              900: '#006334',
              foreground: '#fff',
              DEFAULT: '#05d023',
            },
            secondary: {
              100: '#D0EBFE',
              200: '#A1D4FE',
              300: '#72B8FE',
              400: '#4F9FFD',
              500: '#1676FC',
              600: '#105BD8',
              700: '#0B43B5',
              800: '#072F92',
              900: '#042178',
              DEFAULT: '#1676FC',
            },
            warning: {
              100: '#FFFACC',
              200: '#FFF599',
              300: '#FFEE66',
              400: '#FFE73F',
              500: '#FFDC00',
              600: '#DBBA00',
              700: '#B79900',
              800: '#937900',
              900: '#7A6200',
              DEFAULT: '#FFDC00',
            },
            danger: {
              100: '#FFDDD6',
              200: '#FFB3AE',
              300: '#FF8589',
              400: '#FF677A',
              500: '#FF3561',
              600: '#DB265F',
              700: '#B71A5A',
              800: '#931053',
              900: '#7A0A4D',
              DEFAULT: '#FF3561',
            },
            default: {
              100: '#F3F4F6',
              200: '#E5E7EB',
              300: '#D1D5DB',
              400: '#9CA3AF',
              500: '#6B7280',
              600: '#4B5563',
              700: '#374151',
              800: '#1F2937',
              900: '#111827',
              DEFAULT: '#D1D5DB',
            },
          },
        },
        dark: {
          layout: {
            disabledOpacity: 0.5,
          },
          colors: {
            background: {
              50: '#3D5C49',
              100: '#345141',
              200: '#2B4639',
              300: '#243B31',
              400: '#1E3129',
              500: '#19271F',
              600: '#131E17',
              700: '#0D140F',
              800: '#070B07',
              900: '#030403',
              foreground: '#FFFFFF',
              DEFAULT: '#19271F',
            },
            foreground: '#E5F5F1',
            primary: {
              100: '#CEF9D9',
              200: '#9FF3BD',
              300: '#6BDD9F',
              400: '#42BC86',
              500: '#149065',
              600: '#0E7B60',
              700: '#0A6759',
              800: '#06534F',
              900: '#034145',
              DEFAULT: '#149065',
            },
            success: {
              100: '#CAFBD3',
              200: '#97F7B2',
              300: '#60E894',
              400: '#39D282',
              500: '#05B56B',
              600: '#039B6A',
              700: '#028266',
              800: '#01685C',
              900: '#005655',
              foreground: '#D5FBD6',
              DEFAULT: '#05B56B',
            },
            secondary: {
              100: '#CDE9FD',
              200: '#9CD0FC',
              300: '#69B0F6',
              400: '#4492ED',
              500: '#0B65E2',
              600: '#084EC2',
              700: '#0539A2',
              800: '#032883',
              900: '#021C6C',
              DEFAULT: '#0B65E2',
            },
            warning: {
              100: '#FCFBCD',
              200: '#FAF89D',
              300: '#F0EC6B',
              400: '#E1DD45',
              500: '#CEC810',
              600: '#B1AB0B',
              700: '#948E08',
              800: '#777205',
              900: '#625E03',
              DEFAULT: '#CEC810',
            },
            danger: {
              100: '#FCE8CF',
              200: '#FACCA0',
              300: '#F0A56F',
              400: '#E17F4A',
              500: '#CE4A16',
              600: '#B13210',
              700: '#941F0B',
              800: '#770F07',
              900: '#620504',
              DEFAULT: '#CE4A16',
            },
            default: {
              100: '#111827',
              200: '#1F2937',
              300: '#374151',
              400: '#4B5563',
              500: '#6B7280',
              600: '#9CA3AF',
              700: '#D1D5DB',
              800: '#E5E7EB',
              900: '#F3F4F6',
              DEFAULT: '#6B7280',
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
