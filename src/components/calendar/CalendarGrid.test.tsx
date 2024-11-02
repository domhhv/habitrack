import CalendarGrid from './CalendarGrid';

jest.mock('@stores', () => ({
  useHabitsStore: jest.fn(),
  useOccurrencesStore: jest.fn(),
  useTraitsStore: jest.fn(),
}));

describe(CalendarGrid.name, () => {
  it('should be tested', () => {
    expect(true).toBeTruthy();
  });
});
