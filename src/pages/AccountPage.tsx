import {
  cn,
  Alert,
  Input,
  Label,
  Button,
  Select,
  ListBox,
} from '@heroui/react';
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
  const [defaultCurrency, setDefaultCurrency] = React.useState('EUR');
  const [firstDayOfWeek, setFirstDayOfWeek] = React.useState<DaysOfWeek>('mon');

  React.useEffect(() => {
    handleEmailChange(profile?.email || '');
    handleNameChange(profile?.name || '');
    setFirstDayOfWeek(profile?.firstDayOfWeek || 'mon');
    setDefaultCurrency(profile?.defaultCurrency || 'EUR');
  }, [profile, handleEmailChange, handleNameChange]);

  const title = <title>My Account | Habitrack</title>;

  const containerClassName =
    'w-full mt-8 flex flex-col items-center justify-center';

  if (!profile) {
    return (
      <div className={cn(containerClassName, 'items-start pt-16')}>
        {title}
        <Alert status="danger" className="mx-auto w-96">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="font-bold">
              Please log in to your account first
            </Alert.Title>
          </Alert.Content>
        </Alert>
        e
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
        'email' | 'name' | 'firstDayOfWeek' | 'defaultCurrency'
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

      if (defaultCurrency !== profile.defaultCurrency) {
        profileUpdatePayload.defaultCurrency = defaultCurrency;
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
              disabled
              value={email}
              placeholder="Email"
              variant="secondary"
              data-testid="email-input"
              onChange={handleEmailChange}
            />
            <PasswordInput
              label="Password"
              value={password}
              variant="secondary"
              isDisabled={isUpdating}
              testId="password-input"
              onChange={handlePasswordChange}
            />
            <Input
              value={name}
              placeholder="Name"
              variant="secondary"
              disabled={isUpdating}
              data-testid="name-input"
              onChange={handleNameChange}
            />
            <Select
              variant="secondary"
              value={firstDayOfWeek}
              isDisabled={isUpdating}
              onChange={(value) => {
                const newDay = value as DaysOfWeek;
                setFirstDayOfWeek(newDay);
              }}
            >
              <Label>Start week on</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {[
                    { key: 'sun', label: 'Sunday' },
                    { key: 'mon', label: 'Monday' },
                  ].map((day) => {
                    return (
                      <ListBox.Item
                        id={day.key}
                        key={day.key}
                        textValue={day.label}
                      >
                        <Label>{day.label}</Label>
                      </ListBox.Item>
                    );
                  })}
                </ListBox>
              </Select.Popover>
            </Select>
            <Select
              variant="secondary"
              isDisabled={isUpdating}
              value={defaultCurrency}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setDefaultCurrency(value);
                }
              }}
            >
              <Label>Default currency</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {[
                    { key: 'EUR', label: 'EUR' },
                    { key: 'USD', label: 'USD' },
                    { key: 'GBP', label: 'GBP' },
                    { key: 'UAH', label: 'UAH' },
                  ].map((currency) => {
                    return (
                      <ListBox.Item
                        id={currency.key}
                        key={currency.key}
                        textValue={currency.label}
                      >
                        <Label>{currency.label}</Label>
                      </ListBox.Item>
                    );
                  })}
                </ListBox>
              </Select.Popover>
            </Select>
            <Button
              fullWidth
              type="submit"
              variant="primary"
              isDisabled={
                isUpdating ||
                (firstDayOfWeek === profile.firstDayOfWeek &&
                  name === profile.name &&
                  email === profile.email &&
                  defaultCurrency === profile.defaultCurrency &&
                  !password)
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
