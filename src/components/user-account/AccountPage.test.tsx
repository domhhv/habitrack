jest.mock('./use-account-page');
jest.mock('@supabase/auth-helpers-react', () => ({
  ...jest.requireActual('@supabase/auth-helpers-react'),
  __esModule: true,
  useUser: jest.fn().mockReturnValue({ id: '123' }),
}));
jest.mock('@services');
jest.mock('./use-email-confirmed', () => ({
  __esModule: true,
  useEmailConfirmed: jest.fn(),
}));

import { SnackbarProvider, UserAccountProvider } from '@context';
import { useUser } from '@supabase/auth-helpers-react';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AccountPage from './AccountPage';
import { useAccountPage } from './use-account-page';

describe(AccountPage.name, () => {
  it('should show loader', () => {
    (useAccountPage as jest.Mock).mockReturnValue({
      loading: true,
      forbidden: false,
      email: '',
      handleEmailChange: jest.fn(),
      name: '',
      handleNameChange: jest.fn(),
      updateAccount: jest.fn(),
    });
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    expect(getByTestId('loader')).toBeDefined();
  });

  it('should ask user to log in', () => {
    (useAccountPage as jest.Mock).mockReturnValue({
      loading: false,
      forbidden: true,
      email: '',
      handleEmailChange: jest.fn(),
      name: '',
      handleNameChange: jest.fn(),
      updateAccount: jest.fn(),
    });
    (useUser as jest.Mock).mockReturnValue({ id: null });
    const { getByTestId } = render(
      <BrowserRouter>
        <SnackbarProvider>
          <UserAccountProvider>
            <AccountPage />
          </UserAccountProvider>
        </SnackbarProvider>
      </BrowserRouter>
    );

    expect(getByTestId('account-page')).toBeDefined();
    expect(getByTestId('alert')).toBeDefined();
  });

  it('should use account data', () => {
    (useAccountPage as jest.Mock).mockReturnValue({
      loading: false,
      forbidden: false,
      email: 'example@mail.com',
      handleEmailChange: jest.fn(),
      name: 'Test name',
      handleNameChange: jest.fn(),
      updateAccount: jest.fn(),
    });
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

  it('should call updateAccount', async () => {
    const updateAccount = jest.fn();
    (useAccountPage as jest.Mock).mockReturnValue({
      loading: false,
      forbidden: false,
      email: '',
      handleEmailChange: jest.fn(),
      name: '',
      handleNameChange: jest.fn(),
      updateAccount,
    });
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
