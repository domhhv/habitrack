import React, { type ChangeEvent } from 'react';

type ReturnValue = [
  string,
  (value: string | ChangeEvent<HTMLInputElement>) => void,
  () => void,
];

const useTextField = (initialValue = ''): ReturnValue => {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = React.useCallback(
    (value: string | ChangeEvent<HTMLInputElement>) => {
      setValue(typeof value === 'string' ? value : value.target.value);
    },
    []
  );

  const clearValue = React.useCallback(() => {
    setValue('');
  }, []);

  return [value, handleChange, clearValue];
};

export default useTextField;
