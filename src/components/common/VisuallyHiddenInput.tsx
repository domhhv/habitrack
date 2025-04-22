import React, { type ChangeEvent } from 'react';

type VisuallyHiddenInputProps = {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const VisuallyHiddenInput = ({ onChange }: VisuallyHiddenInputProps) => {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      role="habit-icon-input"
      className="clip-rect(0 0 0 0) clip-path-inset(50%) absolute bottom-0 left-0 h-0 w-0 overflow-hidden whitespace-nowrap"
    />
  );
};

export default VisuallyHiddenInput;
