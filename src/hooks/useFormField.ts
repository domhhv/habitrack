import React from 'react';

const useFormField = (
  initialValue: string = ''
): [string, React.ChangeEventHandler<HTMLInputElement>, () => void] => {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const clearValue = () => {
    setValue('');
  };

  return [value, handleChange, clearValue];
};

export default useFormField;
