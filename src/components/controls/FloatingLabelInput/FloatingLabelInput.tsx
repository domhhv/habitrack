import { Input } from '@mui/joy';
import { type ColorPaletteProp } from '@mui/joy/styles/types/colorSystem';
import { type VariantProp } from '@mui/joy/styles/types/variants';
import React from 'react';

import InnerInput from './InnerInput';

type FloatingLabelInputProps = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  variant?: VariantProp;
  color?: ColorPaletteProp;
  disabled?: boolean;
  dataTestId?: string;
};

const FloatingLabelInput = ({
  value,
  type = 'text',
  onChange,
  placeholder = 'Enter value',
  label = 'Label',
  variant = 'outlined',
  color = 'neutral',
  required = false,
  disabled = false,
  dataTestId,
}: FloatingLabelInputProps) => {
  return (
    <Input
      required={required}
      slots={{ input: InnerInput }}
      slotProps={{
        input: { placeholder, type, label, 'data-testid': dataTestId },
      }}
      value={value}
      onChange={onChange}
      variant={variant}
      color={color}
      disabled={disabled}
      sx={{
        '--Input-minHeight': '56px',
        '--Input-radius': '6px',
      }}
    />
  );
};

export default FloatingLabelInput;
