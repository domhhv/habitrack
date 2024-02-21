import HabitsPage from './HabitsPage';

jest.mock('@services', () => ({
  listHabits: jest.fn(() =>
    Promise.resolve([
      {
        id: 1,
        name: 'Habit name',
        description: 'Habit description',
        userId: 'uuid-42',
        createdAt: '2021-01-01T00:00:00Z',
        updatedAt: '2021-01-01T00:00:00Z',
        iconPath: 'icon-path',
        traitId: 1,
      },
    ])
  ),
}));

describe(HabitsPage.name, () => {
  it('should be tested', () => {
    expect(true).toBeTruthy();
  });
});
