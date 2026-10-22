import { CalendarDateTime } from '@internationalized/date';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { Profile } from '@models';
import { loadCalendarData } from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import { profileContext, type SessionUser } from '@utils';

import type { Route } from './+types/CalendarLayout';
import { clientLoader } from './CalendarLayout';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    loadCalendarData: vi.fn().mockResolvedValue({ occurrences: [] }),
  };
});

const user = { id: 'user-1' } as SessionUser;

const loaderArgs = (
  path: string,
  params: Route.ClientLoaderArgs['params'],
  sessionUser: SessionUser = user,
  profile?: Pick<Profile, 'firstDayOfWeek'>
) => {
  const args = makeRouteArgs<Route.ClientLoaderArgs>(
    `http://localhost${path}`,
    sessionUser
  );

  if (profile) {
    args.context.set(profileContext, profile as Profile);
  }

  return { ...args, params };
};

describe('CalendarLayout clientLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', { language: 'en-GB' });
  });

  it('redirects /calendar to the month view', async () => {
    await expect(clientLoader(loaderArgs('/calendar', {}))).rejects.toSatisfy(
      (response: Response) => {
        return response.headers.get('Location') === '/calendar/month';
      }
    );
  });

  it('loads the range of the URL view and date', async () => {
    await clientLoader(
      loaderArgs(
        '/calendar/week/2026/10/22',
        { day: '22', month: '10', year: '2026' },
        user,
        { firstDayOfWeek: 'sun' }
      )
    );

    expect(loadCalendarData).toHaveBeenCalledWith(testSupabaseClient, [
      new CalendarDateTime(2026, 10, 18),
      new CalendarDateTime(2026, 10, 24, 23, 59, 59, 999),
    ]);
  });

  it('returns empty calendar data for signed-out visitors', async () => {
    const data = await clientLoader(
      loaderArgs(
        '/calendar/day/2026/10/22',
        {
          day: '22',
          month: '10',
          year: '2026',
        },
        null
      )
    );

    expect(loadCalendarData).not.toHaveBeenCalled();
    expect(data).toMatchObject({
      dayNotes: [],
      occurrences: [],
      occurrencesByDate: { '2026-10-22': {} },
    });
  });
});
