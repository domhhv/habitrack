import {
  Alert,
  Input,
  Button,
  Select,
  Spinner,
  SelectItem,
} from '@heroui/react';
import React, { type FormEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

import { PasswordInput } from '@components';
import { useUser, useTextField, useAuthSearchParams } from '@hooks';
import { updateUser } from '@services';
import { handleAsyncAction } from '@utils';

const AccountPage = () => {
  useAuthSearchParams();

  const { isLoading: isLoadingUser, user } = useUser();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange] = useTextField();
  const [name, handleNameChange] = useTextField();
  const [firstDayOfWeek, setFirstDayOfWeek] = React.useState('0');

  React.useEffect(() => {
    handleEmailChange(user?.email || '');
    handleNameChange(user?.userMetadata.name || '');
    setFirstDayOfWeek(user?.userMetadata.firstDayOfWeek?.toString() || '0');
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

    if (!user) {
      return;
    }

    const data: Record<string, string | number> = {};

    if (firstDayOfWeek !== user.userMetadata.firstDayOfWeek?.toString()) {
      data.firstDayOfWeek = Number(firstDayOfWeek);
    }

    if (email !== user.email) {
      data.email = email;
    }

    if (name !== user.userMetadata.name) {
      data.name = name;
    }

    if (password) {
      data.password = password;
    }

    if (Object.keys(data).length === 0) {
      return;
    }

    void handleAsyncAction(updateUser(data), 'update_account', setIsUpdating);
  };

  return (
    <div className="flex h-lvh w-full flex-col items-start self-start px-8 py-2 lg:px-16 lg:py-4">
      {title}
      <div data-testid="account-page" className={containerClassName}>
        <h1 className="text-xl font-semibold">Your Account Settings</h1>
        <form
          onSubmit={handleSubmit}
          data-testid="account-form"
          className="mt-4 w-full md:w-96"
        >
          <div className="flex flex-col gap-2">
            <Input
              isDisabled // TODO: Implement a flow for updating email
              value={email}
              label="Email"
              variant="bordered"
              data-testid="email-input"
              onChange={handleEmailChange}
              description="Updating an email is coming soon"
            />
            <PasswordInput
              value={password}
              variant="bordered"
              isDisabled={isUpdating}
              testId="password-input"
              label="Set new password"
              onChange={handlePasswordChange}
            />
            <Input
              value={name}
              label="Name"
              variant="bordered"
              isDisabled={isUpdating}
              data-testid="name-input"
              onChange={handleNameChange}
            />
            <Select
              variant="bordered"
              isDisabled={isUpdating}
              label="First day of the week"
              selectedKeys={[firstDayOfWeek]}
              data-testid="first-day-of-week-select"
              onSelectionChange={(value) => {
                const [newDay] = Array.from(value);

                if (typeof newDay === 'string') {
                  setFirstDayOfWeek(newDay);
                }
              }}
            >
              {[
                { key: '0', label: 'Sunday' },
                { key: '1', label: 'Monday' },
                { key: '2', label: 'Tuesday' },
                { key: '3', label: 'Wednesday' },
                { key: '4', label: 'Thursday' },
                { key: '5', label: 'Friday' },
                { key: '6', label: 'Saturday' },
              ].map((day) => {
                return <SelectItem key={day.key}>{day.label}</SelectItem>;
              })}
            </Select>
            <Button
              fullWidth
              type="submit"
              color="primary"
              isLoading={isUpdating}
              isDisabled={
                firstDayOfWeek ===
                  user?.userMetadata.firstDayOfWeek?.toString() &&
                name === user?.userMetadata.name &&
                email === user?.email &&
                !password
              }
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
