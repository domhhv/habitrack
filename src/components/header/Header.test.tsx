import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import Header from './Header';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

vi.mock('@hooks', () => {
  return {
    ThemeMode: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    },
    useFetchOnAuth: vi.fn(),
    useScreenWidth: vi.fn().mockReturnValue({
      screenWidth: 1400,
      isMobile: false,
      isDesktop: true,
    }),
    useThemeMode: vi
      .fn()
      .mockReturnValue({ themeMode: 'light', setThemeMode: vi.fn() }),
    useUser: vi
      .fn()
      .mockReturnValue({ id: '4c6b7c3b-ec2f-45fb-8c3a-df16f7a4b3aa' }),
  };
});

describe(Header.name, () => {
  it('should render habits and calendar links', () => {
    const { getByText } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(getByText('Calendar')).toBeDefined();
    expect(getByText('Habits')).toBeDefined();
  });
});
