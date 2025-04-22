import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import useScreenWidth from './useScreenWidth';

describe(useScreenWidth.name, () => {
  it('should return screenWidth as a number', () => {
    const { result } = renderHook(() => {
      return useScreenWidth();
    });
    expect(typeof result.current.screenWidth).toBe('number');
  });

  it('should return the window innerWidth', () => {
    (window.innerWidth as number) = 1000;
    const { result } = renderHook(() => {
      return useScreenWidth();
    });
    expect(result.current.screenWidth).toEqual(1000);
  });
});
