import { describe, it, expect } from 'vitest';

import capitalize from './capitalize';

describe(capitalize.name, () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
