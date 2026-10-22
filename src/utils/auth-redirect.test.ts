import { it, expect, describe } from 'vitest';

import { getLoginPath, getReturnToPath } from './auth-redirect';

describe('getLoginPath', () => {
  it('sends the current path and search along as the return path', () => {
    expect(getLoginPath('https://habitrack.test/notes?pages=2')).toBe(
      `/login?returnTo=${encodeURIComponent('/notes?pages=2')}`
    );
  });
});

describe('getReturnToPath', () => {
  it('reads a same-origin return path', () => {
    expect(
      getReturnToPath('https://habitrack.test/login?returnTo=%2Fnotes')
    ).toBe('/notes');
  });

  it.each([
    'https://habitrack.test/login',
    `https://habitrack.test/login?returnTo=${encodeURIComponent('https://evil.test')}`,
  ])('falls back to the calendar for %s', (url) => {
    expect(getReturnToPath(url)).toBe('/calendar/month');
  });
});
