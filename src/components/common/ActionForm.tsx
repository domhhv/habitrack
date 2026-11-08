import { Form } from '@heroui/react';
import React from 'react';
import type { FetcherWithComponents } from 'react-router';

import type { FieldErrors } from '@models';

type ActionFormProps = Omit<
  React.ComponentProps<typeof Form>,
  'action' | 'method' | 'render' | 'validationErrors'
> & {
  action: string;
  fetcher: FetcherWithComponents<unknown>;
};

const getFieldErrors = (result: unknown) => {
  return typeof result === 'object' &&
    result !== null &&
    'fieldErrors' in result
    ? (result.fieldErrors as FieldErrors)
    : undefined;
};

/**
 * A HeroUI form that posts its named fields to a route action through the fetcher, and shows the
 * action's `fieldErrors` next to the matching fields until they are edited.
 */
const ActionForm = ({ action, fetcher, ...props }: ActionFormProps) => {
  return (
    <Form
      {...props}
      validationErrors={getFieldErrors(fetcher.data)}
      render={({ encType, ...formProps }) => {
        return <fetcher.Form {...formProps} method="post" action={action} />;
      }}
    />
  );
};

export default ActionForm;
