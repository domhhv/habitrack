jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn().mockReturnValue('my-id'),
}));

jest.mock('@utils', () => ({
  transformServerEntities: jest.fn(),
}));

import { render, waitFor } from '@testing-library/react';
import React from 'react';

import InnerInput from './InnerInput';

describe(InnerInput.name, () => {
  it('should apply React id', async () => {
    const { container } = render(
      <InnerInput label="Label" placeholder="Placeholder" />
    );
    const input = container.querySelector('input');
    await waitFor(() => {
      expect(input).toHaveProperty('id', 'my-id');
    });
  });
});
