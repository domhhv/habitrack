jest.mock('@context', () => ({
  ...jest.requireActual('@context'),
  __esModule: true,
  useSnackbar: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

jest.mock('@utils', () => ({
  transformServerEntities: jest.fn(),
}));

import { useSnackbar } from '@context';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';

import useAuthSearchParams from './useAuthSearchParams';

describe(useAuthSearchParams.name, () => {
  it.skip('should call showSnackbar if email is confirmed', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('emailConfirmed', 'true');
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: jest.fn(),
    });
    (useSearchParams as jest.Mock).mockReturnValue(location);
    renderHook(() => useAuthSearchParams());
    await waitFor(() => expect(useSnackbar().showSnackbar).toHaveBeenCalled());
  });

  it.skip('should call showSnackbar if password was reset', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('passwordReset', 'true');
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: jest.fn(),
    });
    (useSearchParams as jest.Mock).mockReturnValue(location);
    renderHook(() => useAuthSearchParams());
    await waitFor(() => expect(useSnackbar().showSnackbar).toHaveBeenCalled());
  });

  it.skip('should not call showSnackbar if email is not confirmed', async () => {
    const emptySearchParams = new URLSearchParams();
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: jest.fn(),
    });
    (useSearchParams as jest.Mock).mockReturnValue(emptySearchParams);
    renderHook(() => useAuthSearchParams());
    await waitFor(() =>
      expect(useSnackbar().showSnackbar).not.toHaveBeenCalled()
    );
  });
});
