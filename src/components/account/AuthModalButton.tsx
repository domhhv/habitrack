import {
  Tabs,
  Modal,
  Toast,
  Button,
  Tooltip,
  ButtonGroup,
  useOverlayState,
} from '@heroui/react';
import { UserIcon, SignOutIcon } from '@phosphor-icons/react';
import React from 'react';
import { VisuallyHidden } from 'react-aria';
import { useNavigate } from 'react-router';

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
  const navigate = useNavigate();
  const { screenWidth } = useScreenWidth();
  const overlayState = useOverlayState();
  const [authenticating, setAuthenticating] = React.useState(false);
  const [mode, setMode] = React.useState<AuthMode>('login');
  const firstDayOfWeek = useFirstDayOfWeek();

  const handleClose = () => {
    setMode('login');
    overlayState.close();
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

      Toast.toast.success(successfulMessages[mode]);
    } catch (error) {
      Toast.toast.danger(errorMessages[mode], {
        description: `Error details: ${getErrorMessage(error)}`,
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
            size="sm"
            variant="secondary"
            data-testid="auth-button"
            isIconOnly={screenWidth < 1024}
            onPress={() => {
              navigate('/account');
            }}
          >
            <UserIcon weight="bold" data-testid="user-icon" />
            {screenWidth > 1024 && 'Account'}
          </Button>
          <Tooltip closeDelay={0}>
            <Tooltip.Trigger>
              <Button
                size="sm"
                isIconOnly
                onPress={signOut}
                variant="secondary"
              >
                <SignOutIcon weight="bold" data-testid="sign-out-icon" />
                <VisuallyHidden>Log Out</VisuallyHidden>
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Log out</Tooltip.Content>
          </Tooltip>
        </ButtonGroup>
      ) : (
        <Button
          size="sm"
          variant="primary"
          data-testid="auth-button"
          onPress={overlayState.open}
        >
          <Kbd
            color="primary"
            shortcutParams={[
              'i',
              () => {
                if (!user?.id) {
                  overlayState.open();
                }
              },
            ]}
          >
            I
          </Kbd>
          Log In
        </Button>
      )}
      <Modal state={overlayState}>
        <Modal.Backdrop
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
        >
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>{headerTitles[mode]}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {mode === 'reset-password' ? (
                  <AuthForm {...authFormProps} />
                ) : (
                  <Tabs className="w-full" onSelectionChange={handleTabChange}>
                    <Tabs.ListContainer>
                      <Tabs.List aria-label="Auth mode">
                        <Tabs.Tab id="login" isDisabled={authenticating}>
                          Login
                          <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id="register" isDisabled={authenticating}>
                          <Tabs.Separator />
                          Register
                          <Tabs.Indicator />
                        </Tabs.Tab>
                      </Tabs.List>
                    </Tabs.ListContainer>
                    <Tabs.Panel id="login">
                      <AuthForm {...authFormProps} />
                    </Tabs.Panel>
                    <Tabs.Panel id="register">
                      <AuthForm {...authFormProps} />
                    </Tabs.Panel>
                  </Tabs>
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default AuthModalButton;
