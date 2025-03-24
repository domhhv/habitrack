import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import AuthModalButton from './AuthModalButton';

vi.mock('@hooks', () => {
  return {
    useUser: vi.fn().mockReturnValue({ id: null }),
    ThemeMode: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    },
  };
});

vi.mock('react-router', () => {
  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }) => {
      return <div>{children}</div>;
    },
  };
});

describe(AuthModalButton.name, () => {
  it.skip('should open modal if user is not logged out', () => {
    const { getByTestId, getByText } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const modal = getByText('Log in with a email and a password');
    expect(modal).toBeDefined();
  });

  it.skip('should navigate to /account if user is logged in', async () => {
    const { getByTestId, queryByText } = render(
      <BrowserRouter>
        <AuthModalButton />
      </BrowserRouter>
    );
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const modal = queryByText('Log in with a email and a password');
    expect(modal).toBeNull();
  });

  it.skip('should switch to register mode', () => {
    const { getByTestId, getByText } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const registerTab = getByText('Register');
    act(() => {
      fireEvent.click(registerTab);
    });
    const modal = getByText('Register with a email and a password');
    expect(modal).toBeDefined();
  });

  it.skip('should close modal on cancel', async () => {
    const { getByTestId, getByText, queryByText } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const cancel = getByText('Cancel');
    act(() => {
      fireEvent.click(cancel);
    });
    await waitFor(() => {
      const modal = queryByText('Log in with a email and a password');
      expect(modal).toBeNull();
    });
  });

  it.skip('should display start decorators and logout button if user is logged in', () => {
    const { getByTestId, queryByTestId } = render(<AuthModalButton />);
    const userIcon = getByTestId('user-icon');
    const signOutIcon = queryByTestId('sign-out-icon');
    expect(userIcon).toBeDefined();
    expect(signOutIcon).toBeDefined();
  });

  it.skip('should call logout on logout button click if user is logged in', () => {
    const mockLogOut = vi.fn();
    const { getByTestId } = render(
      <BrowserRouter>
        <AuthModalButton />
      </BrowserRouter>
    );
    const signOutIcon = getByTestId('sign-out-icon');
    fireEvent.click(signOutIcon);
    expect(mockLogOut).toHaveBeenCalled();
  });
});
