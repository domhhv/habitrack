import {
  act,
  render,
  screen,
  fireEvent,
  renderHook,
} from '@testing-library/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { ThemeMenu } from '@components';
import { ThemeModes } from '@const';
import { useInitializeTheme } from '@hooks';
import { useBoundStore } from '@stores';
import { initializeTheme } from '@utils';

import ThemeToggle from './ThemeToggle';

const ThemeControls = () => {
  useInitializeTheme();

  return <ThemeToggle />;
};

describe('browser-managed theme', () => {
  let mediaQuery: MediaQueryList;

  const changeSystemTheme = (matches: boolean) => {
    Object.defineProperty(mediaQuery, 'matches', {
      configurable: true,
      value: matches,
    });
    mediaQuery.dispatchEvent(Object.assign(new Event('change'), { matches }));
  };

  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'preferences=; Max-Age=0; Path=/';
    document.documentElement.classList.remove('dark');
    useBoundStore.setState({
      isLightTheme: true,
      themeMode: ThemeModes.SYSTEM,
    });
    mediaQuery = Object.assign(new EventTarget(), {
      addListener: vi.fn(),
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      removeListener: vi.fn(),
    });
    vi.mocked(window.matchMedia).mockReturnValue(mediaQuery);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes and switches themes without a router or network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(
      <React.StrictMode>
        <ThemeControls />
      </React.StrictMode>
    );

    expect(
      screen.getByRole('button', { name: 'Use system theme' })
    ).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Use dark theme' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(useBoundStore.getState().isLightTheme).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Use dark theme' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('restores the saved preference after remounting', () => {
    const { unmount } = render(<ThemeControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Use dark theme' }));
    unmount();
    useBoundStore.setState({
      isLightTheme: true,
      themeMode: ThemeModes.SYSTEM,
    });
    render(<ThemeControls />);

    expect(
      screen.getByRole('button', { name: 'Use dark theme' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('shares the sidebar menu selection with the toggle', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(
      <>
        <ThemeControls />
        <ThemeMenu />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Theme' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Dark' }));

    expect(
      screen.getByRole('button', { name: 'Use dark theme' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('follows system changes only when system mode is selected', () => {
    render(<ThemeControls />);
    act(() => {
      changeSystemTheme(true);
    });
    expect(document.documentElement).toHaveClass('dark');
    expect(useBoundStore.getState().isLightTheme).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Use light theme' }));
    act(() => {
      changeSystemTheme(false);
      changeSystemTheme(true);
    });
    expect(document.documentElement).not.toHaveClass('dark');
    expect(useBoundStore.getState().isLightTheme).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Use system theme' }));
    expect(document.documentElement).toHaveClass('dark');
  });

  it('cleans up the system-theme listener', () => {
    const { unmount } = renderHook(useInitializeTheme);
    unmount();
    act(() => {
      changeSystemTheme(true);
    });

    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('migrates the legacy preferences cookie to local storage', () => {
    document.cookie = `preferences=${encodeURIComponent(btoa(JSON.stringify({ themeMode: 'dark' })))}; Path=/`;
    render(<ThemeControls />);

    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('prefers local storage over the legacy cookie', () => {
    document.cookie = `preferences=${encodeURIComponent(btoa(JSON.stringify({ themeMode: 'dark' })))}; Path=/`;
    localStorage.setItem('theme', 'light');
    render(<ThemeControls />);

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('uses the system preference for invalid saved modes', () => {
    localStorage.setItem('theme', 'invalid');
    changeSystemTheme(true);
    render(<ThemeControls />);

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('system');
  });

  it('ignores malformed legacy cookies', () => {
    document.cookie = 'preferences=invalid; Path=/';
    changeSystemTheme(true);
    render(<ThemeControls />);

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('system');
  });

  it('still allows toggling when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    render(<ThemeControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Use dark theme' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(
      screen.getByRole('button', { name: 'Use dark theme' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('hydrates prerendered controls with a saved dark theme without mismatches', async () => {
    localStorage.setItem('theme', 'dark');
    const container = document.createElement('div');
    container.innerHTML = renderToString(<ThemeControls />);
    document.body.append(container);
    initializeTheme();
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;

    await act(async () => {
      root = hydrateRoot(container, <ThemeControls />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(document.documentElement).toHaveClass('dark');
    expect(
      screen.getByRole('button', { name: 'Use dark theme' })
    ).toHaveAttribute('aria-pressed', 'true');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
