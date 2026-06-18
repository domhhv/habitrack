import React, { type ChangeEvent } from 'react';

type VisuallyHiddenInputProps = {
  isDisabled?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const VisuallyHiddenInput = ({
  isDisabled = false,
  onChange,
  ref,
}: VisuallyHiddenInputProps) => {
  return (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      onChange={onChange}
      disabled={isDisabled}
      role="habit-icon-input"
      className="clip-rect(0 0 0 0) clip-path-inset(50%) absolute bottom-0 left-0 h-0 w-0 overflow-hidden whitespace-nowrap"
    />
  );
};

export default VisuallyHiddenInput;
