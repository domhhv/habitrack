import { Alert, Button } from '@heroui/react';
import React from 'react';

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
      <Alert
        title={title}
        color="danger"
        variant="solid"
        description={`We're sorry for the inconvenience.${errorDescription}`}
        classNames={{
          base: 'w-4/5 max-w-3xl',
          title: 'font-bold',
        }}
        endContent={
          <Button
            color="danger"
            variant="faded"
            onPress={() => {
              window.location.reload();
            }}
          >
            Reload
          </Button>
        }
      />
    </main>
  );
};

export default ErrorFallbackPage;
