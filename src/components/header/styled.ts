import { IconButton } from '@mui/joy';
import { styled } from '@mui/joy/styles';

import { StyledAppWideContainer } from '../styled';

export const StyledAppHeader = styled('header')(({ theme }) => ({
  [theme.getColorSchemeSelector('light')]: {
    backgroundColor: theme.palette.neutral[300],
    borderBottom: `1px solid ${theme.palette.neutral[400]}`,
  },
  [theme.getColorSchemeSelector('dark')]: {
    backgroundColor: theme.palette.neutral[900],
    borderBottom: `1px solid ${theme.palette.neutral[900]}`,
  },
}));

export const StyledAppHeaderContent = styled(StyledAppWideContainer)(
  ({ theme }) => ({
    maxWidth: '100%',
    padding: theme.spacing(1, 2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 auto',
  })
);

export const StyledButtonsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  '& > .MuiButton-root:not(:last-child)': {
    marginRight: 10,
  },
});

export const StyledToggleModeIconButton = styled(IconButton)(({ theme }) => ({
  [theme.getColorSchemeSelector('light')]: {},
  [theme.getColorSchemeSelector('dark')]: {},
}));
