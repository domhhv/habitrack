import { useUserAccount } from '@context';
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
} from '@nextui-org/react';
import {
  SignOut as SignOutIcon,
  User as UserIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { Link } from 'react-router-dom';

import AuthForm from './AuthForm';

export type AuthMode = 'login' | 'register' | 'reset-password';

const AuthModalButton = () => {
  const {
    login,
    logout,
    register,
    resetPassword,
    authenticating,
    supabaseUser,
  } = useUserAccount();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
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
    login,
    register,
    'reset-password': resetPassword,
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

  const handleSubmit = async (
    email: string,
    password: string,
    name: string
  ) => {
    await actions[mode](email, password, name);

    handleClose();
  };

  const authFormProps = {
    mode,
    onModeChange: (nextMode: AuthMode) => setMode(nextMode),
    onSubmit: handleSubmit,
    onCancel: handleClose,
    disabled: authenticating,
    submitButtonLabel: actionLabels[mode],
  };

  return (
    <>
      {supabaseUser?.id ? (
        <ButtonGroup>
          <Button
            as={Link}
            to="/account"
            data-testid="auth-button"
            color="primary"
            startContent={<UserIcon data-testid="user-icon" weight="bold" />}
          >
            Account
          </Button>
          <Tooltip content="Log out">
            <Button
              onPress={() => logout()}
              isIconOnly
              color="primary"
              className="border-l"
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
