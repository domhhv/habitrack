import { it, vi, expect, describe, beforeEach } from 'vitest';

import {
  getHabit,
  listFiles,
  deleteFile,
  patchHabit,
  patchStock,
  createStock,
  destroyHabit,
  destroyStock,
  uploadHabitIcon,
  patchHabitMetric,
  clearCalendarData,
  createHabitMetrics,
  destroyHabitMetrics,
  createStockMetricDefaults,
  destroyStockMetricDefaults,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/HabitDetailsPage';
import { loader, action, clientAction } from './HabitDetailsPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    clearCalendarData: vi.fn(),
    createHabitMetrics: vi.fn(),
    createStock: vi.fn(),
    createStockMetricDefaults: vi.fn(),
    deleteFile: vi.fn(),
    destroyHabit: vi.fn(),
    destroyHabitMetrics: vi.fn(),
    destroyStock: vi.fn(),
    destroyStockMetricDefaults: vi.fn(),
    getHabit: vi.fn(),
    listFiles: vi.fn(),
    patchHabit: vi.fn(),
    patchHabitMetric: vi.fn(),
    patchStock: vi.fn(),
    uploadHabitIcon: vi.fn(),
  };
});

const HABIT_URL = 'http://localhost/habits/habit-1';
const user = { id: 'user-1' } as SessionUser;

const submit = (fields: Record<string, string>, sessionUser = user) => {
  return action({
    ...makeRouteArgs<Route.ActionArgs>(HABIT_URL, sessionUser, {
      body: new URLSearchParams(fields),
      method: 'POST',
    }),
    params: { habitId: 'habit-1' },
  });
};

const stockFields = {
  cost: '4.5',
  currency: 'eur',
  isQuantifiable: 'on',
  name: ' Pack ',
  totalItems: '20',
};

describe('HabitDetailsPage loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the habit', async () => {
    const habit = { id: 'habit-1', name: 'Running' };
    vi.mocked(getHabit).mockResolvedValue(
      habit as Awaited<ReturnType<typeof getHabit>>
    );

    await expect(
      loader({
        ...makeRouteArgs<Route.LoaderArgs>(HABIT_URL, user),
        params: { habitId: 'habit-1' },
      })
    ).resolves.toEqual({ habit });
  });

  it('throws a 404 for an unknown habit', async () => {
    vi.mocked(getHabit).mockResolvedValue(null);

    await expect(
      loader({
        ...makeRouteArgs<Route.LoaderArgs>(HABIT_URL, user),
        params: { habitId: 'missing' },
      })
    ).rejects.toMatchObject({ init: { status: 404 } });
  });
});

