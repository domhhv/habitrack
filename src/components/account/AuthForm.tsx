import { PasswordInput, type AuthMode } from '@components';
import { Input, Button, cn } from '@heroui/react';
import { useTextField } from '@hooks';
import React from 'react';

type AuthFormProps = {
  onSubmit: (email: string, password: string, name: string) => void;
  onCancel: () => void;
  disabled: boolean;
  submitButtonLabel: string;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  goBackToLogin: () => void;
};

const AuthForm = ({
  submitButtonLabel,
  onSubmit,
  onCancel,
  disabled,
  mode,
  onModeChange,
  goBackToLogin,
}: AuthFormProps) => {
  const [email, handleEmailChange, clearEmail] = useTextField();
  const [name, handleNameChange, clearName] = useTextField();
  const [password, handlePasswordChange, clearPassword] = useTextField();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(email, password, name);
  };

  const clearValues = () => {
    clearEmail();
    clearPassword();
    clearName();
  };

  const handleCancel = () => {
    clearValues();
    onCancel();
  };

  const formClassName = cn(mode === 'reset-password' && 'py-3');

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="submit-form"
      className={formClassName}
    >
      <div className="flex flex-col gap-4">
        {mode === 'reset-password' && (
          <p>
            Enter your email address below and we will send you a link to reset
            your password.
          </p>
        )}
        <Input
          value={email}
          onChange={handleEmailChange}
          type="email"
          label="Email"
          isDisabled={disabled}
          classNames={{
            description: 'text-right',
          }}
          description={
            mode === 'reset-password' && (
              <Button
                className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
                onPress={goBackToLogin}
                disableAnimation
              >
                Back to login
              </Button>
            )
          }
        />
        {mode === 'register' && (
          <Input
            value={name}
            onChange={handleNameChange}
            label="Name (optional)"
            isDisabled={disabled}
          />
        )}
        {['login', 'register'].includes(mode) && (
          <PasswordInput
            value={password}
            onChange={handlePasswordChange}
            label="Password"
            isDisabled={disabled}
            onReset={
              mode === 'login'
                ? () => {
                    return onModeChange('reset-password');
                  }
                : undefined
            }
          />
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button onPress={handleCancel} isDisabled={disabled} variant="flat">
          Cancel
        </Button>
        <Button
          color="primary"
          isLoading={disabled}
          type="submit"
          data-testid="submit-button"
        >
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
