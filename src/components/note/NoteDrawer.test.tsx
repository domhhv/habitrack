import { CalendarDate } from '@internationalized/date';
import {
  act,
  screen,
  render,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe, afterEach } from 'vitest';

import type { ActionResult } from '@models';
import { useBoundStore } from '@stores';

import NoteDrawer from './NoteDrawer';

const renderDrawer = (result: Promise<ActionResult> | ActionResult) => {
  const action = vi.fn();

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      loader: () => {
        return { user: { id: 'user-1' } };
      },
      children: [
        { Component: NoteDrawer, path: '/' },
        {
          path: '/resources/notes',
          action: async ({ request }) => {
            action(Object.fromEntries(await request.formData()));

            return result;
          },
          loader: () => {
            return { note: null };
          },
        },
      ],
    },
  ]);

  render(<Stub initialEntries={['/']} />);

  return { action };
};

const openAndSubmitNote = async (content: string) => {
  act(() => {
    useBoundStore
      .getState()
      .noteDrawerActions.openNoteDrawer(new CalendarDate(2026, 10, 20), 'day');
  });

  const textArea = await screen.findByPlaceholderText(
    'Start typing your note about this day...'
  );

  fireEvent.change(textArea, { target: { value: content } });
  fireEvent.click(screen.getByRole('button', { name: /Add/ }));
};

describe(NoteDrawer.name, () => {
  afterEach(() => {
    act(() => {
      useBoundStore.getState().noteDrawerActions.closeNoteDrawer();
    });
  });

  it('closes as soon as the note is submitted', async () => {
    const { action } = renderDrawer(new Promise(() => {}));

    await openAndSubmitNote('Slept well');

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({
        content: 'Slept well',
        intent: 'create',
        noteId: '',
        periodDate: '2026-10-20',
        periodKind: 'day',
      });
    });
    expect(useBoundStore.getState().noteDrawer.isOpen).toBe(false);
  });

  it('reopens for the same day with the field error when the note is rejected', async () => {
    renderDrawer({
      error: 'Invalid note',
      fieldErrors: { content: 'Write something before saving the note' },
      ok: false,
    });

    await openAndSubmitNote('Slept well');

    expect(
      await screen.findByText('Write something before saving the note')
    ).toBeTruthy();
    expect(useBoundStore.getState().noteDrawer).toMatchObject({
      isOpen: true,
      periodKind: 'day',
    });
    expect(useBoundStore.getState().noteDrawer.periodDate.toString()).toBe(
      '2026-10-20'
    );
  });
});
