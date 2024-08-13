import { Chip, IconButton, ListItem, ListItemContent, styled } from '@mui/joy';

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
  borderRadius: 4,
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
  marginBottom: theme.spacing(0.5),
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

export const StyledHabitTraitChip = styled(Chip)({
  '& > span': {
    display: 'flex',
    alignItems: 'center',
  },
});

export const StyledHabitTraitColorIndicator = styled('span')(({ theme }) => ({
  width: 4,
  height: 4,
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: theme.spacing(0.5),
}));
