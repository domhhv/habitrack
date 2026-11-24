import type { ShouldRevalidateFunctionArgs } from 'react-router';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import type * as AppRevalidation from './app-revalidation';

let shouldRevalidateAppData: typeof AppRevalidation.shouldRevalidateAppData;
let trackAppDataLoad: typeof AppRevalidation.trackAppDataLoad;

const makeArgs = (
  current: string,
  next: string,
  overrides: Partial<ShouldRevalidateFunctionArgs> = {}
) => {
  return {
    currentParams: {},
    currentUrl: new URL(current, 'https://habitrack.test'),
    defaultShouldRevalidate: true,
    nextParams: {},
    nextUrl: new URL(next, 'https://habitrack.test'),
    ...overrides,
  } as ShouldRevalidateFunctionArgs;
};

const completeLoad = (signal = new AbortController().signal) => {
  trackAppDataLoad(signal)();
};

describe('shouldRevalidateAppData', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ shouldRevalidateAppData, trackAppDataLoad } =
      await import('./app-revalidation'));
  });

  it('skips plain navigations that single fetch would revalidate', () => {
    expect(shouldRevalidateAppData(makeArgs('/habits', '/notes'))).toBe(false);
    expect(
      shouldRevalidateAppData(makeArgs('/habits', '/habits?tab=stats'))
    ).toBe(false);
  });

  it('reloads on revalidate() and same-URL navigations', () => {
    expect(shouldRevalidateAppData(makeArgs('/habits', '/habits'))).toBe(true);
    expect(
      shouldRevalidateAppData(
        makeArgs('/habits', '/habits', { defaultShouldRevalidate: false })
      )
    ).toBe(false);
  });

  it('reloads after a successful write until a load completes', () => {
    expect(
      shouldRevalidateAppData(
        makeArgs('/habits', '/habits', { formMethod: 'POST' })
      )
    ).toBe(true);
    expect(shouldRevalidateAppData(makeArgs('/habits', '/notes'))).toBe(true);

    completeLoad();

    expect(shouldRevalidateAppData(makeArgs('/notes', '/settings'))).toBe(
      false
    );
  });

  it('keeps reloading when the load after a write was aborted', () => {
    const controller = new AbortController();
    shouldRevalidateAppData(
      makeArgs('/habits', '/habits', { formMethod: 'POST' })
    );
    const markLoaded = trackAppDataLoad(controller.signal);

    controller.abort();
    markLoaded();

    expect(shouldRevalidateAppData(makeArgs('/habits', '/notes'))).toBe(true);
  });

  it('keeps reloading when a load that started before the write completes', () => {
    const markEarlierLoad = trackAppDataLoad(new AbortController().signal);
    shouldRevalidateAppData(
      makeArgs('/habits', '/habits', { formMethod: 'POST' })
    );

    markEarlierLoad();

    expect(shouldRevalidateAppData(makeArgs('/habits', '/notes'))).toBe(true);
  });

  it('ignores failed writes and GET submissions', () => {
    expect(
      shouldRevalidateAppData(
        makeArgs('/settings', '/settings', {
          actionStatus: 400,
          defaultShouldRevalidate: false,
          formMethod: 'POST',
        })
      )
    ).toBe(false);
    expect(
      shouldRevalidateAppData(
        makeArgs('/habits', '/notes', { formMethod: 'GET' })
      )
    ).toBe(false);
    expect(shouldRevalidateAppData(makeArgs('/settings', '/notes'))).toBe(
      false
    );
  });
});
