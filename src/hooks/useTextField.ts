import React from 'react';

type ReturnValue = [
  string,
  React.ChangeEventHandler<HTMLInputElement>,
  () => void,
  (value: string) => void,
];

const useTextField = (initialValue: string = ''): ReturnValue => {
  const [value, setValue] = React.useState<string>(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const clearValue = React.useCallback(() => {
    setValue('');
  }, []);

  return [value, handleChange, clearValue, setValue];
};

export default useTextField;
