import { MONTHS } from '@const';

const getMonthIndex = (monthLabel: string): number => {
  return MONTHS.indexOf(monthLabel);
};

export default getMonthIndex;
