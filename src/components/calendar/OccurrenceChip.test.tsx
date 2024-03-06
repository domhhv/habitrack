import { useHabits, useOccurrences } from '@context';
import { useScreenSize, useHabitIconUrl } from '@hooks';
import { render, waitFor } from '@testing-library/react';
import React from 'react';

import OccurrenceChip, { type OccurrenceChipProps } from './OccurrenceChip';

jest.mock('@hooks', () => ({
  useHabitTraitChipColor: jest.fn(),
  useScreenSize: jest.fn(),
  useHabitIconUrl: jest.fn(),
}));

jest.mock('@context', () => ({
  useHabits: jest.fn(),
  useOccurrences: jest.fn(),
}));

describe(OccurrenceChip.name, () => {
  const mockOnDelete = jest.fn();
  const props: OccurrenceChipProps = {
    occurrence: {
      id: 1,
      createdAt: '2021-01-01T00:00:00Z',
      updatedAt: '2021-01-02T00:00:00Z',
      timestamp: 1612137600000,
      day: '2021-02-01',
      time: null,
      habitId: 2,
      userId: '3',
    },
    onDelete: mockOnDelete,
  };

  it('should render img with habit icon', async () => {
    (useHabits as jest.Mock).mockReturnValue({
      habitsMap: {
        2: {
          id: 2,
          name: 'Test Habit Name',
          iconPath: 'path/to/test/icon',
          traitId: 1,
        },
      },
    });
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: null,
    });
    (useHabitIconUrl as jest.Mock).mockReturnValue('path/to/test/icon');
    const { getByAltText } = render(<OccurrenceChip {...props} />);
    const img = getByAltText('Test Habit Name icon');
    expect(img).toBeInTheDocument();
    await waitFor(() => {
      expect(img).toHaveAttribute('src', 'path/to/test/icon');
    });
  });

  it('should call onDelete when delete button is clicked', () => {
    (useHabits as jest.Mock).mockReturnValue({
      habitsMap: {
        2: {
          id: 2,
          name: 'Test Habit Name',
          iconPath: 'path/to/test/icon',
          traitId: 1,
        },
      },
    });
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: null,
    });
    const { getByRole } = render(<OccurrenceChip {...props} />);
    const deleteButton = getByRole('habit-chip-delete-button');
    deleteButton.click();
    expect(mockOnDelete).toHaveBeenCalledWith(1, expect.anything());
  });

  it('should render CircularProgress when occurrence is being deleted', () => {
    (useHabitIconUrl as jest.Mock).mockReturnValue('');
    (useHabits as jest.Mock).mockReturnValue({
      habitsMap: {
        2: {
          id: 2,
          name: 'Test Habit Name',
          iconPath: 'path/to/test/icon',
          traitId: 1,
        },
      },
    });
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
    (useHabitIconUrl as jest.Mock).mockReturnValue('');
    (useHabits as jest.Mock).mockReturnValue({
      habitsMap: {
        2: {
          id: 2,
          name: 'Test Habit Name',
          iconPath: 'path/to/test/icon',
          traitId: 1,
        },
      },
    });
    (useOccurrences as jest.Mock).mockReturnValue({
      occurrenceIdBeingDeleted: null,
    });
    (useScreenSize as jest.Mock).mockReturnValue(1024);
    const { queryByRole } = render(<OccurrenceChip {...props} />);
    const chipDelete = queryByRole('habit-chip-delete-button');
    expect(chipDelete).toBeNull();
  });
});
