import { AuthModalButton, FloatingLabelInput } from '@components';
import DoNotDisturbAltRoundedIcon from '@mui/icons-material/DoNotDisturbAltRounded';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/joy';
import React, { type FormEventHandler } from 'react';

import { StyledAccountForm, StyledAccountPageContainer } from './styled';
import { useAccount } from './useAccount';

const AccountPage = () => {
  const {
    loading,
    forbidden,
    email,
    handleEmailChange,
    name,
    handleNameChange,
    updateProfile,
  } = useAccount();

  if (loading) {
    return (
      <StyledAccountPageContainer>
        <CircularProgress />
      </StyledAccountPageContainer>
    );
  }

  if (forbidden) {
    return (
      <StyledAccountPageContainer>
        <Alert
          color="danger"
          size="lg"
          startDecorator={<DoNotDisturbAltRoundedIcon />}
          endDecorator={<AuthModalButton />}
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
    <StyledAccountPageContainer>
      <Typography gutterBottom level="h4">
        Your Account Info
      </Typography>
      <StyledAccountForm onSubmit={handleSubmit}>
        <Box mb={2}>
          <FloatingLabelInput
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            label="Email"
          />
        </Box>
        <Box mb={2}>
          <FloatingLabelInput
            value={name}
            onChange={handleNameChange}
            disabled={loading}
            label="Name"
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
