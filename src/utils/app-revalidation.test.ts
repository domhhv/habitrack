import { it, vi, expect, describe, beforeEach } from 'vitest';

const importFreshModule = async () => {
  vi.resetModules();

  return import('./app-revalidation');
};

describe('app revalidation tracking', () => {
  let appRevalidation: Awaited<ReturnType<typeof importFreshModule>>;

  beforeEach(async () => {
    appRevalidation = await importFreshModule();
  });

  it('is fresh before anything marks it stale', () => {
    expect(appRevalidation.isAppDataStale()).toBe(false);
  });

  it('stays stale until a load started after the mark finishes', () => {
    appRevalidation.markAppDataStale();

    const finishLoad = appRevalidation.trackAppDataLoad(
      new AbortController().signal
    );

    expect(appRevalidation.isAppDataStale()).toBe(true);

    finishLoad();

    expect(appRevalidation.isAppDataStale()).toBe(false);
  });

  it('stays stale when the load is aborted', () => {
    const controller = new AbortController();

    appRevalidation.markAppDataStale();
    const finishLoad = appRevalidation.trackAppDataLoad(controller.signal);
    controller.abort();
    finishLoad();

    expect(appRevalidation.isAppDataStale()).toBe(true);
  });

  it('stays stale when marked again while a load is in flight', () => {
    appRevalidation.markAppDataStale();
    const finishLoad = appRevalidation.trackAppDataLoad(
      new AbortController().signal
    );
    appRevalidation.markAppDataStale();
    finishLoad();

    expect(appRevalidation.isAppDataStale()).toBe(true);
  });
});
