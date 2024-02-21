import { FloatingLabelTextarea } from '@components';
import { render } from '@testing-library/react';
import React from 'react';

describe(FloatingLabelTextarea.name, () => {
  const props = {
    value: 'value',
    onChange: () => {},
    label: 'Label',
    placeholder: 'placeholder',
    disabled: true,
    required: true,
  };

  it('should render with props', () => {
    const { container } = render(<FloatingLabelTextarea {...props} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeDefined();
  });
});
