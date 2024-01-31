import { DialogContent, styled } from '@mui/joy';

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  '& > div': {
    marginTop: theme.spacing(1),
  },
}));
