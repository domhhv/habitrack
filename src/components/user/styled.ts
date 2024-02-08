import { Box, Button, DialogContent, styled } from '@mui/joy';

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  '& > div': {
    marginTop: theme.spacing(1),
  },
}));

export const StyledAuthButton = styled(Button)(({ theme }) => ({
  [theme.getColorSchemeSelector('light')]: {
    backgroundColor: theme.palette.primary[600],
    color: theme.palette.primary[100],
    '&:hover': {
      backgroundColor: theme.palette.primary[800],
    },
  },
  [theme.getColorSchemeSelector('dark')]: {
    backgroundColor: theme.palette.primary[800],
    color: theme.palette.primary[100],
    '&:hover': {
      backgroundColor: theme.palette.primary[900],
    },
  },
}));

export const StyledAccountLoaderContainer = styled(Box)({
  width: '90%',
  margin: '0 auto',
  display: 'flex',
  height: 'calc(100vh - 52px)',
  alignItems: 'center',
  justifyContent: 'center',
});
