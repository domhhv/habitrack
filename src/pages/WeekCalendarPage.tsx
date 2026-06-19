import React from 'react';

import { WeekCalendar } from '@components';

const WeekCalendarPage = () => {
  return (
    <div className="relative flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-4 pb-8 md:gap-3 md:py-3 lg:px-16">
      <WeekCalendar />
    </div>
  );
};

export default WeekCalendarPage;
