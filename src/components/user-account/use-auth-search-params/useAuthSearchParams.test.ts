import { useSearchParams } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';

import { useSnackbarsStore } from '@stores';

import useAuthSearchParams from './useAuthSearchParams';

jest.mock('@stores', () => ({
  useSnackbarsStore: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

jest.mock('@utils', () => ({
  transformServerEntities: jest.fn(),
}));

describe(useAuthSearchParams.name, () => {
  it.skip('should call showSnackbar if email is confirmed', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('emailConfirmed', 'true');
    // (useSnackbarsStore as jest.Mock).mockReturnValue({
    //   showSnackbar: jest.fn(),
    // });
    (useSearchParams as jest.Mock).mockReturnValue(location);
    renderHook(() => useAuthSearchParams());
    await waitFor(() =>
      expect(useSnackbarsStore().showSnackbar).toHaveBeenCalled()
    );
  });

  it.skip('should call showSnackbar if password was reset', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('passwordReset', 'true');
    // (useSnackbarsStore as jest.Mock).mockReturnValue({
    //   showSnackbar: jest.fn(),
    // });
    (useSearchParams as jest.Mock).mockReturnValue(location);
    renderHook(() => useAuthSearchParams());
    await waitFor(() =>
      expect(useSnackbarsStore().showSnackbar).toHaveBeenCalled()
    );
  });

  it.skip('should not call showSnackbar if email is not confirmed', async () => {
    const emptySearchParams = new URLSearchParams();
    // (useSnackbarsStore as jest.Mock).mockReturnValue({
    //   showSnackbar: jest.fn(),
    // });
    (useSearchParams as jest.Mock).mockReturnValue(emptySearchParams);
    renderHook(() => useAuthSearchParams());
    await waitFor(() =>
      expect(useSnackbarsStore().showSnackbar).not.toHaveBeenCalled()
    );
  });
});
