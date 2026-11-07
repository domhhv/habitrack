import { Toast } from '@heroui/react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { Outlet, createRoutesStub } from 'react-router';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { StorageBuckets, type OccurrenceFormValues } from '@models';
import { uploadImages } from '@services';

import useOccurrenceFetcher from './use-occurrence-fetcher';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    uploadImages: vi.fn(),
  };
});

const photo = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

const formValues: OccurrenceFormValues = {
  depletedStockIds: [],
  hasSpecificTime: true,
  metricValues: { 'metric-1': { numericValue: 3 }, 'metric-2': undefined },
  note: '',
  occurredAt: '2026-10-22T08:00:00.000Z',
  selectedHabitId: 'habit-1',
  stockUsages: [],
  uploadedFiles: [photo],
};

const renderSaver = () => {
  const action = vi.fn();
  const onSuccess = vi.fn();

  const Saver = () => {
    const { isSaving, save } = useOccurrenceFetcher(onSuccess);

    return (
      <button
        type="button"
        disabled={isSaving}
        onClick={() => {
          void save(formValues, { intent: 'create' });
        }}
      >
        Save
      </button>
    );
  };

  const Stub = createRoutesStub([
    {
      Component: Outlet,
      id: 'app',
      loader: () => {
        return { user: { id: 'user-1' } };
      },
      children: [
        { Component: Saver, path: '/' },
        {
          path: '/resources/occurrences',
          action: async ({ request }) => {
            action(await request.json());

            return { ok: true, toasts: [] };
          },
        },
      ],
    },
  ]);

  return { action, onSuccess, ...render(<Stub initialEntries={['/']} />) };
};

describe(useOccurrenceFetcher.name, () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(uploadImages).mockReset();
  });

  it('uploads the photos from the browser and submits only their paths', async () => {
    vi.mocked(uploadImages).mockResolvedValue({
      failedUploadErrors: [],
      paths: ['user-1/habit-1/photo.jpg'],
    });
    const { action, findByText, onSuccess } = renderSaver();

    fireEvent.click(await findByText('Save'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(uploadImages).toHaveBeenCalledWith(
      expect.anything(),
      StorageBuckets.OCCURRENCE_PHOTOS,
      'user-1',
      [photo],
      'habit-1'
    );
    expect(action).toHaveBeenCalledWith({
      intent: 'create',
      photoPaths: ['user-1/habit-1/photo.jpg'],
      values: {
        depletedStockIds: [],
        hasSpecificTime: true,
        metricValues: { 'metric-1': { numericValue: 3 } },
        note: '',
        occurredAt: '2026-10-22T08:00:00.000Z',
        selectedHabitId: 'habit-1',
        stockUsages: [],
      },
    });
  });

  it('shows a toast for failed uploads and still saves the entry', async () => {
    const danger = vi.spyOn(Toast.toast, 'danger');
    vi.mocked(uploadImages).mockResolvedValue({
      failedUploadErrors: ['Too large'],
      paths: [],
    });
    const { action, findByText } = renderSaver();

    fireEvent.click(await findByText('Save'));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith(
        expect.objectContaining({ photoPaths: [] })
      );
    });
    expect(danger).toHaveBeenCalledWith('Failed to upload 1 photo', {
      description: 'Error details: Too large',
    });
  });
});
