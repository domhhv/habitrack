import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { StorageBuckets } from '@models';

import SignedImageViewer from './SignedImageViewer';

const mockAskConfirmation = vi.fn();
const mockDeleteFile = vi.fn();
const mockCreateSignedUrls = vi.fn();
const mockOnDelete = vi.fn();

vi.mock('@stores', () => {
  return {
    useConfirmationActions: vi.fn(() => {
      return {
        askConfirmation: mockAskConfirmation,
      };
    }),
  };
});

vi.mock('@services', () => {
  return {
    createSignedUrls: (...args: unknown[]) => {
      return mockCreateSignedUrls(...args);
    },
    deleteFile: (...args: unknown[]) => {
      return mockDeleteFile(...args);
    },
  };
});

vi.mock('./ImageCarousel', () => {
  return {
    default: ({
      imagePathBeingDeleted,
      onDelete,
    }: {
      imagePathBeingDeleted: string;
      onDelete: (index: number) => void;
    }) => {
      return (
        <div>
          <button
            onClick={() => {
              return onDelete(0);
            }}
          >
            Delete Image
          </button>
          <div data-testid="image-path-being-deleted">
            {imagePathBeingDeleted}
          </div>
        </div>
      );
    },
  };
});

describe(SignedImageViewer.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSignedUrls.mockResolvedValue([
      { path: 'test-path-1.jpg', signedUrl: 'https://example.com/photo1.jpg' },
    ]);
    mockDeleteFile.mockResolvedValue(undefined);
  });

  it('should prompt for confirmation before deleting image', async () => {
    mockAskConfirmation.mockResolvedValue(true);

    const { getByText } = render(
      <SignedImageViewer
        onDelete={mockOnDelete}
        paths={['test-path-1.jpg']}
        bucket={StorageBuckets.OCCURRENCE_PHOTOS}
      />
    );

    await waitFor(() => {
      expect(mockCreateSignedUrls).toHaveBeenCalledWith(['test-path-1.jpg']);
    });

    const deleteButton = getByText('Delete Image');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAskConfirmation).toHaveBeenCalledWith({
        description: 'Deleting this image cannot be undone.',
      });
    });
  });

  it('should delete image after confirmation', async () => {
    mockAskConfirmation.mockResolvedValue(true);

    const { getByText } = render(
      <SignedImageViewer
        onDelete={mockOnDelete}
        paths={['test-path-1.jpg']}
        bucket={StorageBuckets.OCCURRENCE_PHOTOS}
      />
    );

    await waitFor(() => {
      expect(mockCreateSignedUrls).toHaveBeenCalledWith(['test-path-1.jpg']);
    });

    const deleteButton = getByText('Delete Image');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteFile).toHaveBeenCalledWith(
        StorageBuckets.OCCURRENCE_PHOTOS,
        'test-path-1.jpg'
      );
    });

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('test-path-1.jpg');
    });
  });

  it('should not delete image if confirmation is rejected', async () => {
    mockAskConfirmation.mockResolvedValue(false);

    const { getByText } = render(
      <SignedImageViewer
        onDelete={mockOnDelete}
        paths={['test-path-1.jpg']}
        bucket={StorageBuckets.OCCURRENCE_PHOTOS}
      />
    );

    await waitFor(() => {
      expect(mockCreateSignedUrls).toHaveBeenCalledWith(['test-path-1.jpg']);
    });

    const deleteButton = getByText('Delete Image');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockAskConfirmation).toHaveBeenCalledTimes(1);
    });

    expect(mockDeleteFile).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
