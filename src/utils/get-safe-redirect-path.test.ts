import { it, expect, describe } from 'vitest';

import getSafeRedirectPath from './get-safe-redirect-path';

const REQUEST_URL = 'https://habitrack.test/auth/callback?code=1';

describe('getSafeRedirectPath', () => {
  it.each([
    ['/settings', '/settings'],
    ['/settings?passwordReset=true', '/settings?passwordReset=true'],
    ['https://habitrack.test/notes?pages=2#top', '/notes?pages=2#top'],
  ])('keeps the same-origin target %s', (target, path) => {
    expect(getSafeRedirectPath(target, REQUEST_URL, '/calendar')).toBe(path);
  });

  it.each([
    null,
    '',
    'https://evil.test/settings',
    '//evil.test/settings',
    '/\\evil.test/settings',
    'javascript:alert(1)',
  ])('falls back for %s', (target) => {
    expect(getSafeRedirectPath(target, REQUEST_URL, '/calendar')).toBe(
      '/calendar'
    );
  });
});
