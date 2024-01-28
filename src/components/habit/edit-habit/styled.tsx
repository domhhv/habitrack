import { styled } from '@mui/joy';

export const StyledForm = styled('form')(({ theme }) => ({
  '& > div': {
    marginBottom: theme.spacing(2),
  },
}));
