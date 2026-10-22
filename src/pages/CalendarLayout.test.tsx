import { CalendarDateTime } from '@internationalized/date';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import type { Profile } from '@models';
import {
  loadCalendarData,
  primeCalendarData,
  loadCalendarEntries,
  rememberCalendarFirstDayOfWeek,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import { profileContext, type SessionUser } from '@utils';

import type { Route } from './+types/CalendarLayout';
import { loader, clientLoader } from './CalendarLayout';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    loadCalendarData: vi.fn().mockResolvedValue({ occurrences: [] }),
    loadCalendarEntries: vi.fn(),
    primeCalendarData: vi.fn(),
  };
});

const user = { id: 'user-1' } as NonNullable<SessionUser>;
const entries = { notes: [], occurrences: [] };
const WEEK_PARAMS = { day: '22', month: '10', year: '2026' };
const SUNDAY_WEEK = [
  new CalendarDateTime(2026, 10, 18),
  new CalendarDateTime(2026, 10, 24, 23, 59, 59, 999),
];
const MONDAY_WEEK = [
  new CalendarDateTime(2026, 10, 19),
  new CalendarDateTime(2026, 10, 25, 23, 59, 59, 999),
];

const serverArgs = (
  path: string,
  params: Route.LoaderArgs['params'],
  {
    cookie = '',
    profile = null,
    sessionUser = user,
  }: {
    cookie?: string;
    profile?: Pick<Profile, 'firstDayOfWeek'> | null;
    sessionUser?: SessionUser;
  } = {}
) => {
  const args = makeRouteArgs<Route.LoaderArgs>(
    `http://localhost${path}`,
    sessionUser,
    { headers: { 'Accept-Language': 'en-US,en;q=0.9', Cookie: cookie } }
  );

  args.context.set(profileContext, () => {
    return Promise.resolve(profile as Profile | null);
  });

  return { ...args, params };
};

const clientArgs = (
  path: string,
  params: Route.ClientLoaderArgs['params'],
  sessionUser: SessionUser = user,
  serverData?: Awaited<ReturnType<typeof loader>>
) => {
  return {
    ...makeRouteArgs<Route.ClientLoaderArgs>(
      `http://localhost${path}`,
      sessionUser
    ),
    params,
    serverLoader: vi.fn().mockResolvedValue(serverData),
  } as Route.ClientLoaderArgs;
};

describe('CalendarLayout loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadCalendarEntries).mockResolvedValue(entries);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects /calendar to the month view', async () => {
    await expect(loader(serverArgs('/calendar', {}))).rejects.toSatisfy(
      (response: Response) => {
        return response.headers.get('Location') === '/calendar/month';
      }
    );
  });

  it("loads the URL's range with the profile's first day of the week", async () => {
    const data = await loader(
      serverArgs('/calendar/week/2026/10/22', WEEK_PARAMS, {
        profile: { firstDayOfWeek: 'mon' },
      })
    );

    expect(loadCalendarEntries).toHaveBeenCalledWith(
      testSupabaseClient,
      MONDAY_WEEK
    );
    expect(data.firstDayOfWeek).toBe('mon');
    expect(data.range).toEqual([
      '2026-10-19T00:00:00',
      '2026-10-25T23:59:59.999',
    ]);
    await expect(data.entries).resolves.toBe(entries);
  });

  it("works out today's month in the time zone from the tz cookie", async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-31T12:00:00Z'));

    const utcData = await loader(serverArgs('/calendar/month', {}));
    const kiritimatiData = await loader(
      serverArgs('/calendar/month', {}, { cookie: 'tz=Pacific%2FKiritimati' })
    );

    expect(utcData.range[1]).toBe('2026-10-31T23:59:59.999');
    expect(kiritimatiData.range[1]).toBe('2026-12-05T23:59:59.999');
  });

  it('skips the entries query for signed-out visitors', async () => {
    const data = await loader(
      serverArgs('/calendar/day/2026/10/22', WEEK_PARAMS, { sessionUser: null })
    );

    expect(loadCalendarEntries).not.toHaveBeenCalled();
    await expect(data.entries).resolves.toEqual(entries);
  });
});

describe('CalendarLayout clientLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', { language: 'en-US' });
    rememberCalendarFirstDayOfWeek('someone-else', undefined);
  });

  it('serves the range from the browser cache once the first day of the week is known', async () => {
    rememberCalendarFirstDayOfWeek(user.id, 'mon');
    const args = clientArgs('/calendar/week/2026/10/22', WEEK_PARAMS);

    await clientLoader(args);

    expect(args.serverLoader).not.toHaveBeenCalled();
    expect(loadCalendarData).toHaveBeenCalledWith(
      testSupabaseClient,
      MONDAY_WEEK
    );
  });

  it('seeds the cache from the server loader on the first load', async () => {
    const args = clientArgs('/calendar/week/2026/10/22', WEEK_PARAMS, user, {
      entries: Promise.resolve(entries),
      firstDayOfWeek: 'sun',
      range: ['2026-10-18T00:00:00', '2026-10-24T23:59:59.999'],
    });

    await clientLoader(args);

    expect(args.serverLoader).toHaveBeenCalledOnce();
    expect(primeCalendarData).toHaveBeenCalledWith(SUNDAY_WEEK, entries);
    expect(loadCalendarData).toHaveBeenCalledWith(
      testSupabaseClient,
      SUNDAY_WEEK
    );
  });

  it('returns empty calendar data for signed-out visitors', async () => {
    const data = await clientLoader(
      clientArgs('/calendar/day/2026/10/22', WEEK_PARAMS, null, {
        entries: Promise.resolve(entries),
        firstDayOfWeek: undefined,
        range: ['2026-10-22T00:00:00', '2026-10-22T23:59:59.999'],
      })
    );

    expect(primeCalendarData).not.toHaveBeenCalled();
    expect(loadCalendarData).not.toHaveBeenCalled();
    expect(data).toMatchObject({
      dayNotes: [],
      occurrences: [],
      occurrencesByDate: { '2026-10-22': {} },
    });
  });
});
