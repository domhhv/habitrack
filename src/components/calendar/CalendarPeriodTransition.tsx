import React, { ViewTransition } from 'react';

import { getCalendarPeriodDirection } from '@utils';

type CalendarPeriodTransitionProps = {
  children: React.ReactNode;
  period: string;
};

/**
 * Slides the grid toward the period it is moving to, whatever started the move (a link, an arrow
 * key, a swipe or the browser's history). The last committed period is kept in state, so only
 * the commit that changes the period animates and revalidations stay still. Switching views
 * unmounts one named boundary and mounts another, which crossfades them.
 */
const CalendarPeriodTransition = ({
  children,
  period,
}: CalendarPeriodTransitionProps) => {
  const [shownPeriod, setShownPeriod] = React.useState(period);

  React.useEffect(() => {
    setShownPeriod(period);
  }, [period]);

  return (
    <ViewTransition
      default="none"
      share="calendar-view"
      name="calendar-period"
      update={getCalendarPeriodDirection(shownPeriod, period)}
    >
      {children}
    </ViewTransition>
  );
};

export default CalendarPeriodTransition;
