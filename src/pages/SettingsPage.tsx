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
import { data, redirect, useFetcher } from 'react-router';

import { CustomButton, PasswordInput, ConnectedAccounts } from '@components';
import { useUser, useProfile, useTextField, useAuthSearchParams } from '@hooks';
import type { DaysOfWeek, ProfilesUpdate, TypedSupabaseClient } from '@models';
import {
  deleteUser,
  updateUser,
  patchProfile,
  unlinkIdentity,
  getUserIdentities,
  linkGoogleIdentity,
} from '@services';
import { useConfirmationActions } from '@stores';
import {
  rollbar,
  userContext,
  parseDayOfWeek,
  getErrorMessage,
  supabaseContext,
  type SessionUser,
} from '@utils';

import type { Route } from './+types/SettingsPage';

const FAILURE_TITLES = {
  'delete-account': 'Failed to delete account',
  'link-identity': 'Failed to link Google account',
  'sync-email': 'Something went wrong when updating your email',
  'unlink-identity': 'Failed to unlink Google account',
  'update-profile': 'Failed to update account',
  'update-user': 'Failed to update account',
};

type SettingsIntent = keyof typeof FAILURE_TITLES;

const isSettingsIntent = (
  value: FormDataEntryValue | null
): value is SettingsIntent => {
  return typeof value === 'string' && Object.hasOwn(FAILURE_TITLES, value);
};

const getProfileUpdate = (formData: FormData) => {
  const profileUpdate: Pick<
    ProfilesUpdate,
    'name' | 'firstDayOfWeek' | 'defaultCurrency'
  > = {};
  const name = formData.get('name');
  const defaultCurrency = formData.get('defaultCurrency');

  if (typeof name === 'string') {
    profileUpdate.name = name;
  }

  if (formData.has('firstDayOfWeek')) {
    profileUpdate.firstDayOfWeek = parseDayOfWeek(
      formData.get('firstDayOfWeek')
    );
  }

  if (typeof defaultCurrency === 'string') {
    profileUpdate.defaultCurrency = defaultCurrency;
  }

  return profileUpdate;
};

const getUserAttributes = (formData: FormData) => {
  const userAttributes: UserAttributes = {};
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email === 'string') {
    userAttributes.email = email;
  }

  if (typeof password === 'string') {
    userAttributes.password = password;
  }

  return userAttributes;
};

const runIntent = async (
  supabase: TypedSupabaseClient,
  intent: SettingsIntent,
  formData: FormData,
  user: NonNullable<SessionUser>
) => {
  switch (intent) {
    case 'delete-account':
      await deleteUser(supabase);
      Toast.toast.success('Account deleted');

      return redirect('/login');

    case 'link-identity':
      await linkGoogleIdentity(supabase);
      break;

    case 'sync-email':
      await patchProfile(supabase, user.id, { email: user.email });
      Toast.toast.success('Your email change has been confirmed', {
        description: `Your email has been set as ${user.email}`,
      });
      break;

    case 'unlink-identity': {
      const identity = (await getUserIdentities(supabase)).find(
        ({ identity_id }) => {
          return identity_id === formData.get('identityId');
        }
      );

      if (!identity) {
        throw new Error('This account is no longer connected');
      }

      await unlinkIdentity(supabase, identity);
      Toast.toast.success('Google account unlinked');
      break;
    }

    case 'update-profile':
      await patchProfile(supabase, user.id, getProfileUpdate(formData));
      Toast.toast.success('Account updated');
      break;

    case 'update-user':
      await updateUser(supabase, getUserAttributes(formData));
      Toast.toast.success('Account updated', {
        description: formData.has('email')
          ? 'Email change requested. Please check your inbox for a confirmation email.'
          : undefined,
      });
      break;
  }

  return { intent, ok: true as const };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  if (!context.get(userContext)) {
    return { identities: [], identitiesError: null };
  }

  try {
    return {
      identities: await getUserIdentities(context.get(supabaseContext)),
      identitiesError: null,
    };
  } catch (error) {
    return { identities: [], identitiesError: getErrorMessage(error) };
  }
};

