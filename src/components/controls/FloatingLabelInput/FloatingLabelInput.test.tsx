import { FloatingLabelInput } from '@components';
import { render } from '@testing-library/react';
import React from 'react';

describe(FloatingLabelInput.name, () => {
  const props = {
    value: 'value',
    onChange: () => {},
    label: 'Label',
    placeholder: 'placeholder',
    disabled: true,
    required: true,
  };

  it('should render with props', () => {
    const { container } = render(<FloatingLabelInput {...props} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeDefined();
  });
});
