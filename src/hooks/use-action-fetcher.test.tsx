import { Toast } from '@heroui/react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { createRoutesStub } from 'react-router';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { ActionResult } from '@models';

import useActionFetcher from './use-action-fetcher';

const renderSubmitter = (result: ActionResult, onSuccess = vi.fn()) => {
  const Submitter = () => {
    const fetcher = useActionFetcher(onSuccess);

    return (
      <button
        type="button"
        onClick={() => {
          void fetcher.submit({}, { method: 'post' });
        }}
      >
        Submit
      </button>
    );
  };

  const Stub = createRoutesStub([
    {
      Component: Submitter,
      path: '/',
      action: () => {
        return result;
      },
    },
  ]);

  return { onSuccess, ...render(<Stub initialEntries={['/']} />) };
};

describe(useActionFetcher.name, () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the returned toasts once and calls onSuccess', async () => {
    const success = vi.spyOn(Toast.toast, 'success');
    const { findByText, onSuccess } = renderSubmitter({
      ok: true,
      toasts: [{ title: 'Note added', variant: 'success' }],
    });

    fireEvent.click(await findByText('Submit'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(success).toHaveBeenCalledExactlyOnceWith('Note added', {
      description: undefined,
    });
  });

  it('shows the error toast without calling onSuccess', async () => {
    const danger = vi.spyOn(Toast.toast, 'danger');
    const { findByText, onSuccess } = renderSubmitter({
      error: 'Too long',
      ok: false,
      toasts: [
        {
          description: 'Error details: Too long',
          title: 'Something went wrong while adding your note',
          variant: 'danger',
        },
      ],
    });

    fireEvent.click(await findByText('Submit'));

    await waitFor(() => {
      expect(danger).toHaveBeenCalledExactlyOnceWith(
        'Something went wrong while adding your note',
        { description: 'Error details: Too long' }
      );
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
