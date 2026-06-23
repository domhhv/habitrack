#!/bin/bash

# PostToolUse hook: reminds Claude to update feature docs when related files are edited.
# Receives tool event JSON on stdin, checks file_path against known mappings.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Normalize to relative path
FILE_PATH="${FILE_PATH#"$CLAUDE_PROJECT_DIR/"}"

# Map file path patterns to documentation files
DOC=""
case "$FILE_PATH" in
  supabase/schemas/08_habit_metrics.sql | \
  supabase/schemas/09_occurrence_metric_values.sql | \
  src/models/metric.model.ts | \
  src/services/metrics.service.ts | \
  src/stores/metrics.store.ts | \
  src/utils/build-metric-totals.ts | \
  src/constants.ts)
    DOC="docs/METRICS.md"
    ;;
  src/components/metric/*)
    DOC="docs/METRICS.md"
    ;;
  supabase/schemas/11_habit_stocks.sql | \
  supabase/schemas/12_habit_stock_metric_defaults.sql | \
  supabase/schemas/13_occurrence_stock_usages.sql | \
  supabase/schemas/02_functions.sql | \
  src/models/stock.model.ts | \
  src/models/occurrence-stock-usage.model.ts | \
  src/services/stocks.service.ts | \
  src/services/occurrence-stock-usages.service.ts | \
  src/stores/stocks.store.ts)
    DOC="docs/STOCKS.md"
    ;;
  src/components/stock/*)
    DOC="docs/STOCKS.md"
    ;;
  src/utils/build-occurrence-summary.ts)
    DOC="docs/COSTS.md"
    ;;
esac

# Some files are relevant to multiple docs
DOC2=""
case "$FILE_PATH" in
  src/components/occurrence/OccurrenceCreateFormContainer.tsx | \
  src/components/occurrence/OccurrenceUpdateFormContainer.tsx)
    DOC="docs/METRICS.md"
    DOC2="docs/STOCKS.md and docs/COSTS.md"
    ;;
  src/components/occurrence/OccurrenceFormView.tsx)
    DOC="docs/METRICS.md"
    DOC2="docs/STOCKS.md"
    ;;
  src/components/occurrence/OccurrenceListItem.tsx | \
  src/components/calendar/CalendarPeriodSummary.tsx)
    DOC="docs/COSTS.md"
    ;;
  src/services/occurrences.service.ts | \
  src/services/habits.service.ts | \
  src/models/occurrence.model.ts | \
  src/models/habit.model.ts)
    DOC="docs/METRICS.md"
    DOC2="docs/STOCKS.md"
    ;;
esac

if [ -n "$DOC" ]; then
  MSG="You edited $FILE_PATH — check if $DOC needs updating."
  if [ -n "$DOC2" ]; then
    MSG="You edited $FILE_PATH — check if $DOC and $DOC2 need updating."
  fi
  echo "$MSG" >&2
fi

exit 0
