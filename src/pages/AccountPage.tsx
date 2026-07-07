import {
  cn,
  Link,
  Tabs,
  Alert,
  Input,
  Label,
  Toast,
  Select,
  ListBox,
  TextField,
} from '@heroui/react';
import { PlugsIcon, ShieldIcon, UserCircleIcon } from '@phosphor-icons/react';
import type { UserAttributes } from '@supabase/supabase-js';
import type { SubmitEventHandler } from 'react';
import React from 'react';

import { CustomButton, PasswordInput, ConnectedAccounts } from '@components';
import { useTextField, useAuthSearchParams } from '@hooks';
import type { DaysOfWeek, ProfilesUpdate } from '@models';
import { useUser, useProfile, useUserActions } from '@stores';
import { getErrorMessage } from '@utils';

const AccountPage = () => {
  useAuthSearchParams();

  const user = useUser();
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

  const containerClassName = 'w-3xl mt-8 mx-auto flex flex-col';

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
      </div>
    );
  }

  const handleGeneralSubmit: SubmitEventHandler = async (e) => {
    e.preventDefault();

    const profileUpdatePayload: Pick<
      ProfilesUpdate,
      'name' | 'firstDayOfWeek' | 'defaultCurrency'
    > = {};

    if (firstDayOfWeek !== profile.firstDayOfWeek) {
      profileUpdatePayload.firstDayOfWeek = firstDayOfWeek;
    }

    if (name !== profile.name) {
      profileUpdatePayload.name = name;
    }

    if (defaultCurrency !== profile.defaultCurrency) {
      profileUpdatePayload.defaultCurrency = defaultCurrency;
    }

    if (!Object.keys(profileUpdatePayload).length) {
      return;
    }

    try {
      setIsUpdating(true);
      await updateProfile(profile.id, profileUpdatePayload);
      Toast.toast.success('Account updated');
    } catch (error) {
      Toast.toast.danger('Failed to update account', {
        description: getErrorMessage(error) || 'Please try again later',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSecuritySubmit: SubmitEventHandler = async (e) => {
    e.preventDefault();

    const userAttributes: UserAttributes = {};
    let hasUpdatedEmail = false;

    if (password) {
      userAttributes.password = password;
    }

    if (email !== profile.email) {
      userAttributes.email = email;
      hasUpdatedEmail = true;
    }

    if (!Object.keys(userAttributes).length) {
      return;
    }

    try {
      setIsUpdating(true);
      await updateUser(userAttributes);
      clearPassword();
      handleEmailChange(profile.email || '');
      Toast.toast.success('Account updated', {
        description: hasUpdatedEmail
          ? 'Email change requested. Please check your inbox for a confirmation email.'
          : undefined,
      });
    } catch (error) {
      Toast.toast.danger('Failed to update account', {
        description: getErrorMessage(error) || 'Please try again later',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex h-lvh w-full flex-col items-start self-start px-8 py-2 lg:px-16 lg:py-4">
      {title}
      <div
        data-testid="account-page"
        className={cn(containerClassName, 'justify-self-start')}
      >
        <h1 className="text-xl font-semibold">Your Account Settings</h1>
        {!!user?.isAnonymous && (
          <Alert status="warning" className="mt-4 w-full md:w-96">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title className="font-bold">
                You are browsing anonymously
              </Alert.Title>
              <Alert.Description>
                Your data is saved to a temporary account tied to this browser.{' '}
                <Link href="/register" className="text-accent font-medium">
                  Add an email and password
                </Link>{' '}
                to keep it forever and log in from any device.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        <Tabs
          variant="secondary"
          orientation="vertical"
          defaultSelectedKey="general"
          className="mt-4 w-full md:w-2xl"
        >
          <Tabs.ListContainer className="w-xs self-start">
            <Tabs.List className="w-full" aria-label="Account settings">
              <Tabs.Tab id="general" className="justify-start gap-2">
                <UserCircleIcon className="size-5" />
                General
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="security" className="justify-start gap-2">
                <ShieldIcon className="size-5" />
                Security
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="connected-accounts" className="justify-start gap-2">
                <PlugsIcon className="size-5" />
                Connected accounts
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="general" className="w-full py-0 pl-6">
            <form
              data-testid="general-form"
              onSubmit={handleGeneralSubmit}
              className="flex w-full flex-col gap-4"
            >
              <TextField
                value={name}
                variant="secondary"
                isDisabled={isUpdating}
                data-testid="name-input"
                onChange={handleNameChange}
              >
                <Label>Name</Label>
                <Input placeholder="Name" />
              </TextField>
              <Select
                variant="secondary"
                value={firstDayOfWeek}
                isDisabled={isUpdating}
                onChange={(value) => {
                  if (value === 'sun' || value === 'mon') {
                    setFirstDayOfWeek(value);
                  }
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
              <CustomButton
                fullWidth
                type="submit"
                className="mt-2"
                variant="primary"
                isDisabled={
                  isUpdating ||
                  (firstDayOfWeek === profile.firstDayOfWeek &&
                    name === profile.name &&
                    defaultCurrency === profile.defaultCurrency)
                }
              >
                Save
              </CustomButton>
            </form>
          </Tabs.Panel>
          <Tabs.Panel id="security" className="w-full py-0 pl-6">
            <form
              data-testid="security-form"
              onSubmit={handleSecuritySubmit}
              className="flex w-full flex-col gap-4"
            >
              <TextField
                value={email}
                variant="secondary"
                isDisabled={isUpdating}
                data-testid="email-input"
                onChange={handleEmailChange}
              >
                <Label>Email</Label>
                <Input placeholder="Email" />
              </TextField>
              <PasswordInput
                value={password}
                variant="secondary"
                isDisabled={isUpdating}
                testId="password-input"
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
              <CustomButton
                fullWidth
                type="submit"
                className="mt-2"
                variant="primary"
                isDisabled={
                  isUpdating || (email === profile.email && !password)
                }
              >
                Save
              </CustomButton>
            </form>
          </Tabs.Panel>
          <Tabs.Panel id="connected-accounts" className="w-full py-0 pl-6">
            <ConnectedAccounts />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountPage;
