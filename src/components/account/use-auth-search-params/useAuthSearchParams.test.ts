import { addToast } from '@heroui/react';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchParams } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import useAuthSearchParams from './useAuthSearchParams';

vi.mock('@stores', () => {
  return {
    useSnackbarsStore: vi.fn(),
  };
});

vi.mock('react-router', () => {
  return {
    useSearchParams: vi.fn(),
  };
});

vi.mock('@utils', () => {
  return {
    transformServerEntities: vi.fn(),
  };
});

describe(useAuthSearchParams.name, () => {
  it.skip('should call showSnackbar if email is confirmed', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('emailConfirmed', 'true');
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(location);
    renderHook(() => {
      return useAuthSearchParams();
    });
    await waitFor(() => {
      return expect(addToast).toHaveBeenCalled();
    });
  });

  it.skip('should call showSnackbar if password was reset', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('passwordReset', 'true');
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(location);
    renderHook(() => {
      return useAuthSearchParams();
    });
    await waitFor(() => {
      return expect(addToast).toHaveBeenCalled();
    });
  });

  it.skip('should not call showSnackbar if email is not confirmed', async () => {
    const emptySearchParams = new URLSearchParams();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      emptySearchParams
    );
    renderHook(() => {
      return useAuthSearchParams();
    });
    await waitFor(() => {
      return expect(addToast).not.toHaveBeenCalled();
    });
  });
});
