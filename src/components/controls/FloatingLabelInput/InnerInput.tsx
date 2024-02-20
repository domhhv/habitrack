import React from 'react';

import { StyledInput, StyledLabel } from './styled';

type InnerInputProps = {
  label: string;
};

const InnerInput = (
  props: InnerInputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const id = React.useId();

  return (
    <React.Fragment>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <StyledInput {...props} ref={ref} id={id} />
      <StyledLabel htmlFor={id}>{props.label}</StyledLabel>
    </React.Fragment>
  );
};

export default React.forwardRef(InnerInput);
