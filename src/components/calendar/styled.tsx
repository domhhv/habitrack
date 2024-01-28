import { Box, Chip, IconButton, Typography } from '@mui/joy';
import { styled } from '@mui/joy/styles';

const calendarGap = 16;

export const StyledCalendarContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: `${theme.spacing(2)} auto 0`,
  width: '90%',
  maxWidth: '100%',
  padding: theme.spacing(0, 2),
  flex: '1 1 0%',
}));

export const StyledCalendarGridContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: calendarGap,
  flexDirection: 'column',
  margin: `${theme.spacing(2)} 0`,
  flex: '1 1 0%',
}));

export const StyledCalendarMonthGrid = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: calendarGap,
  flex: '1 1 0%',
});

export const StyledCalendarWeekDay = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '1 1 0%',
});

export const StyledCalendarWeekRow = styled('div')({
  display: 'flex',
  flex: '1 1 0%',
  gap: calendarGap,
});

export const StyledCalendarHeader = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  border: '3px solid',
  borderRadius: theme.radius.md,
  alignItems: 'center',
  position: 'relative',
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
    backgroundColor: 'white',
    '&:not([disabled]):hover': {
      backgroundColor: '#f5f5f4',
    },
  },
  '&[data-active="true"]': {
    backgroundColor: '#f5f5f4',
    '&:not([disabled])': {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#e7e5e4',
      },
    },
  },
  '&[data-current="true"]': {
    backgroundColor: '#e7e5e4',
    '&:not([disabled])': {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#d6d3d1',
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
  borderBottom: `3px solid ${theme.palette.neutral[400]}`,
  boxSizing: 'border-box',
}));

export const StyledCalendarDayCellButtonIconsContainer = styled(Box)(
  ({ theme }) => ({
    padding: theme.spacing(0.25, 0.5),
    textAlign: 'left',
  })
);

export const StyledHabitChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(0.6),
}));
