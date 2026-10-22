import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { HabitDetailsSubmission } from '@models';
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
  createHabitMetrics,
  destroyHabitMetrics,
  createStockMetricDefaults,
  destroyStockMetricDefaults,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/HabitDetailsPage';
import { loader, clientAction } from './HabitDetailsPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
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

const submitJson = (submission: HabitDetailsSubmission, sessionUser = user) => {
  return clientAction({
    ...makeRouteArgs<Route.ClientActionArgs>(HABIT_URL, sessionUser, {
      body: JSON.stringify(submission),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
    params: { habitId: 'habit-1' },
  });
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

describe('HabitDetailsPage clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listFiles).mockResolvedValue([]);
    vi.mocked(patchHabit).mockResolvedValue(
      {} as Awaited<ReturnType<typeof patchHabit>>
    );
  });

  it('rejects signed-out users', async () => {
    await expect(
      submitJson({ intent: 'remove-stock', stockId: 'stock-1' }, null)
    ).resolves.toMatchObject({ init: { status: 401 } });
    expect(destroyStock).not.toHaveBeenCalled();
  });

  it('patches the submitted habit fields', async () => {
    await expect(
      submitJson({ habit: { name: 'Walking' }, intent: 'update-habit' })
    ).resolves.toEqual({ ok: true });
    expect(patchHabit).toHaveBeenCalledWith(testSupabaseClient, 'habit-1', {
      name: 'Walking',
    });
  });

  it('replaces the habit icon and removes the previous one', async () => {
    const body = new FormData();
    body.set('icon', new File(['icon'], 'icon.png'));
    vi.mocked(uploadHabitIcon).mockResolvedValue('user-1/new.png');
    vi.mocked(getHabit).mockResolvedValue({
      iconPath: 'user-1/old.png',
    } as Awaited<ReturnType<typeof getHabit>>);

    const args = makeRouteArgs<Route.ClientActionArgs>(HABIT_URL, user);

    await expect(
      clientAction({
        ...args,
        params: { habitId: 'habit-1' },
        request: {
          headers: new Headers(),
          formData: () => {
            return Promise.resolve(body);
          },
        } as unknown as Request,
      })
    ).resolves.toEqual({ ok: true });
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

    await submitJson({ intent: 'delete-habit' });

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

    await submitJson({
      intent: 'save-metrics',
      metricDefinitions: [
        { ...baseMetric, id: 'metric-1', isToBeRemoved: true, name: 'Old' },
        { ...baseMetric, id: 'form-1', isToBeAdded: true, name: 'New' },
        { ...baseMetric, id: 'metric-2', isToBeUpdated: true, name: 'Edit' },
        { ...baseMetric, id: 'metric-3', name: 'Untouched' },
      ],
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

    await submitJson({
      intent: 'add-stock',
      stock: { currency: 'EUR', name: 'Pack' },
      metricDefaults: {
        compound: { 'metric-1': true },
        values: { 'metric-1': { numericValue: 5 } },
      },
    });

    expect(createStock).toHaveBeenCalledWith(testSupabaseClient, {
      currency: 'EUR',
      habitId: 'habit-1',
      name: 'Pack',
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

  it('only patches the stock when no metric defaults are submitted', async () => {
    await submitJson({
      intent: 'update-stock',
      stock: { isDepleted: true },
      stockId: 'stock-1',
    });

    expect(patchStock).toHaveBeenCalledWith(testSupabaseClient, 'stock-1', {
      isDepleted: true,
    });
    expect(destroyStockMetricDefaults).not.toHaveBeenCalled();
  });

  it('replaces the stock metric defaults when they are submitted', async () => {
    await submitJson({
      intent: 'update-stock',
      stock: { name: 'Pack' },
      stockId: 'stock-1',
      metricDefaults: {
        compound: {},
        values: { 'metric-1': { numericValue: 2 } },
      },
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
    await submitJson({ intent: 'remove-stock', stockId: 'stock-1' });

    expect(destroyStock).toHaveBeenCalledWith(testSupabaseClient, 'stock-1');
  });
});
