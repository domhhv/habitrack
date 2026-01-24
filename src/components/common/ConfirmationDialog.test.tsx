import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import ConfirmationDialog from './ConfirmationDialog';

const mockApproveConfirmation = vi.fn();
const mockRejectConfirmation = vi.fn();
const mockUseConfirmationState = vi.fn();
const mockUseConfirmationActions = vi.fn();

vi.mock('@stores', () => {
  return {
    useConfirmationActions: () => {
      return mockUseConfirmationActions();
    },
    useConfirmationState: () => {
      return mockUseConfirmationState();
    },
  };
});

describe(ConfirmationDialog.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfirmationActions.mockReturnValue({
      approveConfirmation: mockApproveConfirmation,
      rejectConfirmation: mockRejectConfirmation,
    });
  });

  it('should display with default texts when no custom texts provided', () => {
    mockUseConfirmationState.mockReturnValue({
      isOpen: true,
    });

    const { getByText } = render(<ConfirmationDialog />);

    expect(getByText('Are you sure?')).toBeDefined();
    expect(getByText('This action cannot be undone.')).toBeDefined();
    expect(getByText('Cancel')).toBeDefined();
    expect(getByText('Confirm')).toBeDefined();
  });

  it('should display custom texts when provided', () => {
    mockUseConfirmationState.mockReturnValue({
      cancelText: 'No',
      confirmText: 'Yes',
      description: 'Custom description text',
      isOpen: true,
      title: 'Custom title',
    });

    const { getByText } = render(<ConfirmationDialog />);

    expect(getByText('Custom title')).toBeDefined();
    expect(getByText('Custom description text')).toBeDefined();
    expect(getByText('No')).toBeDefined();
    expect(getByText('Yes')).toBeDefined();
  });

  it('should call approveConfirmation when confirm button is clicked', async () => {
    mockUseConfirmationState.mockReturnValue({
      isOpen: true,
    });

    const { getByText } = render(<ConfirmationDialog />);

    getByText('Confirm').click();

    await waitFor(() => {
      expect(mockApproveConfirmation).toHaveBeenCalledTimes(1);
    });
  });

  it('should call rejectConfirmation when cancel button is clicked', async () => {
    mockUseConfirmationState.mockReturnValue({
      isOpen: true,
    });

    const { getByText } = render(<ConfirmationDialog />);

    getByText('Cancel').click();

    await waitFor(() => {
      expect(mockRejectConfirmation).toHaveBeenCalledTimes(1);
    });
  });

  it('should apply correct color to confirm button', () => {
    mockUseConfirmationState.mockReturnValue({
      color: 'danger',
      isOpen: true,
    });

    const { getByText } = render(<ConfirmationDialog />);
    const confirmButton = getByText('Confirm');

    expect(confirmButton).toBeDefined();
    expect(
      confirmButton.hasAttribute('data-color') ||
        confirmButton.className.includes('danger')
    ).toBe(true);
  });
});
