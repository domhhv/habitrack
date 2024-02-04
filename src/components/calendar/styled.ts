import { Box, Chip, IconButton, type Theme, Typography } from '@mui/joy';
import { styled } from '@mui/joy/styles';

const calendarGap = 16;

const getDarkNeutralColor = (theme: Theme) => theme.palette.neutral[300];

const getLightNeutralColor = (theme: Theme) => theme.palette.neutral[600];

export const StyledCalendarBackgroundDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: theme.spacing(2),
  flex: '1 1 0%',
  [theme.getColorSchemeSelector('light')]: {
    backgroundColor: theme.palette.neutral[100],
  },
  [theme.getColorSchemeSelector('dark')]: {
    backgroundColor: theme.palette.neutral[800],
  },
}));

export const StyledCalendarContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: `${theme.spacing(2)} auto 0`,
  width: '90%',
  maxWidth: '100%',
  padding: theme.spacing(0, 2),
  flex: '1 1 0%',
}));

export const StyledCalendarHeader = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  border: '3px solid',
  borderRadius: theme.radius.md,
  alignItems: 'center',
  position: 'relative',
  [theme.getColorSchemeSelector('light')]: {
    borderColor: getLightNeutralColor(theme),
    '& p': {
      color: getLightNeutralColor(theme),
    },
  },
  [theme.getColorSchemeSelector('dark')]: {
    borderColor: getDarkNeutralColor(theme),
    '& p': {
      color: getDarkNeutralColor(theme),
    },
  },
}));

export const StyledCalendarActiveMonthContainer = styled('div')({
  width: 230,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const StyledCalendarNavigationContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const StyledNavigationIconButton = styled(IconButton)(({ theme }) => ({
  [theme.getColorSchemeSelector('light')]: {
    '& svg': {
      color: getLightNeutralColor(theme),
    },
  },
  [theme.getColorSchemeSelector('dark')]: {
    '& svg': {
      color: getDarkNeutralColor(theme),
    },
  },
  '&:first-of-type': {
    marginRight: theme.spacing(1),
  },
}));

export const StyledHeaderLoadingOverlay = styled(Typography)(({ theme }) => ({
  borderRadius: theme.radius.md,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  margin: 'auto',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StyledCalendarGridContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: calendarGap,
  flexDirection: 'column',
  margin: `${theme.spacing(2)} 0`,
  flex: '1 1 0%',
}));

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

export const StyledCalendarMonthGrid = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: calendarGap,
  flex: '1 1 0%',
});

export const StyledCalendarWeekRow = styled('div')({
  display: 'flex',
  flex: '1 1 0%',
  gap: calendarGap,
});

export const StyledCalendarDayCellButton = styled('button')(({ theme }) => ({
  background: 'none',
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 0%',
  minHeight: 100,
  borderRadius: theme.radius.md,
  border: '3px solid black',
  padding: 0,
  '&[data-prev-month="true"]:not([disabled])': {
    cursor: 'w-resize',
  },
  '&[data-next-month="true"]:not([disabled])': {
    cursor: 'e-resize',
  },
  '&[data-prev-month="true"], &[data-next-month="true"]': {
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
  '&[data-active="true"]': {
    cursor: 'pointer',
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
  '&[data-current="true"]': {
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

export const StyledCalendarDayCellButtonHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0.5),
  width: '100%',
  borderBottom: '3px solid',
  boxSizing: 'border-box',
}));

export const StyledCalendarDayCellButtonIconsContainer = styled(Box)(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0.25, 0.5),
    textAlign: 'left',
  })
);

export const StyledHabitChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(0.6),
}));
