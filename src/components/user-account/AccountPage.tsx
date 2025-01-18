import { Alert, PasswordInput } from '@components';
import { useDocumentTitle } from '@hooks';
import { Button, Input, Spinner } from '@nextui-org/react';
import React, { type FormEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { useAccountPage } from './use-account-page';
import { useAuthSearchParams } from './use-auth-search-params';

const AccountPage = () => {
  useAuthSearchParams();

  useDocumentTitle('My Account | Habitrack');

  const {
    user,
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

  const containerClassName =
    'w-full mt-8 flex flex-col items-center justify-center';

  if (!user && loading) {
    return (
      <div
        className={twMerge(containerClassName, 'pt-16')}
        data-testid="account-page"
      >
        <Spinner data-testid="loader" aria-label="Loading..." />
      </div>
    );
  }

  if (forbidden || (!user && !forbidden)) {
    return (
      <div
        className={twMerge(containerClassName, 'items-start pt-16')}
        data-testid="account-page"
      >
        <Alert message="Please log in to your account first" color="danger" />
      </div>
    );
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void updateAccount();
  };

  const isSubmitDisabled =
    name === user?.userMetadata.name && email === user?.email && !password;

  return (
    <div className="flex h-lvh w-full flex-col items-start self-start px-8 py-2 lg:px-16 lg:py-4">
      <div className={containerClassName} data-testid="account-page">
        <h1 className="text-xl font-semibold">Your Account Info</h1>
        <form
          className="mt-4 w-full md:w-96"
          onSubmit={handleSubmit}
          data-testid="account-form"
        >
          <div className="flex flex-col gap-2">
            <div>
              <Input
                isDisabled // TODO: Implement a flow for updating email
                variant="bordered"
                value={email}
                onChange={handleEmailChange}
                label="Email"
                data-testid="email-input"
                description="Updating an email is coming soon"
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
                isDisabled={isSubmitDisabled}
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
