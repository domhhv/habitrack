import { AuthModalButton, FloatingLabelInput } from '@components';
import DoNotDisturbAltRoundedIcon from '@mui/icons-material/DoNotDisturbAltRounded';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/joy';
import React, { type FormEventHandler } from 'react';

import { StyledAccountForm, StyledAccountPageContainer } from './styled';
import useAccountPage from './useAccountPage';
import useEmailConfirmed from './useEmailConfirmed';

const AccountPage = () => {
  const {
    loading,
    forbidden,
    email,
    handleEmailChange,
    name,
    handleNameChange,
    phoneNumber,
    handlePhoneNumberChange,
    updateProfile,
  } = useAccountPage();

  useEmailConfirmed(email);

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
    void updateProfile();
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
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={loading}
            label="Phone number"
            dataTestId="phone-number-input"
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
