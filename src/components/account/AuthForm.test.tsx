import { act, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import AuthForm from './AuthForm';

describe(AuthForm.name, () => {
  it('should submit email, password, and extra fields to the route action', async () => {
    const action = vi.fn().mockResolvedValue(null);
    const Stub = createRoutesStub([
      {
        path: '/',
        action: async ({ request }) => {
          return action(Object.fromEntries(await request.formData()));
        },
        Component: () => {
          return (
            <AuthForm submitLabel="Submit" isAuthenticating={false}>
              <input value="mon" type="hidden" name="firstDayOfWeek" />
            </AuthForm>
          );
        },
      },
    ]);
    const { findByTestId, getByPlaceholderText } = render(<Stub />);

    const submitForm = await findByTestId('submit-form');

    act(() => {
      fireEvent.change(getByPlaceholderText('me@email.com'), {
        target: { value: 'me@email.com' },
      });
      fireEvent.change(getByPlaceholderText('Password'), {
        target: { value: 'password' },
      });
      fireEvent.submit(submitForm);
    });

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({
        email: 'me@email.com',
        firstDayOfWeek: 'mon',
        password: 'password',
      });
    });
  });

  it('should not render a password field when withPassword is false', async () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => {
          return (
            <AuthForm
              withPassword={false}
              submitLabel="Submit"
              isAuthenticating={false}
            />
          );
        },
      },
    ]);
    const { findByTestId, queryByPlaceholderText } = render(<Stub />);

    await findByTestId('submit-form');

    expect(queryByPlaceholderText('Password')).toBeNull();
  });
});
