import { App } from '@components';
import React from 'react';
import { I18nProvider } from 'react-aria';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider locale="en-GB">
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
