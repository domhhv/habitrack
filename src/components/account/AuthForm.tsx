import { Input, Label, TextField } from '@heroui/react';
import { type ReactNode, type SubmitEventHandler } from 'react';

import { CustomButton } from '@components';
import { useTextField } from '@hooks';

import PasswordInput from './PasswordInput';

type AuthFormProps = {
  canReset?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  isAuthenticating: boolean;
  passwordAutoComplete?: string;
  submitLabel: string;
  withPassword?: boolean;
  onSubmit: (email: string, password: string) => void;
};

const AuthForm = ({
  canReset,
  description,
  footer,
  isAuthenticating,
  onSubmit,
  passwordAutoComplete,
  submitLabel,
  withPassword = true,
}: AuthFormProps) => {
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange] = useTextField();

  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form className="w-full" onSubmit={handleSubmit} data-testid="submit-form">
      <div className="flex flex-col gap-4">
        {!!description && <p className="text-muted text-sm">{description}</p>}
        <TextField
          fullWidth
          name="email"
          type="email"
          value={email}
          variant="secondary"
          onChange={handleEmailChange}
          isDisabled={isAuthenticating}
        >
          <Label className="h-6">Email</Label>
          <Input autoComplete="email" placeholder="me@email.com" />
        </TextField>
        {withPassword && (
          <PasswordInput
            value={password}
            label="Password"
            variant="secondary"
            canReset={canReset}
            isDisabled={isAuthenticating}
            onChange={handlePasswordChange}
            autoComplete={passwordAutoComplete}
          />
        )}
      </div>
      <CustomButton
        fullWidth
        type="submit"
        className="mt-6"
        variant="primary"
        data-testid="submit-button"
        isPending={isAuthenticating}
      >
        {submitLabel}
      </CustomButton>
      {!!footer && (
        <div className="text-muted mt-4 text-center text-sm">{footer}</div>
      )}
    </form>
  );
};

export default AuthForm;
