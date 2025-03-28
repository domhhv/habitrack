import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
  VisuallyHidden,
  Tooltip,
  addToast,
} from '@heroui/react';
import { useScreenWidth, useUser } from '@hooks';
import {
  SignOut as SignOutIcon,
  User as UserIcon,
} from '@phosphor-icons/react';
import { sendPasswordResetEmail, signIn, signOut, signUp } from '@services';
import { getErrorMessage } from '@utils';
import React from 'react';
import { Link } from 'react-router';

import AuthForm from './AuthForm';

export type AuthMode = 'login' | 'register' | 'reset-password';

const AuthModalButton = () => {
  const { user } = useUser();
  const { screenWidth } = useScreenWidth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
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
        title: successfulMessages[mode],
        color: 'success',
      });
    } catch (error) {
      addToast({
        title: errorMessages[mode],
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
      });
    } finally {
      setAuthenticating(false);
    }
  };

  const authFormProps = {
    mode,
    onModeChange: (nextMode: AuthMode) => {
      return setMode(nextMode);
    },
    onSubmit: handleSubmit,
    onCancel: handleClose,
    disabled: authenticating,
    submitButtonLabel: actionLabels[mode],
    goBackToLogin: () => {
      return setMode('login');
    },
  };

  return (
    <>
      {user?.id ? (
        <ButtonGroup size={screenWidth > 1024 ? 'md' : 'sm'}>
          <Button
            color="secondary"
            isIconOnly={screenWidth < 1024}
            as={Link}
            to="/account"
            data-testid="auth-button"
            startContent={<UserIcon data-testid="user-icon" weight="bold" />}
          >
            {screenWidth > 1024 && 'Account'}
          </Button>
          <Tooltip content="Log out">
            <Button
              color="secondary"
              onPress={signOut}
              isIconOnly
              className="border-l border-background-100 dark:border-background-900"
              startContent={
                <SignOutIcon data-testid="sign-out-icon" weight="bold" />
              }
            >
              <VisuallyHidden>Log Out</VisuallyHidden>
            </Button>
          </Tooltip>
        </ButtonGroup>
      ) : (
        <Button onPress={onOpen} data-testid="auth-button" color="primary">
          Log In
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={handleClose} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{headerTitles[mode]}</ModalHeader>
          <ModalBody>
            {mode !== 'reset-password' && (
              <Tabs
                onSelectionChange={handleTabChange}
                color="primary"
                fullWidth
              >
                <Tab isDisabled={authenticating} key="login" title="Login">
                  <AuthForm {...authFormProps} />
                </Tab>
                <Tab
                  isDisabled={authenticating}
                  key="register"
                  title="Register"
                >
                  <AuthForm {...authFormProps} />
                </Tab>
              </Tabs>
            )}
            {mode === 'reset-password' && <AuthForm {...authFormProps} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModalButton;