export const clientAction = async ({
  context,
  request,
}: Route.ClientActionArgs) => {
  const user = context.get(userContext);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (!user || !isSettingsIntent(intent)) {
    return data(
      { error: 'Unsupported settings request', intent: null, ok: false },
      { status: 400 }
    );
  }

  try {
    return await runIntent(
      context.get(supabaseContext),
      intent,
      formData,
      user
    );
  } catch (error) {
    if (intent === 'sync-email') {
      rollbar.error(
        'Failed to update profile with new email',
        error instanceof Error ? error : new Error(getErrorMessage(error))
      );
    }

    Toast.toast.danger(FAILURE_TITLES[intent], {
      description: getErrorMessage(error) || 'Please try again later',
    });

    return data(
      { error: getErrorMessage(error), intent, ok: false },
      { status: 400 }
    );
  }
};

const SettingsPage = ({
  loaderData: { identities, identitiesError },
}: Route.ComponentProps) => {
  useAuthSearchParams();

  const user = useUser();
  const profile = useProfile();
  const fetcher = useFetcher<typeof clientAction>();
  const { askConfirmation } = useConfirmationActions();
  const [email, handleEmailChange] = useTextField();
  const [password, handlePasswordChange, clearPassword] = useTextField();
  const [name, handleNameChange] = useTextField();
  const [defaultCurrency, setDefaultCurrency] = React.useState('EUR');
  const [firstDayOfWeek, setFirstDayOfWeek] = React.useState<DaysOfWeek>('mon');
  const isUpdating = fetcher.state !== 'idle';

  React.useEffect(() => {
    handleEmailChange(profile?.email || '');
    handleNameChange(profile?.name || '');
    setFirstDayOfWeek(profile?.firstDayOfWeek || 'mon');
    setDefaultCurrency(profile?.defaultCurrency || 'EUR');
  }, [profile, handleEmailChange, handleNameChange]);

  React.useEffect(() => {
    if (
      fetcher.state === 'idle' &&
      fetcher.data?.ok &&
      fetcher.data.intent === 'update-user'
    ) {
      clearPassword();
    }
  }, [fetcher.state, fetcher.data, clearPassword]);

  const title = <title>Settings | Habitrack</title>;

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

  const handleGeneralSubmit: SubmitEventHandler = (e) => {
    e.preventDefault();

    const profileUpdatePayload: Record<string, string> = {};

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

    void fetcher.submit(
      { intent: 'update-profile', ...profileUpdatePayload },
      { method: 'post' }
    );
  };

  const handleSecuritySubmit: SubmitEventHandler = (e) => {
    e.preventDefault();

    const userAttributesPayload: Record<string, string> = {};

    if (password) {
      userAttributesPayload.password = password;
    }

    if (email !== profile.email) {
      userAttributesPayload.email = email;
    }

    if (!Object.keys(userAttributesPayload).length) {
      return;
    }

    void fetcher.submit(
      { intent: 'update-user', ...userAttributesPayload },
      { method: 'post' }
    );
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      return;
    }

    const confirmed = await askConfirmation({
      confirmText: 'Delete account',
      title: 'Delete your account?',
      description:
        'This will permanently delete your account and all data connected to it. This action cannot be undone.',
    });

    if (confirmed) {
      void fetcher.submit({ intent: 'delete-account' }, { method: 'post' });
    }
  };

  return (
    <div className="flex h-lvh w-full flex-col items-start self-start px-8 py-2 lg:px-16 lg:py-4">
      {title}
      <div
        data-testid="settings-page"
        className={cn(containerClassName, 'justify-self-start')}
      >
        <h1 className="text-xl font-semibold">Settings</h1>
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
                autoComplete="new-password"
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
            <div className="border-danger/30 mt-8 flex w-full flex-col gap-3 border-t pt-6">
              <h2 className="text-danger text-base font-semibold">
                Delete account
              </h2>
              <p className="text-foreground-500 text-sm">
                Permanently delete your account and all associated data.
              </p>
              <CustomButton
                fullWidth
                variant="danger"
                isDisabled={isUpdating}
                onPress={handleDeleteAccount}
              >
                Delete account
              </CustomButton>
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="connected-accounts" className="w-full py-0 pl-6">
            <ConnectedAccounts
              identities={identities}
              loadError={identitiesError}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
