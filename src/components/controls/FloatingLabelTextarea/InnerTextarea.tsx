import React from 'react';

import { StyledLabel, StyledTextarea } from './styled';

type InnerTextareaProps = {
  label: string;
  placeholder: string;
};

const InnerTextarea = (
  props: InnerTextareaProps,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) => {
  const id = React.useId();

  return (
    <React.Fragment>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <StyledTextarea minRows={2} {...props} ref={ref} id={id} />
      <StyledLabel htmlFor={id}>{props.label}</StyledLabel>
    </React.Fragment>
  );
};

export default React.forwardRef(InnerTextarea);
