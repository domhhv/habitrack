import { useAuth } from '@context';
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
import { useUser } from '@supabase/auth-helpers-react';
import React, { type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';

import { AuthForm } from './AuthForm';
import { StyledAuthButton, StyleLogOutIconButton } from './styled';

const AuthModalButton = () => {
  const { login, logout, register, authenticating } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const user = useUser();

  const handleClick = () => {
    if (!user?.id) {
      setOpen(true);
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
          startDecorator={user?.id ? null : <AccountCircleOutlinedIcon />}
          onClick={handleClick}
          {...(user?.id
            ? {
                component: Link,
                to: '/account',
              }
            : {})}
        >
          {user?.id ? 'Account' : 'Log In'}
        </StyledAuthButton>
        {user?.id && (
          <StyleLogOutIconButton onClick={() => logout()}>
            <LogoutRoundedIcon />
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
              <Tab value="login" disableIndicator sx={{ flex: '1 1 0%' }}>
                Log In
              </Tab>
              <Tab value="register" disableIndicator sx={{ flex: '1 1 0%' }}>
                Create Account
              </Tab>
            </TabList>
            <TabPanel value="login" sx={{ padding: '16px 0' }}>
              <AuthForm {...authFormProps} submitButtonLabel="Log In" />
            </TabPanel>
            <TabPanel value="register" sx={{ padding: '16px 0' }}>
              <AuthForm
                {...authFormProps}
                submitButtonLabel="Create AccountPage"
              />
            </TabPanel>
          </Tabs>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AuthModalButton;
