const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getMonthIndex = (monthLabel: string): number => {
  return MONTHS.indexOf(monthLabel);
};

export default getMonthIndex;
