import { Link, Label, TextField, InputGroup } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import React, { type ChangeEventHandler } from 'react';

import { CustomButton } from '@components';

type PasswordInputProps = {
  autoComplete?: string;
  canReset?: boolean;
  className?: string;
  isDisabled: boolean;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  testId?: string;
  value: string;
  variant?: 'primary' | 'secondary';
};

const PasswordInput = ({
  autoComplete = 'current-password',
  canReset = false,
  className,
  isDisabled,
  label,
  onChange,
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
    <TextField fullWidth name="password" className={className}>
      <div className="flex items-center justify-between">
        <Label className="h-6">Password</Label>
        {canReset && (
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-accent-soft-foreground text-sm"
            >
              Forgot password?
            </Link>
          </div>
        )}
      </div>
      <InputGroup variant={variant}>
        <InputGroup.Input
          value={value}
          placeholder={label}
          onChange={onChange}
          data-testid={testId}
          disabled={isDisabled}
          autoComplete={autoComplete}
          type={isVisible ? 'text' : 'password'}
        />
        <InputGroup.Suffix className="pr-0.5 pl-0">
          <CustomButton
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
          </CustomButton>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
};

export default PasswordInput;
