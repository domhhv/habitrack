import React from 'react';

import { type ChangeEventLike } from '@utils';

type ReturnValue = [string, (event: ChangeEventLike) => void, () => void];

const useTextField = (initialValue = ''): ReturnValue => {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = React.useCallback((event: ChangeEventLike) => {
    setValue(event.target.value);
  }, []);

  const clearValue = React.useCallback(() => {
    setValue('');
  }, []);

  return [value, handleChange, clearValue];
};

export default useTextField;
