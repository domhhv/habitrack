import React from 'react';

import { NotesList } from '@components';

const NotesPage = () => {
  return (
    <div className="mx-auto w-7xl max-w-full">
      <title>My Notes | Habitrack</title>
      <div className="mt-2 h-[calc(100vh-96px)]">
        <h1 className="text-center text-3xl font-bold text-gray-800 dark:text-gray-300">
          Your Notes
        </h1>
        <NotesList />
      </div>
    </div>
  );
};

export default NotesPage;
