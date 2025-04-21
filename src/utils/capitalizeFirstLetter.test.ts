import { describe, it, expect } from 'vitest';

import capitalizeFirstLetter from './capitalizeFirstLetter';

describe(capitalizeFirstLetter.name, () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });
});
