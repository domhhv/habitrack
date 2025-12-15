import { render } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe } from 'vitest';

import ConfirmDialog from './ConfirmDialog';

describe(ConfirmDialog.name, () => {
  const props = {
    heading: 'Heading',
    isLoading: false,
    isOpen: true,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('should not show modal if open is false', async () => {
    const { queryByText } = render(
      <ConfirmDialog {...props} isOpen={false}>
        Test
      </ConfirmDialog>
    );
    expect(queryByText('Test')).toBeNull();
  });

  it('should show modal if open is true', async () => {
    const { getByText } = render(
      <ConfirmDialog {...props}>Test</ConfirmDialog>
    );
    expect(getByText('Test')).toBeDefined();
  });

  it('should render heading', () => {
    const { getByText } = render(
      <ConfirmDialog {...props}>Test</ConfirmDialog>
    );
    expect(getByText('Heading')).toBeDefined();
  });

  it('should disable action buttons when loading', () => {
    const { getByText } = render(
      <ConfirmDialog {...props} isLoading>
        Test
      </ConfirmDialog>
    );
    expect(getByText('Cancel')).toHaveProperty('disabled', true);
    expect(getByText('Confirm')).toHaveProperty('disabled', true);
  });

  it('should call onCancel when cancel button is clicked', () => {
    const { getByText } = render(
      <ConfirmDialog {...props}>Test</ConfirmDialog>
    );
    getByText('Cancel').click();
    expect(props.onCancel).toHaveBeenCalled();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const { getByText } = render(
      <ConfirmDialog {...props}>Test</ConfirmDialog>
    );
    getByText('Confirm').click();
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it('should render children', () => {
    const { getByText } = render(
      <ConfirmDialog {...props}>Test</ConfirmDialog>
    );
    expect(getByText('Test')).toBeDefined();
  });
});
