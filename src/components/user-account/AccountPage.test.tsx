import { useUser } from '@hooks';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';

import AccountPage from './AccountPage';

jest.mock('./use-account-page');
jest.mock('@hooks', () => ({
  ...jest.requireActual('@hooks'),
  __esModule: true,
  useUser: jest.fn().mockReturnValue({ id: '123' }),
}));
jest.mock('@services');
jest.mock('./use-auth-search-params', () => ({
  __esModule: true,
  useAuthSearchParams: jest.fn(),
}));

describe(AccountPage.name, () => {
  it('should show loader', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    expect(getByTestId('loader')).toBeDefined();
  });

  it('should ask user to log in', () => {
    (useUser as jest.Mock).mockReturnValue({ id: null });
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
    const updateAccount = jest.fn();
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
