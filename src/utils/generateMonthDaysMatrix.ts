export default function generateMonthDaysMatrix(month: number, year: number) {
  const activeMonthFirstDayDate = getFirstDayDateOfMonth(month, year);

  const firstDayIndex = activeMonthFirstDayDate.getDay() - 1;

  const prevMonthLastDayDateNumber = new Date(
    month === 0
      ? activeMonthFirstDayDate.getFullYear() - 1
      : activeMonthFirstDayDate.getFullYear(),
    month === 0 ? 11 : activeMonthFirstDayDate.getMonth(),
    0
  ).getDate();

  const currMonthLastDayDateNumber = new Date(
    month === 11
      ? activeMonthFirstDayDate.getFullYear() + 1
      : activeMonthFirstDayDate.getFullYear(),
    month === 11 ? 0 : activeMonthFirstDayDate.getMonth() + 1,
    0
  ).getDate();

  const veryFirstDate = prevMonthLastDayDateNumber - firstDayIndex + 1;

  let counter = 1;
  let otherCounter = 1;
  const matrix: {
    dateNumber: number;
    monthIndex: number;
    fullYear: number;
  }[][] = [[], [], [], [], []];

  const datesArray = Array.from(new Array(35), (_, index) => {
    // Fill in previous month dates if available
    if (index < firstDayIndex) {
      return {
        dateNumber: veryFirstDate + index,
        monthIndex: month === 0 ? 11 : month - 1,
        fullYear: month === 0 ? year - 1 : year,
      };
    }

    // Fill in current month dates
    if (index < currMonthLastDayDateNumber + firstDayIndex) {
      return {
        dateNumber: counter++,
        monthIndex: month,
        fullYear: year,
      };
    }

    // Lastly, fill in next month dates if available
    return {
      dateNumber: otherCounter++,
      monthIndex: month === 11 ? 0 : month + 1,
      fullYear: month === 11 ? year + 1 : year,
    };
  });

  for (let week = 0; week < 5; week++) {
    for (let day = 0; day < 7; day++) {
      matrix[week] = datesArray.slice(week * 7, (week + 1) * 7);
    }
  }

  return matrix;
}

const getFirstDayDateOfMonth = (month: number, year: number) => {
  const activeMonthFirstDayDate = new Date(month, year);
  activeMonthFirstDayDate.setDate(1);
  activeMonthFirstDayDate.setMonth(month);
  activeMonthFirstDayDate.setFullYear(year);
  return activeMonthFirstDayDate;
};
