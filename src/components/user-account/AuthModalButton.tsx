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

const AuthModalButton = () => {
  const { login, logout, register, authenticating, supabaseUser } =
    useUserAccount();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');

  const handleClose = () => {
    setMode('login');
    onClose();
  };

  const handleTabChange = (key: React.Key) => {
    setMode(key as 'login' | 'register');
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
          <ModalHeader>{`${actionLabel} with a username and a password`}</ModalHeader>
          <ModalBody>
            <Tabs
              onSelectionChange={handleTabChange}
              radius="full"
              color="primary"
              fullWidth
            >
              <Tab disabled={authenticating} key="login" title="Login">
                <AuthForm {...authFormProps} submitButtonLabel="Log In" />
              </Tab>
              <Tab disabled={authenticating} key="register" title="Register">
                <AuthForm
                  {...authFormProps}
                  submitButtonLabel="Create Account"
                />
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModalButton;
