import { Alert } from '@heroui/react';
import React from 'react';

import { CustomButton } from '@components';
import { getErrorMessage } from '@utils';

type ErrorFallbackPageProps = {
  error: Error | null;
  title?: string;
};

const ErrorFallbackPage = ({
  error,
  title = 'Something went wrong. Please try reloading the page.',
}: ErrorFallbackPageProps) => {
  const errorDescription = error
    ? ` Here're the error details: ${getErrorMessage(error)}`
    : '';

  return (
    <main className="bg-background-50 dark:bg-background-700 flex h-full flex-1 items-center justify-center">
      <Alert status="danger" className="w-4/5 max-w-3xl">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="font-bold">{title}</Alert.Title>
          <Alert.Description>{`We're sorry for the inconvenience.${errorDescription}`}</Alert.Description>
        </Alert.Content>
        <CustomButton
          variant="danger-soft"
          onPress={() => {
            window.location.reload();
          }}
        >
          Reload
        </CustomButton>
      </Alert>
    </main>
  );
};

export default ErrorFallbackPage;
