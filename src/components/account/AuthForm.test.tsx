import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

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
        disabled={disabled}
        submitButtonLabel={submitButtonLabel}
        onModeChange={() => {}}
        goBackToLogin={() => {}}
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
        disabled={disabled}
        submitButtonLabel={submitButtonLabel}
        onModeChange={() => {}}
        goBackToLogin={() => {}}
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

  it.skip('should show snackbar with error message when error is thrown', async () => {
    const onCancel = vi.fn();
    const disabled = false;
    const submitButtonLabel = 'Submit';
    const { getByTestId } = render(
      <AuthForm
        mode="login"
        onSubmit={() => {
          throw new Error('My error message');
        }}
        onCancel={onCancel}
        disabled={disabled}
        submitButtonLabel={submitButtonLabel}
        onModeChange={() => {}}
        goBackToLogin={() => {}}
      />
    );

    const submitForm = getByTestId('submit-form');

    act(() => {
      fireEvent.submit(submitForm);
    });

    await waitFor(() => {
      expect(getByTestId('snackbar')).toBeDefined();
      expect(getByTestId('snackbar-message')).toHaveTextContent(
        'My error message'
      );
    });
  });

  it.skip('should show snackbar with default error message when error is thrown', async () => {
    const onCancel = vi.fn();
    const disabled = false;
    const submitButtonLabel = 'Submit';
    const { getByTestId } = render(
      <AuthForm
        mode="login"
        onSubmit={() => {
          throw new Error('');
        }}
        onCancel={onCancel}
        disabled={disabled}
        submitButtonLabel={submitButtonLabel}
        onModeChange={() => {}}
        goBackToLogin={() => {}}
      />
    );

    const submitForm = getByTestId('submit-form');

    act(() => {
      fireEvent.submit(submitForm);
    });

    await waitFor(() => {
      expect(getByTestId('snackbar')).toBeDefined();
      expect(getByTestId('snackbar-message')).toHaveTextContent(
        'Something went wrong'
      );
    });
  });
});
