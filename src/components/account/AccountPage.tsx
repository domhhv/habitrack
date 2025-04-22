import { PasswordInput } from '@components';
import { handleAsyncAction } from '@helpers';
import { Alert, Button, Input, Spinner } from '@heroui/react';
import { useTextField, useUser } from '@hooks';
import { updateUser } from '@services';
import { toEventLike } from '@utils';
import React, { type FormEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { useAuthSearchParams } from './use-auth-search-params';

const AccountPage = () => {
  useAuthSearchParams();

  const { isLoading: isLoadingUser, user } = useUser();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange] = useTextField();
  const [name, handleNameChange] = useTextField();

  React.useEffect(() => {
    handleEmailChange(toEventLike(user?.email));
    handleNameChange(toEventLike(user?.userMetadata.name || ''));
  }, [user, handleEmailChange, handleNameChange]);

  const title = <title>My Account | Habitrack</title>;

  const containerClassName =
    'w-full mt-8 flex flex-col items-center justify-center';

  if (!user && isLoadingUser) {
    return (
      <div className={twMerge(containerClassName, 'pt-16')}>
        {title}
        <Spinner data-testid="loader" aria-label="Loading..." />
      </div>
    );
  }

  if (!user && !isLoadingUser) {
    return (
      <div className={twMerge(containerClassName, 'items-start pt-16')}>
        {title}
        <Alert
          title="Please log in to your account first"
          color="danger"
          className="mx-auto w-96"
        />
      </div>
    );
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    void handleAsyncAction(
      updateUser(email, password, name),
      'update_account',
      setIsUpdating
    );
  };

  return (
    <div className="flex h-lvh w-full flex-col items-start self-start px-8 py-2 lg:px-16 lg:py-4">
      {title}
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
                isDisabled={isUpdating}
                testId="password-input"
              />
            </div>
            <div>
              <Input
                variant="bordered"
                value={name}
                onChange={handleNameChange}
                isDisabled={isUpdating}
                label="Name"
                data-testid="name-input"
              />
            </div>
            <div>
              <Button
                fullWidth
                type="submit"
                isLoading={isUpdating}
                color="primary"
                isDisabled={
                  name === user?.userMetadata.name &&
                  email === user?.email &&
                  !password
                }
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
