import { DAYS_OF_WEEK } from '@const';

const parseDayOfWeek = (value: FormDataEntryValue | null) => {
  return (
    DAYS_OF_WEEK.find((day) => {
      return day === value;
    }) ?? DAYS_OF_WEEK[1]
  );
};

export default parseDayOfWeek;
