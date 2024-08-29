import { styled } from '@mui/joy';

import { StyledAppWideContainer } from '../styled';

export const StyledAccountPageContainer = styled(StyledAppWideContainer)({
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 52px)',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StyledAccountForm = styled('form')({
  width: 400,
});
