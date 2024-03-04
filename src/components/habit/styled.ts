import { styled } from '@mui/joy';

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

export const StyledTraitColorIndicator = styled('span')(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  display: 'inline-block',
  marginLeft: theme.spacing(0.5),
}));
