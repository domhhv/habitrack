import { generateCalendarRange } from '@helpers';
import { getWeeksInMonth } from '@internationalized/date';
import { act, render } from '@testing-library/react';
import React from 'react';
import { useCalendar } from 'react-aria';
import { useCalendarState } from 'react-stately';
import { describe, it, expect, vi } from 'vitest';

import App from './App';

vi.mock('react-aria', () => ({
  useLocale: vi.fn(),
  useCalendar: vi.fn(),
}));

vi.mock('react-stately', () => ({
  useCalendarState: vi.fn(),
}));

vi.mock('@internationalized/date', () => ({
  getWeeksInMonth: vi.fn(),
}));

vi.mock('@utils', () => ({
  generateCalendarRange: vi.fn(),
}));

vi.mock('@components', () => ({
  Calendar: vi.fn(),
  HabitsPage: vi.fn(),
  AppHeader: vi.fn(),
  AccountPage: vi.fn(),
  Snackbars: vi.fn(),
}));

vi.mock('@hooks', () => ({
  useUser: vi
    .fn()
    .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
}));

vi.mock('react-aria', () => ({
  useLocale: vi.fn().mockImplementation(() => ({
    locale: 'en-GB',
  })),
  I18nProvider: vi.fn().mockImplementation(({ children }) => children),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe(App.name, () => {
  it.skip('should call generateCalendarRange', () => {
    (useCalendarState as ReturnType<typeof vi.fn>).mockReturnValue({
      visibleRange: {
        start: new Date('2022-01-01'),
        end: new Date('2022-01-31'),
      },
      getDatesInWeek: vi.fn().mockReturnValue([]),
    });
    (getWeeksInMonth as ReturnType<typeof vi.fn>).mockReturnValue(5);
    (useCalendar as ReturnType<typeof vi.fn>).mockReturnValue({
      title: '',
    });
    (generateCalendarRange as ReturnType<typeof vi.fn>).mockReturnValue([]);

    act(() => render(<App />));

    expect(useCalendarState).toHaveBeenCalled();
    expect(getWeeksInMonth).toHaveBeenCalledWith(
      new Date('2022-01-01'),
      'en-GB'
    );
  });
});
