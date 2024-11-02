import React, { type ChangeEventHandler } from 'react';
import { Button, Input } from '@nextui-org/react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

type PasswordInputProps = {
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: string;
  isDisabled: boolean;
  onReset?: () => void;
  testId?: string;
};

const PasswordInput = ({
  variant = 'flat',
  value,
  onChange,
  label,
  isDisabled,
  onReset,
  testId = '',
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <Input
      classNames={{
        description: 'text-right',
      }}
      description={
        onReset ? (
          <Button
            className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
            onClick={onReset}
            disableAnimation
          >
            Forgot password?
          </Button>
        ) : null
      }
      variant={variant}
      value={value}
      onChange={onChange}
      label={label}
      isDisabled={isDisabled}
      type={isVisible ? 'text' : 'password'}
      endContent={
        <button
          className="focus:outline-none"
          type="button"
          onClick={toggleVisibility}
          aria-label="toggle password visibility"
        >
          {isVisible ? (
            <EyeSlash className="pointer-events-none text-2xl text-default-400" />
          ) : (
            <Eye className="pointer-events-none text-2xl text-default-400" />
          )}
        </button>
      }
      data-testid={testId}
    />
  );
};

export default PasswordInput;
