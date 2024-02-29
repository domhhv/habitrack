import { renderHook } from '@testing-library/react';

import useScreenSize from './useScreenSize';

describe(useScreenSize.name, () => {
  it('should return a number', () => {
    const { result } = renderHook(() => useScreenSize());
    expect(typeof result.current).toBe('number');
  });

  it('should return a number greater than 0', () => {
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBeGreaterThan(0);
  });

  it('should update the screen size when the window is resized', () => {
    const { result } = renderHook(() => useScreenSize());
    const initialSize = result.current;
    global.dispatchEvent(new Event('resize'));
    expect(result.current).not.toEqual(initialSize);
  });
});
