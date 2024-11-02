import Calendar from './Calendar';

jest.mock('@stores', () => ({
  useHabitsStore: jest.fn(),
  useOccurrencesStore: jest.fn(),
  useTraitsStore: jest.fn(),
}));

describe(Calendar.name, () => {
  it('should be tested', () => {
    expect(true).toBeTruthy();
  });
});
