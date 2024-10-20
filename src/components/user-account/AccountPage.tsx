import { AuthModalButton, PasswordInput } from '@components';
import { useDocumentTitle } from '@hooks';
import { Button, Input, Spinner } from '@nextui-org/react';
import { Prohibit as ProhibitIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import React, { type FormEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { useAccountPage } from './use-account-page';
import { useAuthSearchParams } from './use-auth-search-params';

const AccountPage = () => {
  useAuthSearchParams();

  useDocumentTitle('My Account | Habitrack');

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
          className="flex items-center gap-4 rounded-md bg-neutral-100 p-4 dark:bg-neutral-800"
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
                isDisabled={loading}
                label="Email"
                data-testid="email-input"
              />
            </div>
            <div>
              <PasswordInput
                variant="bordered"
                value={password}
                onChange={handlePasswordChange}
                label="Set new password"
                isDisabled={loading}
                testId="password-input"
              />
            </div>
            <div>
              <Input
                variant="bordered"
                value={name}
                onChange={handleNameChange}
                isDisabled={loading}
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
                Submit
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
