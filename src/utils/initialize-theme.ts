import type { ThemeModes } from '@const';

/* Serialized into the document head, so this function must remain self-contained. */
const initializeTheme = (): ThemeModes => {
  let mode = 'system';

  try {
    const storedMode = localStorage.getItem('theme');
    const cookie = document.cookie.split('; ').find((value) => {
      return value.startsWith('preferences=');
    });
    const savedMode =
      storedMode ??
      (cookie
        ? JSON.parse(
            atob(decodeURIComponent(cookie.slice('preferences='.length)))
          ).themeMode
        : null);

    if (
      savedMode === 'light' ||
      savedMode === 'dark' ||
      savedMode === 'system'
    ) {
      mode = savedMode;
    }
  } catch {
    /* Fall back to the system theme when storage or legacy cookies are unavailable. */
  }

  document.documentElement.classList.toggle(
    'dark',
    mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  return mode as ThemeModes;
};

export default initializeTheme;
