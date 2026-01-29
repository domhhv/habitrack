import React from 'react';

import { DayCalendar } from '@components';

const DayCalendarPage = () => {
  return (
    <div className="relative my-4 flex h-full w-full max-w-full flex-1 flex-col space-y-8 md:my-8">
      <DayCalendar />
    </div>
  );
};

export default DayCalendarPage;
