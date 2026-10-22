import { it, vi, expect, describe, beforeEach } from 'vitest';

import {
  listHabits,
  getProfile,
  listTraits,
  getSessionUser,
  getKnownFirstDayOfWeek,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import { userContext, profileContext, type SessionUser } from '@utils';

import type { Route } from './+types/App';
import { loader, middleware, clientLoader } from './App';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    getProfile: vi.fn(),
    getSessionUser: vi.fn(),
    listHabits: vi.fn(),
    listTraits: vi.fn(),
  };
});

const user = { email: 'me@email.com', id: 'user-1', isAnonymous: false };
const profile = { firstDayOfWeek: 'mon', id: 'user-1' } as Awaited<
  ReturnType<typeof getProfile>
>;

const runSessionMiddleware = async () => {
  const [, sessionMiddleware] = middleware;
  const args = makeRouteArgs<Route.LoaderArgs>('https://habitrack.test/notes');

  await sessionMiddleware(args, vi.fn());

  return args.context;
};

describe('App server middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getProfile).mockResolvedValue(profile);
  });

  it('sets the verified user and loads the profile once, on demand', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(user);

    const context = await runSessionMiddleware();

    expect(getSessionUser).toHaveBeenCalledWith(testSupabaseClient);
    expect(context.get(userContext)).toBe(user);
    expect(getProfile).not.toHaveBeenCalled();

    const loadProfile = context.get(profileContext);

    await expect(loadProfile()).resolves.toBe(profile);
    await expect(loadProfile()).resolves.toBe(profile);
    expect(getProfile).toHaveBeenCalledOnce();
  });

  it('has no profile without a user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const context = await runSessionMiddleware();

    expect(context.get(userContext)).toBeNull();
    await expect(context.get(profileContext)()).resolves.toBeNull();
    expect(getProfile).not.toHaveBeenCalled();
  });
});

describe('App loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('streams the profile, habits and traits keyed by id', async () => {
    vi.mocked(listHabits).mockResolvedValue([{ id: 'habit-1' }] as Awaited<
      ReturnType<typeof listHabits>
    >);
    vi.mocked(listTraits).mockResolvedValue([{ id: 'trait-1' }] as Awaited<
      ReturnType<typeof listTraits>
    >);
    const args = makeRouteArgs<Route.LoaderArgs>(
      'https://habitrack.test/calendar/month',
      user as SessionUser
    );
    args.context.set(profileContext, () => {
      return Promise.resolve(profile);
    });

    const { appData } = loader(args);

    await expect(appData).resolves.toEqual({
      habits: { 'habit-1': { id: 'habit-1' } },
      profile,
      traits: { 'trait-1': { id: 'trait-1' } },
      user,
    });
  });

  it('skips the queries for signed-out visitors', async () => {
    const { appData } = loader(
      makeRouteArgs<Route.LoaderArgs>('https://habitrack.test/calendar/month')
    );

    await expect(appData).resolves.toEqual({
      habits: {},
      profile: null,
      traits: {},
      user: null,
    });
    expect(listHabits).not.toHaveBeenCalled();
  });
});

describe('App clientLoader', () => {
  it("waits for the streamed data and remembers the user's first day of the week", async () => {
    const appData = { habits: {}, profile, traits: {}, user };

    await expect(
      clientLoader({
        ...makeRouteArgs<Route.ClientLoaderArgs>(
          'https://habitrack.test/calendar/month'
        ),
        serverLoader: vi
          .fn()
          .mockResolvedValue({ appData: Promise.resolve(appData) }),
      } as Route.ClientLoaderArgs)
    ).resolves.toBe(appData);
    expect(getKnownFirstDayOfWeek('user-1')).toEqual({
      userId: 'user-1',
      value: 'mon',
    });
  });
});
