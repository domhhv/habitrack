import { cn, Input, Button } from '@heroui/react';
import { type SubmitEventHandler } from 'react';

import { useTextField } from '@hooks';

import PasswordInput from './PasswordInput';

type AuthFormProps = {
  isDisabled: boolean;
  mode: 'login' | 'register' | 'reset-password';
  submitButtonLabel: string;
  goBackToLogin: () => void;
  onCancel: () => void;
  onModeChange: (mode: 'login' | 'register' | 'reset-password') => void;
  onSubmit: (email: string, password: string, name: string) => void;
};

const AuthForm = ({
  goBackToLogin,
  isDisabled,
  mode,
  onCancel,
  onModeChange,
  onSubmit,
  submitButtonLabel,
}: AuthFormProps) => {
  const [email, handleEmailChange, clearEmail] = useTextField();
  const [name, handleNameChange, clearName] = useTextField();
  const [password, handlePasswordChange, clearPassword] = useTextField();

  const handleSubmit: SubmitEventHandler = async (event) => {
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
        <div>
          <Input
            type="email"
            value={email}
            placeholder="Email"
            disabled={isDisabled}
            onChange={handleEmailChange}
          />
          {mode === 'reset-password' && (
            <div className="text-right">
              <Button
                onPress={goBackToLogin}
                className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
              >
                Back to login
              </Button>
            </div>
          )}
        </div>
        {mode === 'register' && (
          <Input
            value={name}
            disabled={isDisabled}
            onChange={handleNameChange}
            placeholder="Name (optional)"
          />
        )}
        {['login', 'register'].includes(mode) && (
          <PasswordInput
            value={password}
            label="Password"
            isDisabled={isDisabled}
            onChange={handlePasswordChange}
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
        <Button
          variant="secondary"
          onPress={handleCancel}
          isDisabled={isDisabled}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isDisabled={isDisabled}
          data-testid="submit-button"
        >
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
