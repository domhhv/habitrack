import React, { type ChangeEvent } from 'react';

type TextFieldHandler = (
  value:
    | string
    | ChangeEvent<HTMLInputElement>
    | ChangeEvent<HTMLTextAreaElement>
) => void;

type ReturnValue = [string, TextFieldHandler, () => void];

const useTextField = (initialValue = ''): ReturnValue => {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = React.useCallback(
    (
      value:
        | string
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>
    ) => {
      if (typeof value === 'string') {
        setValue(value);
      } else {
        setValue(value.target.value);
      }
    },
    []
  );

  const clearValue = React.useCallback(() => {
    setValue('');
  }, []);

  return [value, handleChange, clearValue];
};

export default useTextField;
