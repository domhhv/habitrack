import React from 'react';
import ReactDOM from 'react-dom/client';
import { isRouteErrorResponse, type ClientOnErrorFunction } from 'react-router';
import { HydratedRouter } from 'react-router/dom';

import { rollbar, getErrorMessage } from '@utils';

import './index.css';

const reportRouteError: ClientOnErrorFunction = (
  error,
  { errorInfo, pattern }
) => {
  if (isRouteErrorResponse(error)) {
    return;
  }

  rollbar.error(
    error instanceof Error ? error : new Error(getErrorMessage(error)),
    {
      routePattern: pattern,
    }
  );
  console.error(error, errorInfo);
};

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter onError={reportRouteError} />
  </React.StrictMode>
);
