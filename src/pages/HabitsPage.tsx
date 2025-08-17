import React from 'react';

import { HabitsTable } from '@components';

const HabitsPage = () => {
  return (
    <>
      <title>My Habits | Habitrack</title>
      <h1 className="mx-auto mt-8 mb-4 text-3xl font-bold text-gray-800 dark:text-gray-300">
        Your habits
      </h1>
      <HabitsTable />
    </>
  );
};

export default HabitsPage;
