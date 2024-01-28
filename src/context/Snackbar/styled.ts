import { styled } from '@mui/joy';

export const StyledSnackbarsWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  zIndex: 9999,
}));
