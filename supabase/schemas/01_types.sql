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
    "streak_length" INTEGER,
    "streak_start" DATE,
    "streak_end" DATE
);

ALTER TYPE "public"."streak_info" OWNER TO "postgres";

-- Type for batched habit statistics
CREATE TYPE "public"."habit_stats" AS (
    "habit_id" UUID,
    "last_entry_at" TIMESTAMP WITH TIME ZONE,
    "longest_streak_length" INTEGER,
    "longest_streak_start" DATE,
    "longest_streak_end" DATE,
    "total_entries" BIGINT
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

-- Type for user subscription plans --
CREATE TYPE "public"."user_plans" AS ENUM ('free', 'pro');

ALTER TYPE "public"."user_plans" OWNER TO "postgres";

-- Type for days of the week --
CREATE TYPE "public"."days_of_week" AS ENUM ('sun', 'mon');

ALTER TYPE "public"."days_of_week" OWNER TO "postgres";
