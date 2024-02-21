jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn().mockReturnValue('my-id'),
}));

import { render, waitFor } from '@testing-library/react';
import React from 'react';

import InnerTextarea from './InnerTextarea';

describe(InnerTextarea.name, () => {
  it('should apply React id', async () => {
    const { container } = render(
      <InnerTextarea label="Label" placeholder="Placeholder" />
    );
    const textarea = container.querySelector('textarea');
    await waitFor(() => {
      expect(textarea).toHaveProperty('id', 'my-id');
    });
  });
});
