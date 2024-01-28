import { Textarea } from '@mui/joy';
import { ColorPaletteProp } from '@mui/joy/styles/types/colorSystem';
import { VariantProp } from '@mui/joy/styles/types/variants';
import React from 'react';

import InnerTextarea from './InnerTextarea';

type FloatingLabelTextareaProps = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  variant?: VariantProp;
  color?: ColorPaletteProp;
  disabled?: boolean;
};

const FloatingLabelTextarea = ({
  value,
  onChange,
  label = 'Label',
  placeholder = 'Enter text',
  required = false,
  variant = 'outlined',
  color = 'neutral',
  disabled = false,
}: FloatingLabelTextareaProps) => {
  return (
    <Textarea
      required={required}
      slots={{ textarea: InnerTextarea }}
      slotProps={{ textarea: { placeholder, label } }}
      sx={{ borderRadius: '6px' }}
      value={value}
      onChange={onChange}
      variant={variant}
      color={color}
      disabled={disabled}
    />
  );
};

export default FloatingLabelTextarea;
