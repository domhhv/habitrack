import { it, vi, expect, describe, beforeEach } from 'vitest';

import { listNotesPage } from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/NotesPage';
import { loader } from './NotesPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    listNotesPage: vi.fn(),
  };
});

const user = { id: 'user-1' } as SessionUser;

const cursor = {
  createdAt: '2026-07-10T10:00:00.123456+00:00',
  id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa',
};

describe('NotesPage loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the first page and encodes the next cursor', async () => {
    vi.mocked(listNotesPage).mockResolvedValue({
      nextCursor: cursor,
      notes: [],
    });

    await expect(
      loader(makeRouteArgs<Route.LoaderArgs>('http://localhost/notes', user))
    ).resolves.toEqual({
      nextCursor: `${cursor.createdAt}~${cursor.id}`,
      notes: [],
    });
    expect(listNotesPage).toHaveBeenCalledWith(testSupabaseClient, {
      before: null,
      limit: 20,
      signal: expect.any(AbortSignal),
      userId: 'user-1',
    });
  });

  it('loads the page after the given cursor', async () => {
    vi.mocked(listNotesPage).mockResolvedValue({ nextCursor: null, notes: [] });

    await expect(
      loader(
        makeRouteArgs<Route.LoaderArgs>(
          `http://localhost/notes?${new URLSearchParams({
            before: `${cursor.createdAt}~${cursor.id}`,
          })}`,
          user
        )
      )
    ).resolves.toEqual({ nextCursor: null, notes: [] });
    expect(listNotesPage).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.objectContaining({ before: cursor })
    );
  });

  it('treats an invalid cursor as the first page', async () => {
    vi.mocked(listNotesPage).mockResolvedValue({ nextCursor: null, notes: [] });

    await loader(
      makeRouteArgs<Route.LoaderArgs>(
        'http://localhost/notes?before=garbage',
        user
      )
    );

    expect(listNotesPage).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.objectContaining({ before: null })
    );
  });

  it('skips the query for signed-out visitors', async () => {
    await expect(
      loader(makeRouteArgs<Route.LoaderArgs>('http://localhost/notes'))
    ).resolves.toEqual({ nextCursor: null, notes: [] });
    expect(listNotesPage).not.toHaveBeenCalled();
  });
});
