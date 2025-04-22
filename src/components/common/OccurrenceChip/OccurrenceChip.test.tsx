import { useScreenWidth } from '@hooks';
import { render, waitFor } from '@testing-library/react';
import { makeTestOccurrence } from '@tests';
import { getHabitIconUrl } from '@utils';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import OccurrenceChip, { type OccurrenceChipProps } from './OccurrenceChip';

vi.mock('@hooks', () => {
  return {
    useScreenWidth: vi.fn(),
  };
});

vi.mock('@stores', async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    useOccurrenceActions: vi.fn().mockReturnValue({
      removeOccurrence: vi.fn(),
    }),
  };
});

vi.mock('@hooks', async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    useUser: vi.fn().mockReturnValue({
      user: null,
    }),
    useScreenWidth: vi.fn().mockReturnValue({ screenWidth: 1000 }),
  };
});

describe(OccurrenceChip.name, () => {
  const props: OccurrenceChipProps = {
    occurrences: [makeTestOccurrence()],
  };

  it('should render img with habit icon', async () => {
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

  it('should not render delete button on small screens', () => {
    (useScreenWidth as ReturnType<typeof vi.fn>).mockReturnValue({
      screenWidth: 1024,
    });
    const { queryByRole } = render(<OccurrenceChip {...props} />);
    const chipDelete = queryByRole('habit-chip-delete-button');
    expect(chipDelete).toBeNull();
  });
});
