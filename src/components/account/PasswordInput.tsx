import { Input, Button } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import React, { type ChangeEventHandler } from 'react';

type PasswordInputProps = {
  isDisabled: boolean;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  testId?: string;
  value: string;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  onReset?: () => void;
};

const PasswordInput = ({
  isDisabled,
  label,
  onChange,
  onReset,
  testId = '',
  value,
  variant = 'flat',
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => {
      return !prev;
    });
  };

  return (
    <Input
      value={value}
      label={label}
      variant={variant}
      onChange={onChange}
      data-testid={testId}
      isDisabled={isDisabled}
      type={isVisible ? 'text' : 'password'}
      classNames={{
        description: 'text-right',
      }}
      description={
        onReset ? (
          <Button
            disableAnimation
            onPress={onReset}
            className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
          >
            Forgot password?
          </Button>
        ) : null
      }
      endContent={
        <button
          type="button"
          onClick={toggleVisibility}
          className="focus:outline-hidden"
          aria-label="toggle password visibility"
        >
          {isVisible ? (
            <EyeSlashIcon className="text-default-400 pointer-events-none text-2xl" />
          ) : (
            <EyeIcon className="text-default-400 pointer-events-none text-2xl" />
          )}
        </button>
      }
    />
  );
};

export default PasswordInput;
