import {
  AppHeader,
  Calendar,
  AccountPage,
  HabitsPage,
  Snackbars,
} from '@components';
import { setDefaultOptions } from 'date-fns';
import { enGB } from 'date-fns/locale';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Providers from './Providers';

setDefaultOptions({ locale: enGB });

const App = () => {
  React.useEffect(() => {
    document.getElementById('root')?.classList.add('initialized');
  });

  return (
    <Providers>
      <AppHeader />
      <div className="flex h-full flex-1 flex-col items-start bg-slate-50 dark:bg-slate-950">
        <Routes>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </div>
      <Snackbars />
    </Providers>
  );
};

export default App;
