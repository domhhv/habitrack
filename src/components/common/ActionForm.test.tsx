import { Input, Label, TextField, FieldError } from '@heroui/react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import { useActionFetcher } from '@hooks';

import ActionForm from './ActionForm';

const renderForm = (result: unknown) => {
  const action = vi.fn();

  const NameForm = () => {
    const fetcher = useActionFetcher();

    return (
      <ActionForm action="/submit" fetcher={fetcher}>
        <input type="hidden" name="intent" value="rename" />
        <TextField name="name" defaultValue="Old">
          <Label>Name</Label>
          <Input />
          <FieldError />
        </TextField>
        <button type="submit">Save</button>
      </ActionForm>
    );
  };

  const Stub = createRoutesStub([
    { Component: NameForm, path: '/' },
    {
      path: '/submit',
      action: async ({ request }) => {
        action(Object.fromEntries(await request.formData()));

        return result;
      },
    },
  ]);

  return { action, ...render(<Stub initialEntries={['/']} />) };
};

describe(ActionForm.name, () => {
  it('posts the named fields to the action', async () => {
    const { action, findByText } = renderForm({ ok: true });

    fireEvent.click(await findByText('Save'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({ intent: 'rename', name: 'Old' });
    });
  });

  it("shows the action's field errors next to their fields", async () => {
    const { findByText, getByRole } = renderForm({
      error: 'Please check the highlighted fields',
      fieldErrors: { name: 'Name is too long' },
      ok: false,
    });

    fireEvent.click(await findByText('Save'));

    expect(await findByText('Name is too long')).toBeTruthy();
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  });
});
