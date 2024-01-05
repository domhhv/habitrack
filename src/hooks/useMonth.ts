import { generateMonthDaysMatrix } from '@utils';
import React from 'react';

const months = [
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

export default function useMonth() {
  const today = new Date();
  const [activeMonthIndex, setCurrentMonthIndex] = React.useState(
    today.getMonth()
  );
  const [activeYear, setActiveYear] = React.useState(today.getFullYear());
  const monthDaysMatrix5x7 = generateMonthDaysMatrix(
    activeMonthIndex,
    activeYear
  );
  const activeMonthLabel = months[activeMonthIndex];

  const handleNavigateBack = () => {
    setCurrentMonthIndex((prevMonthIndex) => {
      if (prevMonthIndex === 0) {
        setActiveYear(activeYear - 1);

        return 11;
      }

      return prevMonthIndex - 1;
    });
  };

  const handleNavigateForward = () => {
    setCurrentMonthIndex((prevMonthIndex) => {
      if (prevMonthIndex === 11) {
        setActiveYear(activeYear + 1);

        return 0;
      }

      return prevMonthIndex + 1;
    });
  };

  return {
    activeMonthIndex,
    activeMonthLabel,
    activeYear,
    monthDaysMatrix5x7,
    handleNavigateBack,
    handleNavigateForward,
  };
}
