import React from 'react';

const useDocumentTitle = (title: string) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
};

export default useDocumentTitle;
