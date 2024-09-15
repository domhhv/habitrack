import { act, renderHook } from '@testing-library/react';

import useDocumentTitle from './useDocumentTitle';

describe('useDocumentTitle', () => {
  it('should update the document title when the title changes', () => {
    const title = 'Test Title';
    const newTitle = 'New Test Title';

    renderHook(() => useDocumentTitle(title));

    expect(document.title).toBe(title);

    act(() => {
      renderHook(() => useDocumentTitle(newTitle));
    });

    expect(document.title).toBe(newTitle);
  });
});
