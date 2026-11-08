import {
  cn,
  Link,
  Tabs,
  Alert,
  Input,
  Label,
  Select,
  ListBox,
  TextField,
  FieldError,
} from '@heroui/react';
import { PlugsIcon, ShieldIcon, UserCircleIcon } from '@phosphor-icons/react';
import type { UserAttributes } from '@supabase/supabase-js';
import React from 'react';
import { data, href } from 'react-router';

import {
  ActionForm,
  CustomButton,
  PasswordInput,
  ConnectedAccounts,
} from '@components';
import { CURRENCIES, DAYS_OF_WEEK } from '@const';
import {
  useUser,
  useProfile,
  useTextField,
  useActionFetcher,
  useAuthSearchParams,
} from '@hooks';
import type {
  DaysOfWeek,
  FieldErrors,
  ActionToast,
  ActionResult,
  ProfilesUpdate,
  TypedSupabaseClient,
} from '@models';
import {
  deleteUser,
  updateUser,
  patchProfile,
  unlinkIdentity,
  getUserIdentities,
} from '@services';
import { useConfirmationActions } from '@stores';
import {
  getFormText,
  userContext,
  failValidation,
  getErrorMessage,
  supabaseContext,
  type SessionUser,
  assertValidFields,
  redirectWithToasts,
  FieldValidationError,
} from '@utils';

import type { Route } from './+types/SettingsPage';

const FAILURE_TITLES = {
  'delete-account': 'Failed to delete account',
  'sync-email': 'Something went wrong when updating your email',
  'unlink-identity': 'Failed to unlink Google account',
  'update-profile': 'Failed to update account',
  'update-user': 'Failed to update account',
};

type SettingsIntent = keyof typeof FAILURE_TITLES;

type SettingsActionResult = ActionResult & { intent?: SettingsIntent | null };

const isSettingsIntent = (
  value: FormDataEntryValue | null
): value is SettingsIntent => {
  return typeof value === 'string' && Object.hasOwn(FAILURE_TITLES, value);
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const getProfileUpdate = (formData: FormData) => {
  const fieldErrors: FieldErrors = {};
  const profileUpdate: Pick<
    ProfilesUpdate,
    'name' | 'firstDayOfWeek' | 'defaultCurrency'
  > = {};

  if (formData.has('name')) {
    profileUpdate.name = getFormText(formData, 'name');
  }

  if (formData.has('firstDayOfWeek')) {
    const firstDayOfWeek = DAYS_OF_WEEK.find((day) => {
      return day === formData.get('firstDayOfWeek');
    });

    if (firstDayOfWeek) {
      profileUpdate.firstDayOfWeek = firstDayOfWeek;
    } else {
      fieldErrors.firstDayOfWeek = 'Choose Sunday or Monday';
    }
  }

  if (formData.has('defaultCurrency')) {
    const defaultCurrency = CURRENCIES.find((currency) => {
      return currency === formData.get('defaultCurrency');
    });

    if (defaultCurrency) {
      profileUpdate.defaultCurrency = defaultCurrency;
    } else {
      fieldErrors.defaultCurrency = 'Choose one of the listed currencies';
    }
  }

  assertValidFields(fieldErrors);

  return profileUpdate;
};

/**
 * Only the attributes that change are sent, so an unchanged email doesn't start an email change.
 */
const getUserAttributes = (
  formData: FormData,
  user: NonNullable<SessionUser>
) => {
  const fieldErrors: FieldErrors = {};
  const userAttributes: UserAttributes = {};
  const password = formData.get('password');

  if (formData.has('email')) {
    const email = getFormText(formData, 'email');

    if (!EMAIL_PATTERN.test(email)) {
      fieldErrors.email = 'Enter a valid email address';
    } else if (email !== user.email) {
      userAttributes.email = email;
    }
  }

  if (typeof password === 'string' && password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      fieldErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    } else {
      userAttributes.password = password;
    }
  }

  assertValidFields(fieldErrors);

  return userAttributes;
};

