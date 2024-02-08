import { FloatingLabelInput } from '@components';
import { Button, Box, Typography, CircularProgress } from '@mui/joy';
import { useSession } from '@supabase/auth-helpers-react';
import React, { type FormEventHandler } from 'react';
import { useLocation } from 'react-router-dom';

import { StyledAccountLoaderContainer } from './styled';
import { useAccount } from './useAccount';

export default function Account() {
  const session = useSession();
  const {
    loading,
    email,
    handleEmailChange,
    name,
    handleNameChange,
    updateProfile,
  } = useAccount();
  const location = useLocation();
  console.log({ location });

  if (loading) {
    return (
      <StyledAccountLoaderContainer>
        <CircularProgress />
      </StyledAccountLoaderContainer>
    );
  }

  if (!session) {
    return 'Please sign in first.';
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void updateProfile();
  };

  return (
    <Box p={2} width="90%" m="0 auto">
      <Typography gutterBottom level="h4">
        Account
      </Typography>
      <form onSubmit={handleSubmit}>
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
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
}
