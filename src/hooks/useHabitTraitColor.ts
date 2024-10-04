import { useTraits } from '@context';

const useHabitTraitColor = (traitId: string | number): string => {
  const { traitsMap } = useTraits();

  return traitsMap[traitId]?.color || 'black';
};

export default useHabitTraitColor;
