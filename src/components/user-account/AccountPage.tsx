import { AuthModalButton, FloatingLabelInput } from '@components';
import { useSnackbar } from '@context';
import DoNotDisturbAltRoundedIcon from '@mui/icons-material/DoNotDisturbAltRounded';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/joy';
import React, { type FormEventHandler } from 'react';
import { useLocation } from 'react-router-dom';

import { StyledAccountForm, StyledAccountPageContainer } from './styled';
import useAccountPage from './useAccountPage';

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
  const { showSnackbar } = useSnackbar();

  const location = useLocation();

  React.useEffect(() => {
    const [, emailConfirmed] = location.search.split('=');

    if (email && emailConfirmed) {
      showSnackbar('Email confirmed', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    }
  }, [email, location, showSnackbar]);

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
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={loading}
            label="Phone number"
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
