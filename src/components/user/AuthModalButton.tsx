import { FloatingLabelInput } from '@components';
import { useUser } from '@context';
import { AccountCircleOutlined } from '@mui/icons-material';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
  styled,
  Typography,
} from '@mui/joy';
import React from 'react';

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  '& > div': {
    marginTop: theme.spacing(1),
  },
}));

const AuthModalButton = () => {
  const { user, loggingIn, login, logout } = useUser();
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleClick = () => {
    if (user) {
      return logout();
    }

    setOpen(true);
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(username, password);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <>
      <Button startDecorator={<AccountCircleOutlined />} onClick={handleClick}>
        {user ? 'Sign Out' : 'Log In'}
      </Button>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <DialogTitle>Log in with a username and a password</DialogTitle>
          <form onSubmit={handleSubmit}>
            <StyledDialogContent>
              <Typography level="body-sm">
                If you don&apos;t have an account yet, we&apos;ll create one for
                you
              </Typography>
              <FloatingLabelInput
                value={username}
                onChange={handleUsernameChange}
                label="Username"
                disabled={loggingIn}
              />
              <FloatingLabelInput
                value={password}
                onChange={handlePasswordChange}
                label="Password"
                type="password"
                disabled={loggingIn}
              />
            </StyledDialogContent>
            <DialogActions>
              <Button
                variant="solid"
                color="primary"
                loading={loggingIn}
                type="submit"
              >
                Log In / Sign Up
              </Button>
              <Button
                onClick={handleClose}
                variant="outlined"
                color="neutral"
                disabled={loggingIn}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AuthModalButton;
