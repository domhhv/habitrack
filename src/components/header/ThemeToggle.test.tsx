import ThemeToggle from './ThemeToggle';

jest.mock('@stores', () => ({
  useHabitsStore: jest.fn(),
  useOccurrencesStore: jest.fn(),
  useTraitsStore: jest.fn(),
}));

describe(ThemeToggle.name, () => {
  it('should be tested', () => {
    expect(true).toBeTruthy();
  });
});
