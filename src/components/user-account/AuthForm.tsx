import { useSnackbar } from '@context';
import { useTextField } from '@hooks';
import { Input, Button } from '@nextui-org/react';
import React from 'react';

type AuthFormProps = {
  onSubmit: (username: string, password: string, name: string) => void;
  onCancel: () => void;
  disabled: boolean;
  submitButtonLabel: string;
  mode: 'login' | 'register';
};

const AuthForm = ({
  submitButtonLabel,
  onSubmit,
  onCancel,
  disabled,
  mode,
}: AuthFormProps) => {
  const [email, handleEmailChange, clearEmail] = useTextField();
  const [name, handleNameChange, clearName] = useTextField();
  const [password, handlePasswordChange, clearPassword] = useTextField();
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      onSubmit(email, password, name);
    } catch (e) {
      showSnackbar((e as Error).message || 'Something went wrong', {
        color: 'danger',
      });
      clearValues();
    }
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

  return (
    <form onSubmit={handleSubmit} data-testid="submit-form">
      <div className="flex flex-col gap-4">
        <Input
          value={email}
          onChange={handleEmailChange}
          type="email"
          label="Email"
          disabled={disabled}
        />
        {mode === 'register' && (
          <Input
            value={name}
            onChange={handleNameChange}
            label="Name (optional)"
            disabled={disabled}
          />
        )}
        <Input
          value={password}
          onChange={handlePasswordChange}
          label="Password"
          type="password"
          disabled={disabled}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={handleCancel} disabled={disabled} variant="flat">
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
