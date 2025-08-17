type Column = {
  align?: 'start' | 'center' | 'end';
  key: string;
  label: string;
};

const habitColumns: Column[] = [
  {
    key: 'icon',
    label: 'Icon',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'trait',
    label: 'Trait',
  },
  {
    key: 'tracking-since',
    label: 'Tracking since',
  },
  {
    key: 'last-entry',
    label: 'Last entry',
  },
  {
    key: 'longest-streak',
    label: 'Longest streak',
  },
  {
    align: 'center',
    key: 'total-entries',
    label: 'Total entries',
  },
  {
    align: 'end',
    key: 'actions',
    label: 'Actions',
  },
];

export default habitColumns;
