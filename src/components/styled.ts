import { styled } from '@mui/joy';

export const StyledAppWideContainer = styled('div')(({ theme }) => ({
  width: '90%',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
  },
}));
