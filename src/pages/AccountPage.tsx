import { Alert, Input, Button, Spinner } from '@heroui/react';
import React, { type FormEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { PasswordInput } from '@components';
import { handleAsyncAction } from '@helpers';
import { useUser, useTextField, useAuthSearchParams } from '@hooks';
import { updateUser } from '@services';
import { toEventLike } from '@utils';

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
          color="danger"
          className="mx-auto w-96"
          title="Please log in to your account first"
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
      <div data-testid="account-page" className={containerClassName}>
        <h1 className="text-xl font-semibold">Your Account Info</h1>
        <form
          onSubmit={handleSubmit}
          data-testid="account-form"
          className="mt-4 w-full md:w-96"
        >
          <div className="flex flex-col gap-2">
            <div>
              <Input
                isDisabled // TODO: Implement a flow for updating email
                value={email}
                label="Email"
                variant="bordered"
                data-testid="email-input"
                onChange={handleEmailChange}
                description="Updating an email is coming soon"
              />
            </div>
            <div>
              <PasswordInput
                value={password}
                variant="bordered"
                isDisabled={isUpdating}
                testId="password-input"
                label="Set new password"
                onChange={handlePasswordChange}
              />
            </div>
            <div>
              <Input
                value={name}
                label="Name"
                variant="bordered"
                isDisabled={isUpdating}
                data-testid="name-input"
                onChange={handleNameChange}
              />
            </div>
            <div>
              <Button
                fullWidth
                type="submit"
                color="primary"
                isLoading={isUpdating}
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
