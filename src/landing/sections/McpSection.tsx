import LandingSection from '../LandingSection';
import { McpTerminalMockup } from '../mockups';

const MCP_TOOLS = [
  {
    description: 'your habits with their traits, metrics, and stocks',
    name: 'list_habits',
  },
  {
    description: 'logged history with recorded metric values',
    name: 'list_occurrences',
  },
  {
    description: 'log a habit for you, at any time',
    name: 'log_occurrence',
  },
  {
    description: 'notes by occurrence, day, week, or month',
    name: 'list_notes',
  },
];

const McpSection = () => {
  return (
    <LandingSection
      id="mcp"
      eyebrow="MCP"
      title="Your AI assistant speaks Habitrack"
      description="Habitrack ships a built-in MCP server. Connect Claude, ChatGPT, or any MCP client and let it read your habits, browse your history and notes, or log an occurrence for you — secured with OAuth 2.1 and scoped to your account only."
    >
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {MCP_TOOLS.map((tool) => {
            return (
              <div
                key={tool.name}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-(--border) bg-(--surface) px-4 py-3"
              >
                <code className="font-mono text-xs font-bold text-(--accent)">
                  {tool.name}
                </code>
                <span className="text-xs font-semibold text-(--muted)">
                  {tool.description}
                </span>
              </div>
            );
          })}
        </div>
        <McpTerminalMockup />
      </div>
    </LandingSection>
  );
};

export default McpSection;
