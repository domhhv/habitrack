import { extendTheme } from '@mui/joy/styles';

export const theme = extendTheme({
  components: {
    JoyAlert: {
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          if (ownerState.color !== 'neutral' && ownerState.variant !== 'soft') {
            return null;
          }

          return theme.palette.mode === 'light'
            ? {
                backgroundColor: theme.palette.neutral[50],
                color: theme.palette.neutral[800],
              }
            : {
                backgroundColor: theme.palette.neutral[900],
                color: theme.palette.neutral[100],
              };
        },
      },
    },
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        },
        neutral: {
          '50': '#f9fafb',
          '100': '#f3f4f6',
          '200': '#e5e7eb',
          '300': '#d1d5db',
          '400': '#9ca3af',
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
          '800': '#1f2937',
          '900': '#111827',
        },
        danger: {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
          '800': '#991b1b',
          '900': '#7f1d1d',
        },
        success: {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#14532d',
        },
        warning: {
          '50': '#fff7ed',
          '100': '#ffedd5',
          '200': '#fed7aa',
          '300': '#fdba74',
          '400': '#fb923c',
          '500': '#f97316',
          '600': '#ea580c',
          '700': '#c2410c',
          '800': '#9a3412',
          '900': '#7c2d12',
        },
        background: {
          body: 'var(--joy-palette-common-white)',
          surface: 'var(--joy-palette-neutral-50)',
          popup: 'var(--joy-palette-common-white)',
          level1: 'var(--joy-palette-neutral-100)',
          level2: 'var(--joy-palette-neutral-200)',
          level3: 'var(--joy-palette-neutral-300)',
          tooltip: 'var(--joy-palette-neutral-500)',
          backdrop:
            'rgba(var(--joy-palette-neutral-darkChannel, 11 13 14) / 0.25)',
        },
        text: {
          primary: 'var(--joy-palette-neutral-800)',
          secondary: 'var(--joy-palette-neutral-700)',
          tertiary: 'var(--joy-palette-neutral-600)',
          icon: 'var(--joy-palette-neutral-500)',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        },
        neutral: {
          '50': '#f9fafb',
          '100': '#f3f4f6',
          '200': '#e5e7eb',
          '300': '#d1d5db',
          '400': '#9ca3af',
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
          '800': '#1f2937',
          '900': '#111827',
        },
        danger: {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
          '800': '#991b1b',
          '900': '#7f1d1d',
        },
        success: {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#14532d',
        },
        warning: {
          '50': '#fff7ed',
          '100': '#ffedd5',
          '200': '#fed7aa',
          '300': '#fdba74',
          '400': '#fb923c',
          '500': '#f97316',
          '600': '#ea580c',
          '700': '#c2410c',
          '800': '#9a3412',
          '900': '#7c2d12',
        },
        background: {
          body: 'var(--joy-palette-common-black)',
          surface: 'var(--joy-palette-neutral-900)',
          popup: 'var(--joy-palette-common-black)',
          level1: 'var(--joy-palette-neutral-800)',
          level2: 'var(--joy-palette-neutral-700)',
          level3: 'var(--joy-palette-neutral-600)',
          tooltip: 'var(--joy-palette-neutral-600)',
          backdrop:
            'rgba(var(--joy-palette-neutral-darkChannel, 251 252 254) / 0.25)',
        },
        text: {
          primary: 'var(--joy-palette-neutral-100)',
          secondary: 'var(--joy-palette-neutral-300)',
          tertiary: 'var(--joy-palette-neutral-300)',
          icon: 'var(--joy-palette-neutral-300)',
        },
      },
    },
  },
});
