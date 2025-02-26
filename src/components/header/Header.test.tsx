import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';

import Header from './Header';

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
