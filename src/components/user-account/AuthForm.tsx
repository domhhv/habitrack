import { FloatingLabelInput } from '@components';
import { useSnackbar } from '@context';
import { Button, DialogActions } from '@mui/joy';
import React from 'react';

import { StyledDialogContent } from './styled';

type AuthFormProps = {
  onSubmit: (username: string, password: string) => void;
  onCancel: () => void;
  disabled: boolean;
  submitButtonLabel: string;
};

const AuthForm = ({
  submitButtonLabel,
  onSubmit,
  onCancel,
  disabled,
}: AuthFormProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { showSnackbar } = useSnackbar();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      onSubmit(email, password);
    } catch (e) {
      showSnackbar((e as Error).message || 'Something went wrong', {
        variant: 'solid',
        color: 'danger',
      });
      clearValues();
    }
  };

  const clearValues = () => {
    setEmail('');
    setPassword('');
  };

  const handleCancel = () => {
    clearValues();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} data-testid="submit-form">
      <StyledDialogContent>
        <FloatingLabelInput
          value={email}
          onChange={handleUsernameChange}
          type="email"
          label="Email"
          disabled={disabled}
        />
        <FloatingLabelInput
          value={password}
          onChange={handlePasswordChange}
          label="Password"
          type="password"
          disabled={disabled}
        />
      </StyledDialogContent>
      <DialogActions>
        <Button
          variant="solid"
          color="primary"
          loading={disabled}
          type="submit"
          data-testid="submit-button"
        >
          {submitButtonLabel}
        </Button>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="neutral"
          disabled={disabled}
        >
          Cancel
        </Button>
      </DialogActions>
    </form>
  );
};

export default AuthForm;
