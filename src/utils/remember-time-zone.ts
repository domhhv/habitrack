/* Serialized into the document head, so this function must remain self-contained. */
const rememberTimeZone = () => {
  try {
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

    document.cookie = `tz=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* Server loaders fall back to UTC when the time zone is unknown. */
  }
};

export default rememberTimeZone;
