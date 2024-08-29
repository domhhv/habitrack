import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Box, Chip, type Theme } from '@mui/joy';
import { styled } from '@mui/joy/styles';

const calendarGap = 16;

const getDarkNeutralColor = (theme: Theme) => theme.palette.neutral[300];

const getLightNeutralColor = (theme: Theme) => theme.palette.neutral[600];

const StyledWithGapDiv = styled('div')(({ theme }) => ({
  gap: calendarGap,
  [theme.breakpoints.down('lg')]: {
    gap: 0,
  },
}));

export const StyledCalendarGridContainerDiv = styled(StyledWithGapDiv)(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    margin: `${theme.spacing(2)} 0`,
    flex: '1 1 0%',
  })
);

export const StyledCalendarWeekDay = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '1 1 0%',
  [theme.getColorSchemeSelector('light')]: {
    color: getLightNeutralColor(theme),
  },
  [theme.getColorSchemeSelector('dark')]: {
    color: getDarkNeutralColor(theme),
  },
}));

export const StyledCalendarMonthGrid = styled(StyledWithGapDiv)({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 0%',
});

export const StyledCalendarWeekRow = styled(StyledWithGapDiv)(({ theme }) => ({
  display: 'flex',
  flex: 0,
  justifyContent: 'space-between',
  [theme.breakpoints.down('lg')]: {
    height: 110,
    '&:last-of-type': {
      borderBottom: `3px solid ${theme.palette.neutral[700]}`,
    },
  },
}));

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
    borderBottom: '3px solid',
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
      backgroundColor: theme.palette.neutral[200],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[700],
        '& p': {
          color: theme.palette.neutral[700],
        },
      },
    },
    [theme.getColorSchemeSelector('dark')]: {
      borderColor: theme.palette.neutral[300],
      backgroundColor: theme.palette.neutral[800],
      '& > div:first-of-type': {
        borderColor: theme.palette.neutral[300],
        '& p': {
          color: theme.palette.neutral[300],
        },
      },
    },
  },
}));

export const StyledCalendarDayCellHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0.5),
  width: '100%',
  borderBottom: '3px solid',
  boxSizing: 'border-box',
  [theme.getColorSchemeSelector('light')]: {
    borderColor: theme.palette.neutral[300],
  },
  [theme.getColorSchemeSelector('dark')]: {
    borderColor: theme.palette.neutral[600],
  },
}));

export const StyledCalendarDayCellButtonIconsContainer = styled(Box)(
  ({ theme }) => ({
    display: 'flex',
    maxHeight: 141,
    overflow: 'auto',
    flexWrap: 'wrap',
    padding: theme.spacing(0.25, 0.5),
    textAlign: 'left',
  })
);

export const StyledHabitChip = styled(Chip)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  marginTop: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
}));

export const StyledCalendarTodayIcon = styled(CalendarTodayIcon)(
  ({ theme }) => ({
    color: theme.palette.neutral[600],
    width: 20,
    height: 20,
  })
);

export const StyledOccurrenceHabitImg = styled('img')({
  width: 20,
  height: 20,
  borderRadius: 4,
});
