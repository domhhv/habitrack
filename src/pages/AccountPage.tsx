import { cn, Alert, Input, Button, Select, SelectItem } from '@heroui/react';
import type { UserAttributes } from '@supabase/supabase-js';
import type { SubmitEventHandler } from 'react';
import React from 'react';

import { PasswordInput } from '@components';
import { useTextField, useAuthSearchParams } from '@hooks';
import type { DaysOfWeek, ProfilesUpdate } from '@models';
import { useProfile, useUserActions } from '@stores';
import { handleAsyncAction } from '@utils';

const AccountPage = () => {
  useAuthSearchParams();

  const profile = useProfile();
  const { updateProfile, updateUser } = useUserActions();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange, clearPassword] = useTextField();
  const [name, handleNameChange] = useTextField();
  const [firstDayOfWeek, setFirstDayOfWeek] = React.useState<DaysOfWeek>('mon');

  React.useEffect(() => {
    handleEmailChange(profile?.email || '');
    handleNameChange(profile?.name || '');
    setFirstDayOfWeek(profile?.firstDayOfWeek || 'mon');
  }, [profile, handleEmailChange, handleNameChange]);

  const title = <title>My Account | Habitrack</title>;

  const containerClassName =
    'w-full mt-8 flex flex-col items-center justify-center';

  if (!profile) {
    return (
      <div className={cn(containerClassName, 'items-start pt-16')}>
        {title}
        <Alert
          color="danger"
          className="mx-auto w-96"
          title="Please log in to your account first"
        />
      </div>
    );
  }

  const handleSubmit: SubmitEventHandler = (e) => {
    e.preventDefault();

    const updateUserData = async () => {
      const promises = [];
      const userAttributes: UserAttributes = {};
      const profileUpdatePayload: Pick<
        ProfilesUpdate,
        'email' | 'name' | 'firstDayOfWeek'
      > = {};

      if (password) {
        userAttributes.password = password;
      }

      if (email !== profile.email) {
        userAttributes.email = email;
        profileUpdatePayload.email = email;
      }

      if (firstDayOfWeek !== profile.firstDayOfWeek) {
        profileUpdatePayload.firstDayOfWeek = firstDayOfWeek;
      }

      if (name !== profile.name) {
        profileUpdatePayload.name = name;
      }

      if (Object.keys(profileUpdatePayload).length) {
        promises.push(updateProfile(profile.id, profileUpdatePayload));
      }

      if (Object.keys(userAttributes).length) {
        promises.push(updateUser(userAttributes));
      }

      await Promise.all(promises);
    };

    handleAsyncAction(updateUserData(), 'update_account', setIsUpdating).then(
      clearPassword
    );
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
              label="Start week on"
              isDisabled={isUpdating}
              selectedKeys={[firstDayOfWeek]}
              onSelectionChange={(value) => {
                const [newDay] = Array.from(value);

                setFirstDayOfWeek(newDay as DaysOfWeek);
              }}
            >
              {[
                { key: 'sun', label: 'Sunday' },
                { key: 'mon', label: 'Monday' },
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
                firstDayOfWeek === profile.firstDayOfWeek &&
                name === profile.name &&
                email === profile.email &&
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
