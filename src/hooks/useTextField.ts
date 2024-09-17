import React, { type ChangeEvent } from 'react';

type ReturnValue = [
  string,
  React.ChangeEventHandler<HTMLInputElement>,
  () => void,
  (value: string) => void,
];

const useTextField = (initialValue = ''): ReturnValue => {
  const [value, setValue] = React.useState(initialValue);
  console.log('useTextField, value:', value);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const clearValue = React.useCallback(() => {
    setValue('');
  }, []);

  return [value, handleChange, clearValue, setValue];
};

export default useTextField;
