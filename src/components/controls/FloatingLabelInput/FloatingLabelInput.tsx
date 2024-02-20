import { Input } from '@mui/joy';
import { ColorPaletteProp } from '@mui/joy/styles/types/colorSystem';
import { VariantProp } from '@mui/joy/styles/types/variants';
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
}: FloatingLabelInputProps) => {
  return (
    <Input
      required={required}
      slots={{ input: InnerInput }}
      slotProps={{ input: { placeholder, type, label } }}
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
