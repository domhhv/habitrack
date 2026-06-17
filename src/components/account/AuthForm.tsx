import { cn, Input, Label, TextField } from '@heroui/react';
import { type SubmitEventHandler } from 'react';

import { CustomButton } from '@components';
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
          <TextField
            fullWidth
            name="email"
            type="email"
            value={email}
            variant="secondary"
            isDisabled={isDisabled}
            onChange={handleEmailChange}
          >
            <Label>Email</Label>
            <Input placeholder="me@email.com" />
          </TextField>
          {mode === 'reset-password' && (
            <div className="text-right">
              <CustomButton
                onPress={goBackToLogin}
                className="h-auto bg-transparent p-0 text-gray-400 hover:text-gray-700"
              >
                Back to login
              </CustomButton>
            </div>
          )}
        </div>
        {mode === 'register' && (
          <TextField
            fullWidth
            name="name"
            value={name}
            variant="secondary"
            isDisabled={isDisabled}
            onChange={handleNameChange}
          >
            <Label>Name</Label>
            <Input placeholder="Optional" />
          </TextField>
        )}
        {['login', 'register'].includes(mode) && (
          <PasswordInput
            value={password}
            label="Password"
            variant="secondary"
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
        <CustomButton
          variant="secondary"
          onPress={handleCancel}
          isDisabled={isDisabled}
        >
          Cancel
        </CustomButton>
        <CustomButton
          type="submit"
          variant="primary"
          isDisabled={isDisabled}
          data-testid="submit-button"
        >
          {submitButtonLabel}
        </CustomButton>
      </div>
    </form>
  );
};

export default AuthForm;
