import { Box, IconButton, ListItem, ListItemContent, styled } from '@mui/joy';

export const StyledPlaceholderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 200,
  width: 300,
  margin: `${theme.spacing(1)} auto 0`,
}));

export const StyleListItem = styled(ListItem)(({ theme }) => ({
  alignItems: 'flex-start',
  padding: theme.spacing(1.5, 0, 1),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

export const StyledEditIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

export const StyledListItemContent = styled(ListItemContent)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

export const StyledHabitTitleWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& > div': {
    marginLeft: theme.spacing(1),
  },
}));

export const StyledHabitImage = styled('img')({
  display: 'inline-block',
  width: 20,
  height: 20,
});
