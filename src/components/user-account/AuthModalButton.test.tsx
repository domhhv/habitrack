import { useUserAccount } from '@context';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AuthModalButton from './AuthModalButton';

jest.mock('@hooks', () => ({
  ...jest.requireActual('@hooks'),
  useAuth: jest.fn().mockReturnValue({
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    authenticating: false,
  }),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  ...jest.requireActual('@supabase/auth-helpers-react'),
  __esModule: true,
  useUser: jest.fn().mockReturnValue({ id: null }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('@supabase/auth-helpers-react'),
  __esModule: true,
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@context', () => ({
  ...jest.requireActual('@context'),
  __esModule: true,
  useUserAccount: jest.fn().mockReturnValue({
    supabaseUser: { id: null },
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    authenticating: false,
  }),
}));

describe(AuthModalButton.name, () => {
  it('should open modal if user is not logged out', () => {
    const { getByTestId, getByText } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const modal = getByText('Log in with a username and a password');
    expect(modal).toBeDefined();
  });

  it('should navigate to /account if user is logged in', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      supabaseUser: { id: '123' },
    });
    const { getByTestId, queryByText } = render(
      <BrowserRouter>
        <AuthModalButton />
      </BrowserRouter>
    );
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const modal = queryByText('Log in with a username and a password');
    expect(modal).toBeNull();
  });

  it('should switch to register mode', () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      supabaseUser: { id: null },
    });
    const { getByTestId, getByText } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const registerTab = getByText('Register');
    act(() => {
      fireEvent.click(registerTab);
    });
    const modal = getByText('Register with a username and a password');
    expect(modal).toBeDefined();
  });

  it('should close modal on cancel', () => {
    const { getByTestId, getByText, queryByText } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    act(() => {
      fireEvent.click(button);
    });
    const cancel = getByText('Cancel');
    act(() => {
      fireEvent.click(cancel);
    });
    const modal = queryByText('Log in with a username and a password');
    expect(modal).toBeNull();
  });

  it('should call login on submit', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      supabaseUser: { id: null },
      login: jest.fn(),
    });
    const { getByTestId } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    fireEvent.click(button);
    const submit = getByTestId('submit-button');
    fireEvent.click(submit);
    await waitFor(() => {
      expect(useUserAccount().login).toHaveBeenCalled();
    });
  });

  it('should call register on submit', async () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      supabaseUser: { id: null },
      register: jest.fn(),
    });
    const { getByTestId, getByText } = render(<AuthModalButton />);
    const authButton = getByTestId('auth-button');
    fireEvent.click(authButton);
    const registerTab = getByText('Register');
    fireEvent.click(registerTab);
    const submitRegisterButton = getByTestId('submit-button');
    fireEvent.click(submitRegisterButton);
    await waitFor(() => {
      expect(useUserAccount().register).toHaveBeenCalled();
    });
  });

  it('should display start decorator icon if user is logged out', () => {
    const { getByTestId, queryByTestId } = render(<AuthModalButton />);
    const accountCircleOutlinedIcon = getByTestId('AccountCircleOutlinedIcon');
    const logoutRoundedIcon = queryByTestId('LogoutRoundedIcon');
    expect(accountCircleOutlinedIcon).toBeDefined();
    expect(logoutRoundedIcon).toBeNull();
  });

  it('should display logout button if user is logged in', () => {
    (useUserAccount as jest.Mock).mockReturnValue({
      supabaseUser: { id: '123' },
    });
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <AuthModalButton />
      </BrowserRouter>
    );
    const accountCircleOutlinedIcon = queryByTestId(
      'AccountCircleOutlinedIcon'
    );
    const logoutRoundedIcon = getByTestId('LogoutRoundedIcon');
    expect(accountCircleOutlinedIcon).toBeNull();
    expect(logoutRoundedIcon).toBeDefined();
  });

  it('should call logout on logout button click if user is logged in', () => {
    const mockLogOut = jest.fn();
    (useUserAccount as jest.Mock).mockReturnValue({
      supabaseUser: { id: '123' },
      logout: mockLogOut,
    });
    const { getByTestId } = render(
      <BrowserRouter>
        <AuthModalButton />
      </BrowserRouter>
    );
    const logoutRoundedIcon = getByTestId('LogoutRoundedIcon');
    fireEvent.click(logoutRoundedIcon);
    expect(mockLogOut).toHaveBeenCalled();
  });
});
