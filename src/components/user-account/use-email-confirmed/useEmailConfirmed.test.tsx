jest.mock('@context', () => ({
  ...jest.requireActual('@context'),
  __esModule: true,
  useSnackbar: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@utils', () => ({
  transformServerEntities: jest.fn(),
}));

import { useSnackbar } from '@context';
import { renderHook, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import useEmailConfirmed from './useEmailConfirmed';

describe(useEmailConfirmed.name, () => {
  it('should call showSnackbar if email is confirmed', async () => {
    const location = {
      search: '?emailConfirmed=true',
    };
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: jest.fn(),
    });
    (useLocation as jest.Mock).mockReturnValue(location);
    renderHook(() => useEmailConfirmed());
    await waitFor(() => expect(useSnackbar().showSnackbar).toHaveBeenCalled());
  });

  it('should not call showSnackbar if email is not confirmed', async () => {
    const location = {
      search: '',
    };
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: jest.fn(),
    });
    (useLocation as jest.Mock).mockReturnValue(location);
    renderHook(() => useEmailConfirmed());
    await waitFor(() =>
      expect(useSnackbar().showSnackbar).not.toHaveBeenCalled()
    );
  });
});
