import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe } from 'vitest';

import { makeTestOccurrence } from '@tests';

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
    useScreenWidth: vi.fn().mockReturnValue({ screenWidth: 1000 }),
    useUser: vi.fn().mockReturnValue({
      user: null,
    }),
  };
});

vi.mock('@services', () => {
  return {
    getPublicUrl: vi
      .fn()
      .mockReturnValue('https://i.ibb.co/vvgw7bx/habitrack-logo.png'),
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
        'https://i.ibb.co/vvgw7bx/habitrack-logo.png'
      );
    });
  });
});
