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
import { UserIcon, SignOutIcon } from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router';

import { Kbd } from '@components';
import { useScreenWidth, useFirstDayOfWeek } from '@hooks';
import type { DaysOfWeek } from '@models';
import { signIn, signUp, signOut, sendPasswordResetEmail } from '@services';
import { useUser } from '@stores';
import { getErrorMessage } from '@utils';

import AuthForm from './AuthForm';

type AuthMode = 'login' | 'register' | 'reset-password';

const AuthModalButton = () => {
  const user = useUser();
  const { screenWidth } = useScreenWidth();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const [authenticating, setAuthenticating] = React.useState(false);
  const [mode, setMode] = React.useState<AuthMode>('login');
  const firstDayOfWeek = useFirstDayOfWeek();

  const handleClose = () => {
    setMode('login');
    onClose();
  };

  const handleTabChange = (key: React.Key) => {
    setMode(key as 'login' | 'register');
  };

  const actions: Record<
    AuthMode,
    (
      email: string,
      password: string,
      name: string,
      firstDayOfWeek: DaysOfWeek
    ) => Promise<void>
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
    'reset-password': 'Password reset email sent!',
    register:
      'Account created! Please check your email to confirm your account before logging in.',
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

      await actions[mode](email, password, name, firstDayOfWeek);

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
            size="sm"
            to="/account"
            variant="solid"
            color="secondary"
            data-testid="auth-button"
            isIconOnly={screenWidth < 1024}
            startContent={<UserIcon weight="bold" data-testid="user-icon" />}
          >
            {screenWidth > 1024 && 'Account'}
          </Button>
          <Tooltip closeDelay={0} content="Log out">
            <Button
              size="sm"
              isIconOnly
              variant="solid"
              color="secondary"
              onPress={signOut}
              startContent={
                <SignOutIcon weight="bold" data-testid="sign-out-icon" />
              }
            >
              <VisuallyHidden>Log Out</VisuallyHidden>
            </Button>
          </Tooltip>
        </ButtonGroup>
      ) : (
        <Button
          size="sm"
          color="primary"
          onPress={onOpen}
          data-testid="auth-button"
        >
          <Kbd
            color="primary"
            shortcutParams={[
              'i',
              () => {
                if (!user?.id) {
                  onOpen();
                }
              },
            ]}
          >
            I
          </Kbd>
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
