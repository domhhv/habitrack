import { it, expect, describe } from 'vitest';

import { getRequestLocale, getRequestTimeZone } from './request-preferences';

const requestWith = (headers: HeadersInit) => {
  return new Request('https://habitrack.test/calendar/month', { headers });
};

describe('getRequestTimeZone', () => {
  it('reads the time zone cookie', () => {
    expect(
      getRequestTimeZone(
        requestWith({ Cookie: 'theme=dark; tz=Europe%2FWarsaw' })
      )
    ).toBe('Europe/Warsaw');
  });

  it.each<HeadersInit>([{}, { Cookie: 'tz=Not%2FA_Zone' }])(
    'falls back to UTC without a valid cookie (%o)',
    (headers) => {
      expect(getRequestTimeZone(requestWith(headers))).toBe('UTC');
    }
  );
});

describe('getRequestLocale', () => {
  it('takes the preferred language', () => {
    expect(
      getRequestLocale(
        requestWith({ 'Accept-Language': 'de-AT,de;q=0.9,en;q=0.8' })
      )
    ).toBe('de-AT');
  });

  it.each<HeadersInit>([{}, { 'Accept-Language': '*;q=0.5' }])(
    'falls back to en-US (%o)',
    (headers) => {
      expect(getRequestLocale(requestWith(headers))).toBe('en-US');
    }
  );
});
