import { styled } from '@mui/joy/styles';

export const StyledAppHeader = styled('header')({
  backgroundColor: '#d6d3d1',
  borderBottom: '1px solid #78716c',
});

export const StyledAppHeaderContent = styled('div')(({ theme }) => ({
  width: '90%',
  maxWidth: '100%',
  padding: theme.spacing(1, 2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
}));

export const StyledButtonsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  '& > button:first-of-type': {
    marginRight: 10,
  },
});
