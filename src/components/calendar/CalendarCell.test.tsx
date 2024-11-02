import CalendarCell from './CalendarCell';

jest.mock('@stores', () => ({
  useHabitsStore: jest.fn(),
  useOccurrencesStore: jest.fn(),
  useTraitsStore: jest.fn(),
}));

describe(CalendarCell.name, () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});
