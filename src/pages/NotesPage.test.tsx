import { it, vi, expect, describe, beforeEach } from 'vitest';

import { listAllNotes } from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/NotesPage';
import { loader } from './NotesPage';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    listAllNotes: vi.fn(),
  };
});

const user = { id: 'user-1' } as SessionUser;

describe('NotesPage loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads as many pages as the URL asks for', async () => {
    vi.mocked(listAllNotes).mockResolvedValue(
      Array.from({ length: 40 }, () => {
        return {} as Awaited<ReturnType<typeof listAllNotes>>[number];
      })
    );

    await expect(
      loader(
        makeRouteArgs<Route.LoaderArgs>('http://localhost/notes?pages=2', user)
      )
    ).resolves.toMatchObject({ hasMore: true, pageCount: 2 });
    expect(listAllNotes).toHaveBeenCalledWith(testSupabaseClient, {
      limit: 40,
      page: 0,
    });
  });

  it('treats a missing or invalid page count as one page', async () => {
    vi.mocked(listAllNotes).mockResolvedValue([]);

    await expect(
      loader(
        makeRouteArgs<Route.LoaderArgs>(
          'http://localhost/notes?pages=abc',
          user
        )
      )
    ).resolves.toEqual({ hasMore: false, notes: [], pageCount: 1 });
    expect(listAllNotes).toHaveBeenCalledWith(testSupabaseClient, {
      limit: 20,
      page: 0,
    });
  });

  it('skips the query for signed-out visitors', async () => {
    await expect(
      loader(makeRouteArgs<Route.LoaderArgs>('http://localhost/notes'))
    ).resolves.toEqual({ hasMore: false, notes: [], pageCount: 1 });
    expect(listAllNotes).not.toHaveBeenCalled();
  });
});
