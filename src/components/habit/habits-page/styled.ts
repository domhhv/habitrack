import { IconButton, ListItem, ListItemContent, styled } from '@mui/joy';

import { StyledAppWideContainer } from '../../styled';

export const StyledPageDiv = styled(StyledAppWideContainer)({
  margin: '24px auto 0',
  padding: '0 16px',
  textAlign: 'center',
});

export const StyledList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  maxWidth: 400,
  margin: '0 auto 16px',
});

export const StyledHabitImage = styled('img')({
  width: 32,
  height: 32,
});

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: '1px',
});

export const StyledImageIconButton = styled(IconButton)(({ theme }) => ({
  display: 'flex',
  marginRight: theme.spacing(1),
  padding: theme.spacing(1),
  cursor: 'pointer',
  borderRadius: 4,
  [theme.getColorSchemeSelector('light')]: {
    '&:hover': {
      backgroundColor: theme.palette.neutral[200],
    },
  },
  [theme.getColorSchemeSelector('dark')]: {
    '&:hover': {
      backgroundColor: theme.palette.neutral[700],
    },
  },
}));

export const StyledEditIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

export const StyledHabitTitleWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > div': {
    marginLeft: theme.spacing(1),
  },
}));

export const StyledListItemContent = styled(ListItemContent)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  alignItems: 'center',
  padding: theme.spacing(2, 0, 1.5),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));
