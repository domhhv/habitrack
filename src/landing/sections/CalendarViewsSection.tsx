import LandingSection from '../LandingSection';
import { MiniDayView, MiniWeekView, MiniMonthCalendar } from '../mockups';

const CalendarViewsSection = () => {
  return (
    <LandingSection
      muted
      id="views"
      eyebrow="The calendar"
      title="Month, week, and day — pick your zoom"
      description="Every view is a place to act, not just look. Open any cell to log a habit or jot a note, whether you're scanning a whole month or planning a single afternoon."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <MiniMonthCalendar />
          <p className="text-sm font-bold text-(--muted)">
            Month — the big picture
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <MiniWeekView />
          <p className="text-sm font-bold text-(--muted)">Week — the rhythm</p>
        </div>
        <div className="flex flex-col gap-3">
          <MiniDayView />
          <p className="text-sm font-bold text-(--muted)">Day — the timeline</p>
        </div>
      </div>
    </LandingSection>
  );
};

export default CalendarViewsSection;
