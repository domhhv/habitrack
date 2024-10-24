jest.mock('react-aria', () => ({
  useLocale: jest.fn(),
  useCalendar: jest.fn(),
}));

jest.mock('react-stately', () => ({
  useCalendarState: jest.fn(),
}));

jest.mock('@internationalized/date', () => ({
  getWeeksInMonth: jest.fn(),
}));

jest.mock('@utils', () => ({
  generateCalendarRange: jest.fn(),
}));

jest.mock('@components', () => ({
  Calendar: jest.fn(),
  HabitsPage: jest.fn(),
  AppHeader: jest.fn(),
  AccountPage: jest.fn(),
  Snackbars: jest.fn(),
}));

jest.mock('react-aria', () => ({
  useLocale: jest.fn().mockImplementation(() => ({
    locale: 'en-GB',
  })),
  I18nProvider: jest.fn().mockImplementation(({ children }) => children),
}));

jest.mock('@context', () => ({
  HabitsProvider: jest.fn().mockImplementation(({ children }) => children),
  OccurrencesProvider: jest.fn().mockImplementation(({ children }) => children),
}));

import { generateCalendarRange } from '@helpers';
import { getWeeksInMonth } from '@internationalized/date';
import { act, render } from '@testing-library/react';
import React from 'react';
import { useCalendar } from 'react-aria';
import { useCalendarState } from 'react-stately';

import App from './App';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe(App.name, () => {
  it.skip('should call generateCalendarRange', () => {
    (useCalendarState as jest.Mock).mockReturnValue({
      visibleRange: {
        start: new Date('2022-01-01'),
        end: new Date('2022-01-31'),
      },
      getDatesInWeek: jest.fn().mockReturnValue([]),
    });
    (getWeeksInMonth as jest.Mock).mockReturnValue(5);
    (useCalendar as jest.Mock).mockReturnValue({
      title: '',
    });
    (generateCalendarRange as jest.Mock).mockReturnValue([]);

    act(() => render(<App />));

    expect(useCalendarState).toHaveBeenCalled();
    expect(getWeeksInMonth).toHaveBeenCalledWith(
      new Date('2022-01-01'),
      'en-GB'
    );
  });
});
