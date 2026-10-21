import { Input, Label, TextField } from '@heroui/react';
import { GoogleLogoIcon } from '@phosphor-icons/react';
import { type ReactNode } from 'react';
import { Form } from 'react-router';

import { CustomButton } from '@components';
import { useTextField } from '@hooks';
import { signInWithGoogle } from '@services';

import PasswordInput from './PasswordInput';

type AuthFormProps = {
  canReset?: boolean;
  children?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  isAuthenticating: boolean;
  passwordAutoComplete?: string;
  submitLabel: string;
  withPassword?: boolean;
};

const AuthForm = ({
  canReset,
  children,
  description,
  footer,
  isAuthenticating,
  passwordAutoComplete,
  submitLabel,
  withPassword = true,
}: AuthFormProps) => {
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange] = useTextField();

  return (
    <Form method="post" className="w-full" data-testid="submit-form">
      {children}
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
        className="mt-6"
        variant="primary"
        onClick={signInWithGoogle}
        data-testid="submit-button"
      >
        <GoogleLogoIcon size={20} weight="bold" className="mr-1" />
        Sign in with Google
      </CustomButton>
      <CustomButton
        fullWidth
        type="submit"
        className="mt-4"
        variant="primary"
        data-testid="submit-button"
        isPending={isAuthenticating}
      >
        {submitLabel}
      </CustomButton>
      {!!footer && (
        <div className="text-muted mt-4 text-center text-sm">{footer}</div>
      )}
    </Form>
  );
};

export default AuthForm;
