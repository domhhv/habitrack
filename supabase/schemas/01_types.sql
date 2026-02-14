-- Custom types for the application

-- Type for note period kind (day, week, month)
CREATE TYPE "public"."note_period_kind" AS ENUM (
    'day',
    'week',
    'month'
);

ALTER TYPE "public"."note_period_kind" OWNER TO "postgres";

-- Type for streak information
CREATE TYPE "public"."streak_info" AS (
    "streak_length" integer,
    "streak_start" "date",
    "streak_end" "date"
);

ALTER TYPE "public"."streak_info" OWNER TO "postgres";

-- Type for batched habit statistics
CREATE TYPE "public"."habit_stats" AS (
    "habit_id" "uuid",
    "last_entry_at" timestamptz,
    "longest_streak_length" integer,
    "longest_streak_start" "date",
    "longest_streak_end" "date",
    "total_entries" bigint
);

ALTER TYPE "public"."habit_stats" OWNER TO "postgres";

-- Type for habit metric kind
CREATE TYPE "public"."metric_type" AS ENUM (
    'number',
    'duration',
    'percentage',
    'scale',
    'range',
    'choice',
    'boolean',
    'text'
);

ALTER TYPE "public"."metric_type" OWNER TO "postgres";
