jest.mock('@context', () => ({
  useSnackbar: jest.fn().mockReturnValue({ showSnackbar: jest.fn() }),
}));

jest.mock('@services', () => ({
  getUserAccount: jest.fn(),
  updateUserAccount: jest.fn(),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(),
}));

jest.mock('@utils', () => ({
  transformClientEntity: jest.fn(),
  transformServerEntities: jest.fn().mockImplementation(() => ({})),
}));

import { getUserAccount, updateUserAccount } from '@services';
import { useUser } from '@supabase/auth-helpers-react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { transformClientEntity, transformServerEntities } from '@utils';
import React from 'react';

import useAccountPage from './useAccountPage';

describe('useAccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use supabase data', async () => {
    (useUser as jest.Mock).mockReturnValue({
      id: '123',
      email: 'email',
      phone: 'phone',
    });
    (getUserAccount as jest.Mock).mockReturnValue(
      Promise.resolve({
        email: '',
        phoneNumber: '',
        name: '',
      })
    );
    (transformServerEntities as jest.Mock).mockReturnValue(() => ({}));
    const { result } = renderHook(() => useAccountPage());
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.forbidden).toBe(false);
    expect(result.current.email).toBe('email');
    expect(result.current.phoneNumber).toBe('phone');
  });

  it('should use account data', async () => {
    (transformClientEntity as jest.Mock).mockReturnValue({
      name: 'user-name',
      email: 'user-email',
      'phone-number': 'user-phone',
      'updated-at': '2021-01-01T00:00:00.000Z',
    });
    (useUser as jest.Mock).mockReturnValue({
      id: '123',
      email: 'email',
      phone: 'phone',
    });
    (getUserAccount as jest.Mock).mockReturnValue(
      Promise.resolve({
        email: 'user-email',
        phoneNumber: 'user-phone',
        name: 'user-name',
      })
    );
    const { result } = renderHook(() => useAccountPage());
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.forbidden).toBe(false);
    expect(result.current.email).toBe('user-email');
    expect(result.current.name).toBe('user-name');
    expect(result.current.phoneNumber).toBe('user-phone');

    await act(async () => {
      await result.current.updateProfile();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(updateUserAccount).toHaveBeenCalledWith('123', {
        email: 'user-email',
        name: 'user-name',
        'phone-number': 'user-phone',
        'updated-at': '2021-01-01T00:00:00.000Z',
      });
    });
  });

  it('should handle user not logged in', async () => {
    (useUser as jest.Mock).mockReturnValue({ id: null });
    const { result } = renderHook(() => useAccountPage());

    await waitFor(() => {
      expect(result.current.forbidden).toBe(true);
    });
  });

  it('should not call updateProfile if user not logged in', async () => {
    (useUser as jest.Mock).mockReturnValue({ id: null });
    const { result } = renderHook(() => useAccountPage());

    await act(async () => {
      await result.current.updateProfile();
    });

    expect(updateUserAccount).not.toHaveBeenCalled();
  });

  it('should set values to empty strings if no data provided', async () => {
    (useUser as jest.Mock).mockReturnValue({
      id: 'uuid-42',
      email: '',
      phone: '',
    });
    (getUserAccount as jest.Mock).mockReturnValue(
      Promise.resolve({
        email: '',
        phoneNumber: '',
        name: '',
      })
    );
    (transformServerEntities as jest.Mock).mockReturnValue(() => ({}));
    const { result } = renderHook(() => useAccountPage());
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.forbidden).toBe(false);
      expect(result.current.email).toBe('');
      expect(result.current.phoneNumber).toBe('');
      expect(result.current.name).toBe('');
    });
  });

  it('should handle data entered by user', async () => {
    (useUser as jest.Mock).mockReturnValue({
      id: '123',
    });
    const { result } = renderHook(() => useAccountPage());
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.forbidden).toBe(false);

    act(() => {
      result.current.handleEmailChange({
        target: { value: 'new-user-email' },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleNameChange({
        target: { value: 'new-user-name' },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handlePhoneNumberChange({
        target: { value: 'new-user-phone' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.email).toBe('new-user-email');
      expect(result.current.name).toBe('new-user-name');
      expect(result.current.phoneNumber).toBe('new-user-phone');
    });
  });
});
