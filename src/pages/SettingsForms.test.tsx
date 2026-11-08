import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe, beforeAll } from 'vitest';

import SettingsPage from './SettingsPage';

const profile = {
  defaultCurrency: 'USD',
  email: 'me@email.com',
  firstDayOfWeek: 'sun',
  id: 'user-1',
  name: 'Dom',
};

const renderSettings = (result: unknown = { ok: true, toasts: [] }) => {
  const action = vi.fn();

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      loader: () => {
        return {
          habits: {},
          profile,
          toasts: [],
          traits: {},
          user: { email: 'me@email.com', id: 'user-1', isAnonymous: false },
        };
      },
      children: [
        {
          path: '/settings',
          action: async ({ request }) => {
            action(Object.fromEntries(await request.formData()));

            return result;
          },
          Component: (props) => {
            return (
              <SettingsPage
                {...(props as React.ComponentProps<typeof SettingsPage>)}
                loaderData={{ identities: [], identitiesError: null }}
              />
            );
          },
        },
      ],
    },
  ]);

  render(<Stub initialEntries={['/settings']} />);

  return { action };
};

describe('SettingsPage forms', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect() {}

        observe() {}

        unobserve() {}
      }
    );

    Element.prototype.getAnimations ??= () => {
      return [];
    };
  });

  it('posts every general field, the selects included', async () => {
    const { action } = renderSettings();

    fireEvent.change(await screen.findByPlaceholderText('Name'), {
      target: { value: 'Dominic' },
    });
    fireEvent.submit(screen.getByTestId('general-form'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({
        defaultCurrency: 'USD',
        firstDayOfWeek: 'sun',
        intent: 'update-profile',
        name: 'Dominic',
      });
    });
  });

  it('shows field errors from the action under the security fields', async () => {
    renderSettings({
      error: 'Please check the highlighted fields',
      fieldErrors: { email: 'Enter a valid email address' },
      ok: false,
    });

    fireEvent.click(await screen.findByText('Security'));
    fireEvent.change(await screen.findByPlaceholderText('Email'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.submit(screen.getByTestId('security-form'));

    expect(await screen.findByText('Enter a valid email address')).toBeTruthy();
  });
});
