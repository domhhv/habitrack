import React from 'react';

type FormValue = File | null;

type ReturnValue = [
  FormValue,
  React.ChangeEventHandler<HTMLInputElement>,
  () => void,
];

const useFileField = (initialValue: FormValue = null): ReturnValue => {
  const [value, setValue] = React.useState<FormValue>(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.files?.[0] || null;
    setValue(value);
  };

  const clearValue = () => {
    setValue(null);
  };

  return [value, handleChange, clearValue];
};

export default useFileField;
