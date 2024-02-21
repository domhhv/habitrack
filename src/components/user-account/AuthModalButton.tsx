import { useUserAccount } from '@context';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import {
  ButtonGroup,
  DialogTitle,
  Modal,
  ModalDialog,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
} from '@mui/joy';
import React, { type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthForm from './AuthForm';
import { StyledAuthButton, StyleLogOutIconButton } from './styled';

const AuthModalButton = () => {
  const { login, logout, register, authenticating, supabaseUser } =
    useUserAccount();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleClick = () => {
    if (!supabaseUser?.id) {
      setOpen(true);
    } else {
      console.log('called navigate');
      navigate('/account');
    }
  };

  const handleClose = () => {
    setMode('login');
    setOpen(false);
  };

  const handleTabChange = (
    _: SyntheticEvent<Element, Event> | null,
    newValue: number | string | null
  ) => {
    setMode(newValue as 'login' | 'register');
  };

  const handleSubmit = async (username: string, password: string) => {
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }

      handleClose();
    } catch (e) {} // eslint-disable-line no-empty
  };

  const authFormProps = {
    onSubmit: handleSubmit,
    onCancel: handleClose,
    disabled: authenticating,
  };

  const actionLabel = mode === 'login' ? 'Log in' : 'Register';

  return (
    <>
      <ButtonGroup>
        <StyledAuthButton
          startDecorator={
            supabaseUser?.id ? null : <AccountCircleOutlinedIcon />
          }
          onClick={handleClick}
          data-testid="auth-button"
        >
          {supabaseUser?.id ? 'Account' : 'Log In'}
        </StyledAuthButton>
        {supabaseUser?.id && (
          <StyleLogOutIconButton onClick={() => logout()}>
            <LogoutRoundedIcon />
            <div style={{ display: 'none' }}>Log Out</div>
          </StyleLogOutIconButton>
        )}
      </ButtonGroup>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog sx={{ width: 420, padding: '20px 24px 10px' }}>
          <DialogTitle>
            {actionLabel} with a username and a password
          </DialogTitle>
          <Tabs
            value={mode}
            onChange={handleTabChange}
            sx={{ bgcolor: 'transparent', marginTop: 0.5 }}
          >
            <TabList
              aria-label="tabs"
              sx={{
                p: 0.5,
                gap: 0.5,
                borderRadius: 'xl',
                bgcolor: 'background.level1',
                [`& .${tabClasses.root}[aria-selected="true"]`]: {
                  boxShadow: 'none',
                  bgcolor: 'background.surface',
                },
              }}
              disableUnderline
            >
              <Tab
                disabled={authenticating}
                value="login"
                disableIndicator
                sx={{ flex: '1 1 0%' }}
              >
                Login
              </Tab>
              <Tab
                disabled={authenticating}
                value="register"
                disableIndicator
                sx={{ flex: '1 1 0%' }}
              >
                Register
              </Tab>
            </TabList>
            <TabPanel value="login" sx={{ padding: '16px 0' }}>
              <AuthForm {...authFormProps} submitButtonLabel="Log In" />
            </TabPanel>
            <TabPanel value="register" sx={{ padding: '16px 0' }}>
              <AuthForm {...authFormProps} submitButtonLabel="Create Account" />
            </TabPanel>
          </Tabs>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AuthModalButton;
