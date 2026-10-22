import { it, vi, expect, describe, beforeEach } from 'vitest';

import {
  createHabit,
  createTrait,
  listHabitIds,
  getHabitsStats,
  uploadHabitIcon,
  createHabitMetrics,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/HabitsPage';
import { clientAction, clientLoader } from './HabitsPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    createHabit: vi.fn(),
    createHabitMetrics: vi.fn(),
    createTrait: vi.fn(),
    getHabitsStats: vi.fn(),
    listHabitIds: vi.fn(),
    uploadHabitIcon: vi.fn(),
  };
});

const HABITS_URL = 'http://localhost/habits';
const user = { id: 'user-1' } as SessionUser;

describe('HabitsPage clientLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keys the stats of the user habits by habit id', async () => {
    const stat = { habitId: 'habit-1', totalEntries: 3 };
    vi.mocked(listHabitIds).mockResolvedValue(['habit-1']);
    vi.mocked(getHabitsStats).mockResolvedValue([
      stat,
      { habitId: null },
    ] as Awaited<ReturnType<typeof getHabitsStats>>);

    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(HABITS_URL, user))
    ).resolves.toEqual({ habitsStats: { 'habit-1': stat } });
    expect(getHabitsStats).toHaveBeenCalledWith(testSupabaseClient, [
      'habit-1',
    ]);
  });

  it('skips the stats query without habits or a user', async () => {
    vi.mocked(listHabitIds).mockResolvedValue([]);

    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(HABITS_URL, user))
    ).resolves.toEqual({ habitsStats: {} });
    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(HABITS_URL))
    ).resolves.toEqual({ habitsStats: {} });
    expect(getHabitsStats).not.toHaveBeenCalled();
  });

  it('keeps the page usable when the stats fail to load', async () => {
    vi.mocked(listHabitIds).mockRejectedValue(new Error('Offline'));

    await expect(
      clientLoader(makeRouteArgs<Route.ClientLoaderArgs>(HABITS_URL, user))
    ).resolves.toEqual({ habitsStats: {} });
  });
});

describe('HabitsPage clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a habit with its icon and metric definitions', async () => {
    const icon = new File(['icon'], 'icon.png', { type: 'image/png' });
    const body = new FormData();
    body.set('name', 'Running');
    body.set('description', 'Morning runs');
    body.set('traitId', 'trait-1');
    body.set('icon', icon);
    body.set(
      'metricDefinitions',
      JSON.stringify([
        {
          config: {},
          id: 'form-1',
          isRequired: false,
          name: 'Distance',
          presetName: '',
          sortOrder: 0,
          type: 'number',
        },
      ])
    );
    vi.mocked(uploadHabitIcon).mockResolvedValue('user-1/icon.png');
    vi.mocked(createHabit).mockResolvedValue({ id: 'habit-1' } as Awaited<
      ReturnType<typeof createHabit>
    >);

    const args = makeRouteArgs<Route.ClientActionArgs>(HABITS_URL, user);

    await expect(
      clientAction({
        ...args,
        request: {
          headers: new Headers(),
          formData: () => {
            return Promise.resolve(body);
          },
        } as unknown as Request,
      })
    ).resolves.toEqual({ ok: true });
    expect(uploadHabitIcon).toHaveBeenCalledWith(
      testSupabaseClient,
      'user-1',
      expect.objectContaining({ name: 'icon.png' })
    );
    expect(createHabit).toHaveBeenCalledWith(testSupabaseClient, {
      description: 'Morning runs',
      iconPath: 'user-1/icon.png',
      name: 'Running',
      traitId: 'trait-1',
      userId: 'user-1',
    });
    expect(createHabitMetrics).toHaveBeenCalledWith(testSupabaseClient, [
      expect.objectContaining({
        habitId: 'habit-1',
        name: 'Distance',
        userId: 'user-1',
      }),
    ]);
  });

  it('creates a trait from a JSON submission', async () => {
    await clientAction(
      makeRouteArgs<Route.ClientActionArgs>(HABITS_URL, user, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          intent: 'create-trait',
          trait: { color: '#000000', description: '', name: 'Good' },
        }),
      })
    );

    expect(createTrait).toHaveBeenCalledWith(testSupabaseClient, {
      color: '#000000',
      description: '',
      name: 'Good',
      userId: 'user-1',
    });
  });

  it('reports the failure without a 4xx so loaders still revalidate', async () => {
    vi.mocked(createHabit).mockRejectedValue(new Error('Duplicate'));

    await expect(
      clientAction(
        makeRouteArgs<Route.ClientActionArgs>(HABITS_URL, user, {
          body: new FormData(),
          method: 'POST',
        })
      )
    ).resolves.toEqual({ error: 'Duplicate', ok: false });
  });
});
