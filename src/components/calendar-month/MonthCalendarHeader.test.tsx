import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import MonthCalendarHeader, {
  type MonthCalendarHeaderProps,
} from './MonthCalendarHeader';

describe(MonthCalendarHeader.name, () => {
  const props: MonthCalendarHeaderProps = {
    activeMonthLabel: 'January',
    activeYear: '2022',
  };

  it.skip('should render month and year', () => {
    const { getByText } = render(<MonthCalendarHeader {...props} />);
    expect(getByText('January 2022')).toBeInTheDocument();
  });
});