const runIntent = async (
  supabase: TypedSupabaseClient,
  intent: SettingsIntent,
  request: Request,
  formData: FormData,
  user: NonNullable<SessionUser>
): Promise<ActionToast | Response | null> => {
  switch (intent) {
    case 'delete-account':
      await deleteUser(supabase);

      return redirectWithToasts(href('/login'), [
        { title: 'Account deleted', variant: 'success' },
      ]);

    case 'sync-email':
      await patchProfile(supabase, user.id, { email: user.email });

      return {
        description: `Your email has been set as ${user.email}`,
        title: 'Your email change has been confirmed',
        variant: 'success',
      };

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

      return { title: 'Google account unlinked', variant: 'success' };
    }

    case 'update-profile':
      await patchProfile(supabase, user.id, getProfileUpdate(formData));

      return { title: 'Account updated', variant: 'success' };

    case 'update-user': {
      const userAttributes = getUserAttributes(formData, user);

      if (Object.keys(userAttributes).length === 0) {
        return null;
      }

      await updateUser(supabase, new URL(request.url).origin, userAttributes);

      return {
        title: 'Account updated',
        variant: 'success',
        description: userAttributes.email
          ? 'Email change requested. Please check your inbox for a confirmation email.'
          : undefined,
      };
    }
  }
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

export const action = async ({ context, request }: Route.ActionArgs) => {
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
    const result = await runIntent(
      context.get(supabaseContext),
      intent,
      request,
      formData,
      user
    );

    if (result instanceof Response) {
      return result;
    }

    return {
      intent,
      ok: true as const,
      toasts: result ? [result] : [],
    };
  } catch (error) {
    if (error instanceof FieldValidationError) {
      return failValidation(error.fieldErrors);
    }

    console.error(error);

    const toast: ActionToast = {
      description: getErrorMessage(error) || 'Please try again later',
      title: FAILURE_TITLES[intent],
      variant: 'danger',
    };

    return data(
      { error: getErrorMessage(error), intent, ok: false, toasts: [toast] },
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
  const fetcher = useActionFetcher<SettingsActionResult>();
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
                <Link
                  href={href('/register')}
                  className="text-accent font-medium"
                >
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
            <ActionForm
              fetcher={fetcher}
              action={href('/settings')}
              data-testid="general-form"
              className="flex w-full flex-col gap-4"
            >
              <input type="hidden" name="intent" value="update-profile" />
              <TextField
                name="name"
                value={name}
                variant="secondary"
                isDisabled={isUpdating}
                data-testid="name-input"
                onChange={handleNameChange}
              >
                <Label>Name</Label>
                <Input placeholder="Name" />
                <FieldError />
              </TextField>
              <Select
                variant="secondary"
                name="firstDayOfWeek"
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
                <FieldError />
              </Select>
              <Select
                variant="secondary"
                name="defaultCurrency"
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
                    {CURRENCIES.map((currency) => {
                      return (
                        <ListBox.Item
                          id={currency}
                          key={currency}
                          textValue={currency}
                        >
                          <Label>{currency}</Label>
                        </ListBox.Item>
                      );
                    })}
                  </ListBox>
                </Select.Popover>
                <FieldError />
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
            </ActionForm>
          </Tabs.Panel>
          <Tabs.Panel id="security" className="w-full py-0 pl-6">
            <ActionForm
              fetcher={fetcher}
              action={href('/settings')}
              data-testid="security-form"
              className="flex w-full flex-col gap-4"
            >
              <input type="hidden" name="intent" value="update-user" />
              <TextField
                name="email"
                type="email"
                value={email}
                variant="secondary"
                isDisabled={isUpdating}
                data-testid="email-input"
                onChange={handleEmailChange}
              >
                <Label>Email</Label>
                <Input placeholder="Email" />
                <FieldError />
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
            </ActionForm>
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
