type ScopedNote = {
  body: string;
  scope: string;
};

const SCOPED_NOTES: ScopedNote[] = [
  {
    body: 'Switched to the lighter roast — way less bitter than the usual one.',
    scope: 'Occurrence · Coffee · 08:12',
  },
  {
    body: 'Slept badly, skipped the run. Moved it to tomorrow morning.',
    scope: 'Day · Mon, Jul 13',
  },
  {
    body: 'Cut coffee to one cup a day. Headaches on day two, fine after.',
    scope: 'Week · W29',
  },
  {
    body: 'Best running month this year — 62 km total, zero knee pain.',
    scope: 'Month · July',
  },
];

const NoteScopesMockup = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SCOPED_NOTES.map((note) => {
        return (
          <div
            key={note.scope}
            className="rounded-xl border border-(--border) bg-(--surface) p-4"
          >
            <span className="inline-block rounded-full bg-(--accent)/10 px-2.5 py-1 text-[10px] font-extrabold text-(--accent)">
              {note.scope}
            </span>
            <p className="mt-3 text-sm font-semibold text-(--surface-foreground)">
              {note.body}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default NoteScopesMockup;
