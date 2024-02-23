import { useTraits } from '@context';
import type { ChipProps } from '@mui/joy';

const useHabitTraitChipColor = (traitId: number): ChipProps['color'] => {
  const { traitsMap } = useTraits();
  const { slug } = traitsMap[traitId] || {};

  if (slug === 'good') {
    return 'success';
  }

  if (slug === 'bad') {
    return 'danger';
  }

  return 'neutral';
};

export default useHabitTraitChipColor;
