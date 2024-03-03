import { AuthModalButton, FloatingLabelInput } from '@components';
import DoNotDisturbAltRoundedIcon from '@mui/icons-material/DoNotDisturbAltRounded';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/joy';
import React, { type FormEventHandler } from 'react';

import { StyledAccountForm, StyledAccountPageContainer } from './styled';
import { useAccountPage } from './use-account-page';
import { useEmailConfirmed } from './use-email-confirmed';

const AccountPage = () => {
  const {
    loading,
    forbidden,
    email,
    handleEmailChange,
    password,
    handlePasswordChange,
    name,
    handleNameChange,
    updateAccount,
  } = useAccountPage();

  useEmailConfirmed();

  if (loading) {
    return (
      <StyledAccountPageContainer data-testid="account-page">
        <CircularProgress data-testid="loader" />
      </StyledAccountPageContainer>
    );
  }

  if (forbidden) {
    return (
      <StyledAccountPageContainer data-testid="account-page">
        <Alert
          color="danger"
          size="lg"
          startDecorator={<DoNotDisturbAltRoundedIcon />}
          endDecorator={<AuthModalButton />}
          data-testid="alert"
        >
          <Typography level="h4">
            Please log in to your account first
          </Typography>
        </Alert>
      </StyledAccountPageContainer>
    );
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void updateAccount();
  };

  return (
    <StyledAccountPageContainer data-testid="account-page">
      <Typography gutterBottom level="h4">
        Your Account Info
      </Typography>
      <StyledAccountForm onSubmit={handleSubmit} data-testid="account-form">
        <Box mb={2}>
          <FloatingLabelInput
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            label="Email"
            dataTestId="email-input"
          />
        </Box>
        <Box mb={2}>
          <FloatingLabelInput
            type="password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            label="Set new password"
            dataTestId="password-input"
          />
        </Box>
        <Box mb={2}>
          <FloatingLabelInput
            value={name}
            onChange={handleNameChange}
            disabled={loading}
            label="Name"
            dataTestId="name-input"
          />
        </Box>
        <Box mt={2}>
          <Button fullWidth type="submit" loading={loading}>
            Save
          </Button>
        </Box>
      </StyledAccountForm>
    </StyledAccountPageContainer>
  );
};

export default AccountPage;
