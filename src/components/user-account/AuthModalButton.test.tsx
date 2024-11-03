import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AuthModalButton from './AuthModalButton';

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn().mockReturnValue({ id: null }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  __esModule: true,
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

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
    // (useUserAccount as jest.Mock).mockReturnValue({
    //   supabaseUser: { id: '123' },
    // });
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
    // (useUserAccount as jest.Mock).mockReturnValue({
    //   supabaseUser: { id: null },
    // });
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

  it.skip('should call login on submit', async () => {
    // (useUserAccount as jest.Mock).mockReturnValue({
    //   supabaseUser: { id: null },
    //   login: jest.fn(),
    // });
    const { getByTestId } = render(<AuthModalButton />);
    const button = getByTestId('auth-button');
    fireEvent.click(button);
    const submit = getByTestId('submit-button');
    fireEvent.click(submit);
    // await waitFor(() => {
    //   expect(useUserAccount().login).toHaveBeenCalled();
    // });
  });

  it.skip('should call register on submit', async () => {
    // (useUserAccount as jest.Mock).mockReturnValue({
    //   supabaseUser: { id: null },
    //   register: jest.fn(),
    // });
    const { getByTestId, getByText } = render(<AuthModalButton />);
    const authButton = getByTestId('auth-button');
    fireEvent.click(authButton);
    const registerTab = getByText('Register');
    fireEvent.click(registerTab);
    const submitRegisterButton = getByTestId('submit-button');
    fireEvent.click(submitRegisterButton);
    // await waitFor(() => {
    //   expect(useUserAccount().register).toHaveBeenCalled();
    // });
  });

  it.skip('should display start decorators and logout button if user is logged in', () => {
    // (useUserAccount as jest.Mock).mockReturnValue({
    //   supabaseUser: { id: '123' },
    // });
    const { getByTestId, queryByTestId } = render(<AuthModalButton />);
    const userIcon = getByTestId('user-icon');
    const signOutIcon = queryByTestId('sign-out-icon');
    expect(userIcon).toBeDefined();
    expect(signOutIcon).toBeDefined();
  });

  it.skip('should call logout on logout button click if user is logged in', () => {
    const mockLogOut = jest.fn();
    // (useUserAccount as jest.Mock).mockReturnValue({
    //   supabaseUser: { id: '123' },
    //   logout: mockLogOut,
    // });
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
