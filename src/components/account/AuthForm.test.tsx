import { act, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe } from 'vitest';

import AuthForm from './AuthForm';

describe(AuthForm.name, () => {
  it('should call onSubmit with email and password', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const disabled = false;
    const submitButtonLabel = 'Submit';
    const { getByLabelText, getByTestId } = render(
      <AuthForm
        mode="login"
        onSubmit={onSubmit}
        onCancel={onCancel}
        isDisabled={disabled}
        onModeChange={() => {}}
        goBackToLogin={() => {}}
        submitButtonLabel={submitButtonLabel}
      />
    );

    const email = getByLabelText('Email');
    const password = getByLabelText('Password');
    const submitForm = getByTestId('submit-form');

    act(() => {
      fireEvent.change(email, { target: { value: 'email' } });
      fireEvent.change(password, { target: { value: 'password' } });
      fireEvent.submit(submitForm);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('email', 'password', '');
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const disabled = false;
    const submitButtonLabel = 'Submit';
    const { getByText } = render(
      <AuthForm
        mode="login"
        onSubmit={onSubmit}
        onCancel={onCancel}
        isDisabled={disabled}
        onModeChange={() => {}}
        goBackToLogin={() => {}}
        submitButtonLabel={submitButtonLabel}
      />
    );

    const cancelButton = getByText('Cancel');

    act(() => {
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
