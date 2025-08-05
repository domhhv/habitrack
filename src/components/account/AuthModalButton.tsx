import {
  Tab,
  Tabs,
  Modal,
  Button,
  Tooltip,
  addToast,
  ModalBody,
  ButtonGroup,
  ModalHeader,
  ModalContent,
  useDisclosure,
  VisuallyHidden,
} from '@heroui/react';
import {
  User as UserIcon,
  SignOut as SignOutIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router';

import { useUser, useScreenWidth } from '@hooks';
import { signIn, signUp, signOut, sendPasswordResetEmail } from '@services';
import { getErrorMessage } from '@utils';

import AuthForm from './AuthForm';

type AuthMode = 'login' | 'register' | 'reset-password';

const AuthModalButton = () => {
  const { user } = useUser();
  const { screenWidth } = useScreenWidth();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const [authenticating, setAuthenticating] = React.useState(false);
  const [mode, setMode] = React.useState<AuthMode>('login');

  const handleClose = () => {
    setMode('login');
    onClose();
  };

  const handleTabChange = (key: React.Key) => {
    setMode(key as 'login' | 'register');
  };

  const actions: Record<
    AuthMode,
    (email: string, password: string, name: string) => Promise<void>
  > = {
    login: signIn,
    register: signUp,
    'reset-password': sendPasswordResetEmail,
  };

  const actionLabels: Record<AuthMode, string> = {
    login: 'Log in',
    register: 'Create account',
    'reset-password': 'Send link',
  };

  const headerTitles: Record<AuthMode, string> = {
    login: 'Log in with an email and a password',
    register: 'Register with an email and a password',
    'reset-password': 'Reset your password',
  };

  const successfulMessages: Record<AuthMode, string> = {
    login: 'Welcome back!',
    register: 'Account created!',
    'reset-password': 'Password reset email sent!',
  };

  const errorMessages: Record<AuthMode, string> = {
    login: 'Something went wrong while logging in. Please try again.',
    register:
      'Something went wrong while creating your account. Please try again.',
    'reset-password':
      'Something went wrong while sending the reset password email. Please try again.',
  };

  const handleSubmit = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      setAuthenticating(true);

      await actions[mode](email, password, name);

      setAuthenticating(false);

      handleClose();

      addToast({
        color: 'success',
        title: successfulMessages[mode],
      });
    } catch (error) {
      addToast({
        color: 'danger',
        description: `Error details: ${getErrorMessage(error)}`,
        title: errorMessages[mode],
      });
    } finally {
      setAuthenticating(false);
    }
  };

  const authFormProps = {
    isDisabled: authenticating,
    mode,
    onCancel: handleClose,
    onSubmit: handleSubmit,
    submitButtonLabel: actionLabels[mode],
    goBackToLogin: () => {
      return setMode('login');
    },
    onModeChange: (nextMode: AuthMode) => {
      return setMode(nextMode);
    },
  };

  return (
    <>
      {user?.id ? (
        <ButtonGroup size={screenWidth > 1024 ? 'md' : 'sm'}>
          <Button
            as={Link}
            to="/account"
            color="secondary"
            data-testid="auth-button"
            isIconOnly={screenWidth < 1024}
            startContent={<UserIcon weight="bold" data-testid="user-icon" />}
          >
            {screenWidth > 1024 && 'Account'}
          </Button>
          <Tooltip content="Log out">
            <Button
              isIconOnly
              color="secondary"
              onPress={signOut}
              className="border-background-100 dark:border-background-900 border-l"
              startContent={
                <SignOutIcon weight="bold" data-testid="sign-out-icon" />
              }
            >
              <VisuallyHidden>Log Out</VisuallyHidden>
            </Button>
          </Tooltip>
        </ButtonGroup>
      ) : (
        <Button color="primary" onPress={onOpen} data-testid="auth-button">
          Log In
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={handleClose} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{headerTitles[mode]}</ModalHeader>
          <ModalBody>
            {mode === 'reset-password' ? (
              <AuthForm {...authFormProps} />
            ) : (
              <Tabs
                fullWidth
                color="primary"
                onSelectionChange={handleTabChange}
              >
                <Tab key="login" title="Login" isDisabled={authenticating}>
                  <AuthForm {...authFormProps} />
                </Tab>
                <Tab
                  key="register"
                  title="Register"
                  isDisabled={authenticating}
                >
                  <AuthForm {...authFormProps} />
                </Tab>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModalButton;
