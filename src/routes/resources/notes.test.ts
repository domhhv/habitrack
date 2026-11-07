import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { NoteSubmission } from '@models';
import {
  createNote,
  updateNote,
  destroyNote,
  getPeriodNote,
  invalidateCalendarNotes,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/notes';
import { action, clientAction, clientLoader } from './notes';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    createNote: vi.fn().mockResolvedValue({}),
    destroyNote: vi.fn().mockResolvedValue(undefined),
    getPeriodNote: vi.fn(),
    invalidateCalendarNotes: vi.fn(),
    updateNote: vi.fn().mockResolvedValue({}),
  };
});

const NOTES_URL = 'http://localhost/resources/notes';
const user = { id: 'user-1' } as SessionUser;
const note = {
  content: 'Good day',
  periodDate: '2026-10-22',
  periodKind: 'day' as const,
};

const submit = (submission: NoteSubmission) => {
  return action(
    makeRouteArgs<Route.ActionArgs>(NOTES_URL, user, {
      body: JSON.stringify(submission),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );
};

describe('notes resource clientLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the note of the requested period', async () => {
    vi.mocked(getPeriodNote).mockResolvedValue({ id: 'note-1' } as Awaited<
      ReturnType<typeof getPeriodNote>
    >);

    await expect(
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(
          `${NOTES_URL}?kind=week&date=2026-10-19`,
          user
        )
      )
    ).resolves.toEqual({ note: { id: 'note-1' } });
    expect(getPeriodNote).toHaveBeenCalledWith(
      testSupabaseClient,
      'week',
      '2026-10-19'
    );
  });

  it('skips the lookup for invalid periods or signed-out visitors', async () => {
    await expect(
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(
          `${NOTES_URL}?kind=year&date=2026-10-19`,
          user
        )
      )
    ).resolves.toEqual({ note: null });
    await expect(
      clientLoader(
        makeRouteArgs<Route.ClientLoaderArgs>(
          `${NOTES_URL}?kind=day&date=2026-10-19`
        )
      )
    ).resolves.toEqual({ note: null });
    expect(getPeriodNote).not.toHaveBeenCalled();
  });
});

describe('notes resource action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a period note for the user', async () => {
    await expect(submit({ intent: 'create', note })).resolves.toEqual({
      ok: true,
      toasts: [{ title: 'Note added', variant: 'success' }],
    });
    expect(createNote).toHaveBeenCalledWith(testSupabaseClient, {
      ...note,
      userId: 'user-1',
    });
  });

  it('updates and deletes notes', async () => {
    await submit({ intent: 'update', note, noteId: 'note-1' });
    await submit({ intent: 'delete', noteId: 'note-1' });

    expect(updateNote).toHaveBeenCalledWith(testSupabaseClient, 'note-1', note);
    expect(destroyNote).toHaveBeenCalledWith(testSupabaseClient, 'note-1');
  });

  it('returns the failure with its toast', async () => {
    vi.mocked(createNote).mockRejectedValue(new Error('Too long'));

    await expect(submit({ intent: 'create', note })).resolves.toEqual({
      error: 'Too long',
      ok: false,
      toasts: [
        {
          description: 'Error details: Too long',
          title: 'Something went wrong while adding your note',
          variant: 'danger',
        },
      ],
    });
  });
});

describe('notes resource clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates the browser notes cache after the server action', async () => {
    const result = { ok: true as const, toasts: [] };

    await expect(
      clientAction({
        ...makeRouteArgs<Route.ClientActionArgs>(NOTES_URL, user),
        serverAction: vi.fn().mockResolvedValue(result),
      })
    ).resolves.toBe(result);
    expect(invalidateCalendarNotes).toHaveBeenCalledOnce();
  });

  it('invalidates the cache even when the server action throws', async () => {
    await expect(
      clientAction({
        ...makeRouteArgs<Route.ClientActionArgs>(NOTES_URL, user),
        serverAction: vi.fn().mockRejectedValue(new Error('Offline')),
      })
    ).rejects.toThrow('Offline');
    expect(invalidateCalendarNotes).toHaveBeenCalledOnce();
  });
});
