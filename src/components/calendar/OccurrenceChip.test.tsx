import { useOccurrences } from '@context';
import { useScreenSize } from '@hooks';
import { render, waitFor } from '@testing-library/react';
import { makeTestOccurrence } from '@tests';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import OccurrenceChip, { type OccurrenceChipProps } from './OccurrenceChip';

jest.mock('@hooks', () => ({
  useScreenSize: jest.fn(),
}));

jest.mock('@context', () => ({
  useOccurrences: jest.fn(),
}));

describe(OccurrenceChip.name, () => {
  const mockOnDelete = jest.fn();
  const props: OccurrenceChipProps = {
    occurrences: [makeTestOccurrence()],
    onDelete: mockOnDelete,
  };

  it('should render img with habit icon', async () => {
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: null,
    });
    const { getByAltText } = render(<OccurrenceChip {...props} />);
    const img = getByAltText('Test Habit Name icon');
    expect(img).toBeInTheDocument();
    await waitFor(() => {
      expect(img).toHaveAttribute(
        'src',
        getHabitIconUrl('https://i.ibb.co/vvgw7bx/habitrack-logo.png')
      );
    });
  });

  it('should call onDelete when delete button is clicked', () => {
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: null,
    });
    const { getByRole } = render(<OccurrenceChip {...props} />);
    const deleteButton = getByRole('habit-chip-delete-button');
    deleteButton.click();
    expect(mockOnDelete).toHaveBeenCalledWith(1, expect.anything());
  });

  it('should render CircularProgress when occurrence is being deleted', () => {
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: 1,
    });
    const { getByRole, queryByRole } = render(<OccurrenceChip {...props} />);
    const loader = getByRole('habit-chip-delete-loader');
    const chipDelete = queryByRole('habit-chip-delete-button');
    expect(loader).toBeInTheDocument();
    expect(chipDelete).toBeNull();
  });

  it('should not render delete button on small screens', () => {
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: null,
    });
    (useScreenSize as jest.Mock).mockReturnValue(1024);
    const { queryByRole } = render(<OccurrenceChip {...props} />);
    const chipDelete = queryByRole('habit-chip-delete-button');
    expect(chipDelete).toBeNull();
  });
});
