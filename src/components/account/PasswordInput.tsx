import { Label, Button, TextField, InputGroup } from '@heroui/react';
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
    <TextField fullWidth name="password">
      <Label>Password</Label>
      <InputGroup variant={variant}>
        <InputGroup.Input
          value={value}
          placeholder={label}
          onChange={onChange}
          data-testid={testId}
          disabled={isDisabled}
          type={isVisible ? 'text' : 'password'}
        />
        <InputGroup.Suffix className="px-0">
          <Button
            size="sm"
            isIconOnly
            variant="ghost"
            onPress={toggleVisibility}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            {isVisible ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeSlashIcon className="size-4" />
            )}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
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
    </TextField>
  );
};

export default PasswordInput;
