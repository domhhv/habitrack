import React from 'react';

import { WeekCalendar } from '@components';

const WeekCalendarPage = () => {
  return (
    <div className="relative my-8 flex h-full w-full max-w-full flex-1 flex-col space-y-8 px-8 py-2 lg:px-16 lg:py-4">
      <WeekCalendar />
    </div>
  );
};

export default WeekCalendarPage;
