jest.mock('@supabase/auth-helpers-react', () => ({
  ...jest.requireActual('@supabase/auth-helpers-react'),
  __esModule: true,
  useUser: jest.fn().mockReturnValue({ id: '123' }),
}));

import { useAccountPage } from '@components';
import { useUser } from '@supabase/auth-helpers-react';
import { AuthUser } from '@supabase/supabase-js';
import { renderHook } from '@testing-library/react';

describe(useAccountPage.name, () => {
  it('should use supabase data', () => {
    const mockSupabaseUseUser = jest.fn(useUser);
    mockSupabaseUseUser.mockReturnValue({
      email: 'supabase@mail.com',
      phone: '123-456',
    } as AuthUser);
    const result = renderHook(() => mockSupabaseUseUser());
    expect(mockSupabaseUseUser).toHaveBeenCalled();
    expect(result.result.current).toEqual({
      email: 'supabase@mail.com',
      phone: '123-456',
    });
  });
});
