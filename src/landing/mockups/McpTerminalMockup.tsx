const McpTerminalMockup = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-(--border) bg-neutral-950 font-mono text-xs leading-relaxed text-neutral-300 shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-3">
        <span className="size-2.5 rounded-full bg-neutral-700" />
        <span className="size-2.5 rounded-full bg-neutral-700" />
        <span className="size-2.5 rounded-full bg-neutral-700" />
        <span className="ml-2 text-[10px] text-neutral-500">
          habitrack mcp · OAuth 2.1
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-x-auto p-4">
        <p className="text-neutral-100">
          &gt; Which habits am I slipping on this month?
        </p>
        <p className="text-(--accent)">⏺ list_habits()</p>
        <p className="text-(--accent)">
          ⏺ list_occurrences(&#123; from: &quot;2026-07-01&quot; &#125;)
        </p>
        <p className="text-neutral-400">
          You logged Running 4 times so far in July — about half your June pace.
          Want me to log today&apos;s run?
        </p>
        <p className="text-neutral-100">&gt; Yes — 5.2 km, 41 minutes.</p>
        <p className="text-(--accent)">
          ⏺ log_occurrence(&#123; habit: &quot;Running&quot; &#125;)
        </p>
        <p className="text-neutral-400">✓ Logged for Tue, Jul 7 at 07:30</p>
      </div>
    </div>
  );
};

export default McpTerminalMockup;
