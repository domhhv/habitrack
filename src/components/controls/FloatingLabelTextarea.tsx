import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { Textarea, styled } from '@mui/joy';
import * as React from 'react';

const StyledTextarea = styled(TextareaAutosize)({
  resize: 'none',
  border: 'none',
  minWidth: 0,
  outline: 0,
  padding: 0,
  paddingBlockStart: '1em',
  paddingInlineEnd: `var(--Textarea-paddingInline)`,
  flex: 'auto',
  alignSelf: 'stretch',
  color: 'inherit',
  backgroundColor: 'transparent',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontStyle: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  '&::placeholder': {
    opacity: 0,
    transition: '0.1s ease-out',
  },
  '&:focus::placeholder': {
    opacity: 1,
  },
  '&:focus + textarea + label, &:not(:placeholder-shown) + textarea + label': {
    top: '0.5rem',
    fontSize: '0.75rem',
  },
  '&:focus + textarea + label': {
    color: 'var(--Textarea-focusedHighlight)',
  },
});

const StyledLabel = styled('label')(({ theme }) => ({
  position: 'absolute',
  lineHeight: 1,
  top: 'calc((var(--Textarea-minHeight) - 1em) / 2)',
  color: theme.vars.palette.text.tertiary,
  fontWeight: theme.vars.fontWeight.md,
  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
}));

type InnerTextareaProps = {
  label: string;
  placeholder: string;
};

const InnerTextarea = React.forwardRef(function InnerTextarea(
  props: InnerTextareaProps,
  ref
) {
  const id = React.useId();
  return (
    <React.Fragment>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <StyledTextarea minRows={2} {...props} ref={ref} id={id} />
      <StyledLabel htmlFor={id}>{props.label}</StyledLabel>
    </React.Fragment>
  );
});

type FloatingLabelTextareaProps = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export default function FloatingLabelTextarea({
  value,
  onChange,
  label = 'Label',
  placeholder = 'Enter text',
  required = false,
}: FloatingLabelTextareaProps) {
  return (
    <Textarea
      required={required}
      slots={{ textarea: InnerTextarea }}
      slotProps={{ textarea: { placeholder, label } }}
      sx={{ borderRadius: '6px' }}
      value={value}
      onChange={onChange}
    />
  );
}
