import { useUser } from '@hooks';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import AccountPage from './AccountPage';

vi.mock('@services');

vi.mock('@hooks', () => ({
  ThemeMode: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  useUser: vi.fn().mockReturnValue({ id: '123' }),
  useDocumentTitle: vi.fn(),
  useTextField: vi.fn().mockReturnValue(['', vi.fn()]),
}));

vi.mock('./use-auth-search-params', () => ({
  useAuthSearchParams: vi.fn(),
}));

describe(AccountPage.name, () => {
  it.skip('should show loader', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    expect(getByTestId('loader')).toBeDefined();
  });

  it('should ask user to log in', () => {
    (useUser as ReturnType<typeof vi.fn>).mockReturnValue({ id: null });
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    expect(getByTestId('account-page')).toBeDefined();
    expect(getByTestId('alert')).toBeDefined();
  });

  it.skip('should use account data', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    expect(getByTestId('account-page')).toBeDefined();

    expect(getByTestId('email-input')).toHaveProperty(
      'value',
      'example@mail.com'
    );

    expect(getByTestId('name-input')).toHaveProperty('value', 'Test name');
  });

  it.skip('should call updateAccount', async () => {
    const updateAccount = vi.fn();
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    act(() => {
      fireEvent.submit(getByTestId('account-form'));
    });

    expect(updateAccount).toHaveBeenCalled();
  });
});
