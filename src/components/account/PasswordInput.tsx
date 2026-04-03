import { Input, Button } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import React, { type ChangeEventHandler } from 'react';

type PasswordInputProps = {
  isDisabled: boolean;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  testId?: string;
  value: string;
  variant?: 'primary' | 'secondary';
  onReset?: () => void;
};

const PasswordInput = ({
  isDisabled,
  label,
  onChange,
  onReset,
  testId = '',
  value,
  variant,
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => {
      return !prev;
    });
  };

  return (
    <div className="relative">
      <Input
        value={value}
        variant={variant}
        className="pr-10"
        placeholder={label}
        onChange={onChange}
        data-testid={testId}
        disabled={isDisabled}
        type={isVisible ? 'text' : 'password'}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        aria-label="toggle password visibility"
        className="absolute top-1/2 right-2 -translate-y-1/2 focus:outline-hidden"
      >
        {isVisible ? (
          <EyeSlashIcon className="text-default-400 pointer-events-none text-2xl" />
        ) : (
          <EyeIcon className="text-default-400 pointer-events-none text-2xl" />
        )}
      </button>
      {onReset && (
        <div className="text-right">
          <Button
            onPress={onReset}
            className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
          >
            Forgot password?
          </Button>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
