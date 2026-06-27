import { act, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe } from 'vitest';

import AuthForm from './AuthForm';

describe(AuthForm.name, () => {
  it('should call onSubmit with email and password', async () => {
    const onSubmit = vi.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <AuthForm
        onSubmit={onSubmit}
        submitLabel="Submit"
        isAuthenticating={false}
      />
    );

    const email = getByPlaceholderText('me@email.com');
    const password = getByPlaceholderText('Password');
    const submitForm = getByTestId('submit-form');

    act(() => {
      fireEvent.change(email, { target: { value: 'email' } });
      fireEvent.change(password, { target: { value: 'password' } });
      fireEvent.submit(submitForm);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('email', 'password');
    });
  });

  it('should not render a password field when withPassword is false', () => {
    const { queryByPlaceholderText } = render(
      <AuthForm
        onSubmit={vi.fn()}
        withPassword={false}
        submitLabel="Submit"
        isAuthenticating={false}
      />
    );

    expect(queryByPlaceholderText('Password')).toBeNull();
  });
});
