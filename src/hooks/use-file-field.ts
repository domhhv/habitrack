import React from 'react';

type FileFieldValue = File | null;

type ReturnValue = [
  FileFieldValue,
  React.ChangeEventHandler<HTMLInputElement>,
  () => void,
];

const useFileField = (initialValue: FileFieldValue = null): ReturnValue => {
  const [value, setValue] = React.useState<FileFieldValue>(initialValue);

  const handleChange = ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (!files) {
      return null;
    }

    const [value] = files;
    setValue(value || null);
  };

  const clearValue = () => {
    setValue(null);
  };

  return [value, handleChange, clearValue];
};

export default useFileField;