describe('HabitDetailsPage action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listFiles).mockResolvedValue([]);
    vi.mocked(patchHabit).mockResolvedValue(
      {} as Awaited<ReturnType<typeof patchHabit>>
    );
  });

  it('rejects signed-out users', async () => {
    await expect(
      submit({ intent: 'remove-stock', stockId: 'stock-1' }, null)
    ).resolves.toMatchObject({ init: { status: 401 } });
    expect(destroyStock).not.toHaveBeenCalled();
  });

  it('patches only the submitted habit fields', async () => {
    await expect(
      submit({ intent: 'update-habit', name: ' Walking ' })
    ).resolves.toMatchObject({ ok: true });
    expect(patchHabit).toHaveBeenCalledWith(testSupabaseClient, 'habit-1', {
      name: 'Walking',
    });
  });

  it('clears a blank description and an unset trait', async () => {
    await submit({ description: '  ', intent: 'update-habit', traitId: '' });

    expect(patchHabit).toHaveBeenCalledWith(testSupabaseClient, 'habit-1', {
      description: null,
      traitId: null,
    });
  });

  it('returns field errors for a blank name and a long motivation', async () => {
    await expect(
      submit({
        intent: 'update-habit',
        motivation: 'a'.repeat(2001),
        name: ' ',
      })
    ).resolves.toMatchObject({
      init: { status: 400 },
      data: {
        fieldErrors: {
          motivation: 'Keep it to 2000 characters',
          name: 'Give the habit a name',
        },
      },
    });
    expect(patchHabit).not.toHaveBeenCalled();
  });

  it('replaces the habit icon and removes the previous one', async () => {
    const body = new FormData();
    body.set('intent', 'upload-icon');
    body.set('icon', new File(['icon'], 'icon.png'));
    vi.mocked(uploadHabitIcon).mockResolvedValue('user-1/new.png');
    vi.mocked(getHabit).mockResolvedValue({
      iconPath: 'user-1/old.png',
    } as Awaited<ReturnType<typeof getHabit>>);

    const args = makeRouteArgs<Route.ActionArgs>(HABIT_URL, user);

    await expect(
      action({
        ...args,
        params: { habitId: 'habit-1' },
        request: {
          headers: new Headers(),
          formData: () => {
            return Promise.resolve(body);
          },
        } as unknown as Request,
      })
    ).resolves.toMatchObject({ ok: true });
    expect(deleteFile).toHaveBeenCalledWith(
      testSupabaseClient,
      'habit_icons',
      'user-1/old.png'
    );
    expect(patchHabit).toHaveBeenCalledWith(testSupabaseClient, 'habit-1', {
      iconPath: 'user-1/new.png',
    });
  });

  it('deletes the habit with its occurrence photos and icon', async () => {
    vi.mocked(getHabit).mockResolvedValue({
      iconPath: 'user-1/icon.png',
    } as Awaited<ReturnType<typeof getHabit>>);
    vi.mocked(listFiles).mockResolvedValue([{ name: 'photo.jpg' }] as Awaited<
      ReturnType<typeof listFiles>
    >);

    await submit({ intent: 'delete-habit' });

    expect(deleteFile).toHaveBeenCalledWith(
      testSupabaseClient,
      'occurrence_photos',
      'user-1/habit-1/photo.jpg'
    );
    expect(destroyHabit).toHaveBeenCalledWith(testSupabaseClient, 'habit-1');
    expect(deleteFile).toHaveBeenCalledWith(
      testSupabaseClient,
      'habit_icons',
      'user-1/icon.png'
    );
  });

  it('removes, adds, and updates metric definitions', async () => {
    const baseMetric = {
      config: {},
      isRequired: false,
      presetName: '',
      sortOrder: 0,
      type: 'number' as const,
    };

    await submit({
      intent: 'save-metrics',
      metricDefinitions: JSON.stringify([
        { ...baseMetric, id: 'metric-1', isToBeRemoved: true, name: 'Old' },
        { ...baseMetric, id: 'form-1', isToBeAdded: true, name: 'New' },
        { ...baseMetric, id: 'metric-2', isToBeUpdated: true, name: 'Edit' },
        { ...baseMetric, id: 'metric-3', name: 'Untouched' },
      ]),
    });

    expect(destroyHabitMetrics).toHaveBeenCalledWith(testSupabaseClient, [
      'metric-1',
    ]);
    expect(createHabitMetrics).toHaveBeenCalledWith(testSupabaseClient, [
      expect.objectContaining({ habitId: 'habit-1', name: 'New' }),
    ]);
    expect(patchHabitMetric).toHaveBeenCalledOnce();
    expect(patchHabitMetric).toHaveBeenCalledWith(
      testSupabaseClient,
      'metric-2',
      expect.objectContaining({ name: 'Edit' })
    );
  });

  it('adds a stock with its metric defaults', async () => {
    vi.mocked(createStock).mockResolvedValue({ id: 'stock-1' } as Awaited<
      ReturnType<typeof createStock>
    >);

    await expect(
      submit({
        ...stockFields,
        intent: 'add-stock',
        metricDefaults: JSON.stringify({
          compound: { 'metric-1': true },
          values: { 'metric-1': { numericValue: 5 } },
        }),
      })
    ).resolves.toMatchObject({ ok: true });

    expect(createStock).toHaveBeenCalledWith(testSupabaseClient, {
      cost: 4.5,
      currency: 'EUR',
      habitId: 'habit-1',
      isDepleted: false,
      name: 'Pack',
      remainingItems: 20,
      totalItems: 20,
      userId: 'user-1',
    });
    expect(createStockMetricDefaults).toHaveBeenCalledWith(testSupabaseClient, [
      {
        habitMetricId: 'metric-1',
        habitStockId: 'stock-1',
        shouldCompound: true,
        userId: 'user-1',
        value: { numericValue: 5 },
      },
    ]);
  });

  it('adds an approximate stock without item counts', async () => {
    vi.mocked(createStock).mockResolvedValue({ id: 'stock-1' } as Awaited<
      ReturnType<typeof createStock>
    >);

    await submit({
      cost: '',
      currency: 'USD',
      intent: 'add-stock',
      name: 'Beans',
    });

    expect(createStock).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.objectContaining({
        cost: null,
        remainingItems: null,
        totalItems: null,
      })
    );
    expect(createStockMetricDefaults).not.toHaveBeenCalled();
  });

  it('returns field errors for invalid stock fields', async () => {
    await expect(
      submit({
        cost: '-1',
        currency: 'euro',
        intent: 'add-stock',
        isQuantifiable: 'on',
        name: ' ',
        totalItems: '',
      })
    ).resolves.toMatchObject({
      init: { status: 400 },
      data: {
        fieldErrors: {
          cost: 'Enter a cost of 0 or more',
          currency: 'Use a 3-letter code, e.g. EUR',
          name: 'Give the stock a name',
          totalItems: 'Enter a whole number of at least 1',
        },
      },
    });
    expect(createStock).not.toHaveBeenCalled();
  });

  it('marks a stock as depleted', async () => {
    await submit({
      intent: 'set-stock-depleted',
      isDepleted: 'true',
      stockId: 'stock-1',
    });

    expect(patchStock).toHaveBeenCalledWith(testSupabaseClient, 'stock-1', {
      isDepleted: true,
    });
  });

  it('only patches the stock when no metric defaults are submitted', async () => {
    await submit({
      ...stockFields,
      intent: 'update-stock',
      remainingItems: '30',
      stockId: 'stock-1',
    });

    expect(patchStock).toHaveBeenCalledWith(testSupabaseClient, 'stock-1', {
      cost: 4.5,
      currency: 'EUR',
      name: 'Pack',
      remainingItems: 20,
      totalItems: 20,
    });
    expect(destroyStockMetricDefaults).not.toHaveBeenCalled();
  });

  it('replaces the stock metric defaults when they are submitted', async () => {
    await submit({
      ...stockFields,
      intent: 'update-stock',
      stockId: 'stock-1',
      metricDefaults: JSON.stringify({
        compound: {},
        values: { 'metric-1': { numericValue: 2 } },
      }),
    });

    expect(destroyStockMetricDefaults).toHaveBeenCalledWith(
      testSupabaseClient,
      'stock-1'
    );
    expect(createStockMetricDefaults).toHaveBeenCalledWith(testSupabaseClient, [
      expect.objectContaining({
        habitStockId: 'stock-1',
        value: { numericValue: 2 },
      }),
    ]);
  });

  it('removes a stock', async () => {
    await submit({ intent: 'remove-stock', stockId: 'stock-1' });

    expect(destroyStock).toHaveBeenCalledWith(testSupabaseClient, 'stock-1');
  });

  it('rejects a stock request without a stock and an unknown intent', async () => {
    await expect(submit({ intent: 'remove-stock' })).resolves.toMatchObject({
      data: { error: 'Choose a stock first' },
      init: { status: 400 },
    });
    await expect(submit({ intent: 'rename' })).resolves.toMatchObject({
      data: { error: 'Unsupported habit request' },
      init: { status: 400 },
    });
    expect(destroyStock).not.toHaveBeenCalled();
  });
});

describe('HabitDetailsPage clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears the browser calendar cache after the server action', async () => {
    const result = { ok: true as const, toasts: [] };

    await expect(
      clientAction({
        ...makeRouteArgs<Route.ClientActionArgs>(HABIT_URL, user),
        params: { habitId: 'habit-1' },
        serverAction: vi.fn().mockResolvedValue(result),
      })
    ).resolves.toBe(result);
    expect(clearCalendarData).toHaveBeenCalledOnce();
  });

  it('clears the cache even when the server action throws', async () => {
    await expect(
      clientAction({
        ...makeRouteArgs<Route.ClientActionArgs>(HABIT_URL, user),
        params: { habitId: 'habit-1' },
        serverAction: vi.fn().mockRejectedValue(new Error('Offline')),
      })
    ).rejects.toThrow('Offline');
    expect(clearCalendarData).toHaveBeenCalledOnce();
  });
});
