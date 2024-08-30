import { AuthModalButton } from '@components';
import { Button, Input, Spinner } from '@nextui-org/react';
import { Prohibit as ProhibitIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import React, { type FormEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { useAccountPage } from './use-account-page';
import { useEmailConfirmed } from './use-email-confirmed';

const AccountPage = () => {
  const {
    loading,
    forbidden,
    email,
    handleEmailChange,
    password,
    handlePasswordChange,
    name,
    handleNameChange,
    updateAccount,
  } = useAccountPage();

  useEmailConfirmed();

  React.useEffect(() => {
    document.title = 'My Account | Habitrack';
  }, []);

  const containerClassName = clsx(
    'mx-auto flex flex-col items-center justify-center'
  );

  if (loading) {
    return (
      <div className={containerClassName} data-testid="account-page">
        <Spinner data-testid="loader" aria-label="Loading..." />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div
        className={twMerge(containerClassName, 'items-start pt-16')}
        data-testid="account-page"
      >
        <div
          className="flex items-center gap-4 rounded-md bg-white p-4 dark:bg-black"
          data-testid="alert"
        >
          <ProhibitIcon size={24} weight="bold" />
          <h4 className="font-semibold">Please log in to your account first</h4>
          <AuthModalButton />
        </div>
      </div>
    );
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void updateAccount();
  };

  return (
    <div className="flex w-full flex-col items-start justify-center self-start pt-16">
      <div className={containerClassName} data-testid="account-page">
        <h1 className="text-xl font-semibold">Your Account Info</h1>
        <form
          className="mt-4 w-[400px]"
          onSubmit={handleSubmit}
          data-testid="account-form"
        >
          <div className="flex flex-col gap-2">
            <div>
              <Input
                variant="bordered"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                label="Email"
                data-testid="email-input"
              />
            </div>
            <div>
              <Input
                variant="bordered"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                label="Set new password"
                data-testid="password-input"
              />
            </div>
            <div>
              <Input
                variant="bordered"
                value={name}
                onChange={handleNameChange}
                disabled={loading}
                label="Name"
                data-testid="name-input"
              />
            </div>
            <div>
              <Button
                fullWidth
                type="submit"
                isLoading={loading}
                color="primary"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
