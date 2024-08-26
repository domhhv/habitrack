import { useTraits } from '@context';

const useHabitTraitChipColor = (traitId: string | number): string => {
  const { traitsMap } = useTraits();

  return traitsMap[traitId]?.color || 'black';
};

export default useHabitTraitChipColor;
