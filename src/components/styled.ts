import { styled } from '@mui/joy';

export const StyledAppWideContainer = styled('div')(({ theme }) => ({
  width: '90%',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },
}));

export const StyledAppContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '1 1 0%',
  [theme.getColorSchemeSelector('light')]: {
    backgroundColor: theme.palette.neutral[200],
  },
  [theme.getColorSchemeSelector('dark')]: {
    backgroundColor: theme.palette.neutral[800],
  },
}));
