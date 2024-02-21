jest.mock('./useAccountPage');
jest.mock('@supabase/auth-helpers-react', () => ({
  ...jest.requireActual('@supabase/auth-helpers-react'),
  __esModule: true,
  useUser: jest.fn().mockReturnValue({ id: '123' }),
}));
jest.mock('@services');

import { useUser } from '@supabase/auth-helpers-react';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AccountPage from './AccountPage';
import useAccountPage from './useAccountPage';

jest.mock('./useEmailConfirmed', () => () => {});

describe(AccountPage.name, () => {
  it('should show loader', () => {
    (useAccountPage as jest.Mock).mockReturnValue({
      loading: true,
      forbidden: false,
      email: '',
      handleEmailChange: jest.fn(),
      name: '',
      handleNameChange: jest.fn(),
      phoneNumber: '',
      handlePhoneNumberChange: jest.fn(),
      updateProfile: jest.fn(),
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
      phoneNumber: '',
      handlePhoneNumberChange: jest.fn(),
      updateProfile: jest.fn(),
    });
    (useUser as jest.Mock).mockReturnValue({ id: null });
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
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
      phoneNumber: '123-456-7890',
      handlePhoneNumberChange: jest.fn(),
      updateProfile: jest.fn(),
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

    expect(getByTestId('phone-number-input')).toHaveProperty(
      'value',
      '123-456-7890'
    );
  });

  it('should call updateProfile', async () => {
    const updateProfile = jest.fn();
    (useAccountPage as jest.Mock).mockReturnValue({
      loading: false,
      forbidden: false,
      email: '',
      handleEmailChange: jest.fn(),
      name: '',
      handleNameChange: jest.fn(),
      phoneNumber: '',
      handlePhoneNumberChange: jest.fn(),
      updateProfile,
    });
    const { getByTestId } = render(
      <BrowserRouter>
        <AccountPage />
      </BrowserRouter>
    );

    act(() => {
      fireEvent.submit(getByTestId('account-form'));
    });

    expect(updateProfile).toHaveBeenCalled();
  });
});
