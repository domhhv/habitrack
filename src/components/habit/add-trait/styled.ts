import { styled } from '@mui/joy/styles';

export const StyledColorPickerContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: '1rem',
  '& > div:first-of-type': {
    marginRight: theme.spacing(1),
  },
  '& > div:last-of-type': {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    '& > div': {
      marginBottom: theme.spacing(1),
    },
  },
}));
