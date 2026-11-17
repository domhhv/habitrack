import { CalendarDateTime } from '@internationalized/date';
import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, useFetcher, createRoutesStub } from 'react-router';
import { it, expect, describe } from 'vitest';

import type { ActionResult, OccurrenceSubmission } from '@models';
import { createCalendarData } from '@services';
import { makeTestHabit } from '@tests';

import useCalendarData from './use-calendar-data';

const habit = makeTestHabit({ id: 'habit-1', name: 'Run' });

const submission: OccurrenceSubmission = {
  intent: 'create',
  photoPaths: [],
  values: {
    depletedStockIds: [],
    hasSpecificTime: true,
    metricValues: {},
    note: '',
    occurredAt: '2026-10-21T08:00:00.000Z',
    selectedHabitId: 'habit-1',
    stockUsages: [],
  },
};

const renderCalendar = (result: Promise<ActionResult>) => {
  const Entries = () => {
    const { occurrences } = useCalendarData();
    const fetcher = useFetcher();

    return (
      <>
        <button
          type="button"
          onClick={() => {
            void fetcher.submit(submission, {
              action: '/resources/occurrences',
              encType: 'application/json',
              method: 'post',
            });
          }}
        >
          Log
        </button>
        <ul>
          {occurrences.map((occurrence) => {
            return (
              <li key={occurrence.id}>
                {occurrence.habit.name}
                {occurrence.isPending && ' (pending)'}
              </li>
            );
          })}
        </ul>
      </>
    );
  };

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      loader: () => {
        return { habits: { [habit.id]: habit } };
      },
      children: [
        {
          children: [{ Component: Entries, path: '/' }],
          Component: Outlet,
          id: 'calendar',
          loader: () => {
            return createCalendarData(
              [],
              [],
              [
                new CalendarDateTime(2026, 10, 19),
                new CalendarDateTime(2026, 10, 25, 23, 59, 59, 999),
              ]
            );
          },
        },
        {
          path: '/resources/occurrences',
          action: () => {
            return result;
          },
        },
      ],
    },
  ]);

  return render(<Stub initialEntries={['/']} />);
};

describe(useCalendarData.name, () => {
  it('shows a logged entry while its save is pending', async () => {
    renderCalendar(new Promise(() => {}));

    fireEvent.click(await screen.findByText('Log'));

    expect(await screen.findByText('Run (pending)')).toBeTruthy();
  });

  it('drops the pending entry when the save fails', async () => {
    let fail = (_result: ActionResult) => {};

    renderCalendar(
      new Promise((resolve) => {
        fail = resolve;
      })
    );

    fireEvent.click(await screen.findByText('Log'));
    await screen.findByText('Run (pending)');

    fail({ error: 'Nope', ok: false });

    await waitFor(() => {
      expect(screen.queryByText('Run (pending)')).toBeNull();
    });
  });
});
