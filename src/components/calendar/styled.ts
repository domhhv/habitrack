import { styled } from '@mui/joy/styles';

export const StyledCalendarDayCellDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 0%',
  height: 110,
  maxWidth: 172,
  borderRadius: theme.radius.md,
  border: `3px solid ${theme.palette.neutral[700]}`,
  padding: 0,
  backgroundColor: 'transparent',
  [theme.breakpoints.down('lg')]: {
    border: 'none',
    borderRadius: 0,
    borderTop: '3px solid',
    borderColor: `${theme.palette.neutral[700]} !important`,
    borderRight: '3px solid',
    '&:first-of-type': {
      borderLeft: `3px solid ${theme.palette.neutral[700]}`,
    },
    '& > div:first-of-type': {
      borderBottom: 'none',
    },
  },
  '&[data-is-within-prev-month="true"]:not([disabled])': {
    cursor: 'w-resize',
  },
  '&[data-is-within-next-month="true"]:not([disabled])': {
    cursor: 'e-resize',
  },
  '&[data-is-within-active-month="false"]': {
    '&:hover': {
      [theme.getColorSchemeSelector('light')]: {
        backgroundColor: theme.palette.neutral[50],
      },
      [theme.getColorSchemeSelector('dark')]: {
        backgroundColor: theme.palette.neutral[900],
      },
    },
    [theme.getColorSchemeSelector('light')]: {
      borderColor: theme.palette.neutral[300],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[300],
        '& p': {
          color: theme.palette.neutral[300],
        },
      },
    },
    [theme.getColorSchemeSelector('dark')]: {
      borderColor: theme.palette.neutral[600],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[600],
        '& p': {
          color: theme.palette.neutral[600],
        },
      },
    },
  },
  '&[data-is-within-active-month="true"]': {
    cursor: 'pointer',
    '& > div:first-of-type': {
      cursor: 'pointer',
    },
    [theme.getColorSchemeSelector('light')]: {
      borderColor: theme.palette.neutral[500],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[500],
        '& p': {
          color: theme.palette.neutral[500],
        },
      },
    },
    [theme.getColorSchemeSelector('dark')]: {
      borderColor: theme.palette.neutral[400],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[400],
        '& p': {
          color: theme.palette.neutral[400],
        },
      },
    },
    '&:hover': {
      [theme.getColorSchemeSelector('light')]: {
        borderColor: theme.palette.neutral[900],
        '& > div:first-of-type': {
          borderColor: theme.palette.neutral[900],
          '& p': {
            color: theme.palette.neutral[900],
          },
        },
      },
      [theme.getColorSchemeSelector('dark')]: {
        borderColor: theme.palette.neutral[300],
        '& > div:first-of-type': {
          borderColor: theme.palette.neutral[300],
          '& p': {
            color: theme.palette.neutral[300],
          },
        },
      },
    },
  },
  '&[data-is-today="true"]': {
    '&[data-is-within-active-month="false"]': {
      [theme.getColorSchemeSelector('light')]: {
        borderColor: theme.palette.neutral[400],
        '& > div:first-of-type': {
          borderColor: theme.palette.neutral[400],
          '& p': {
            color: theme.palette.neutral[400],
          },
        },
      },
      [theme.getColorSchemeSelector('dark')]: {
        borderColor: theme.palette.neutral[500],
        '& > div:first-of-type': {
          borderColor: theme.palette.neutral[500],
          '& p': {
            color: theme.palette.neutral[500],
          },
        },
      },
    },
    '&:hover': {
      [theme.getColorSchemeSelector('light')]: {
        backgroundColor: theme.palette.neutral[300],
      },
      [theme.getColorSchemeSelector('dark')]: {
        backgroundColor: theme.palette.neutral[900],
      },
    },
    [theme.getColorSchemeSelector('light')]: {
      borderColor: theme.palette.neutral[700],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[700],
        '& p': {
          color: theme.palette.neutral[700],
        },
      },
    },
    [theme.getColorSchemeSelector('dark')]: {
      borderColor: theme.palette.neutral[300],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[300],
        '& p': {
          color: theme.palette.neutral[300],
        },
      },
    },
  },
}));
