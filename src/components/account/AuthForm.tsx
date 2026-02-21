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
        <Input
          type="email"
          value={email}
          label="Email"
          isDisabled={isDisabled}
          onChange={handleEmailChange}
          classNames={{
            description: 'text-right',
          }}
          description={
            mode === 'reset-password' && (
              <Button
                disableAnimation
                onPress={goBackToLogin}
                className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
              >
                Back to login
              </Button>
            )
          }
        />
        {mode === 'register' && (
          <Input
            value={name}
            isDisabled={isDisabled}
            label="Name (optional)"
            onChange={handleNameChange}
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
        <Button variant="flat" onPress={handleCancel} isDisabled={isDisabled}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isDisabled}
          data-testid="submit-button"
        >
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
