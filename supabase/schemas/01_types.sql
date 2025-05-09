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
