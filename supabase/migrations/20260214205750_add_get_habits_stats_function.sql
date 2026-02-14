CREATE TYPE "public"."habit_stats" AS (
    "habit_id" uuid,
    "last_entry_at" timestamp with time zone,
    "longest_streak_length" integer,
    "longest_streak_start" date,
    "longest_streak_end" date,
    "total_entries" bigint
);

SET check_function_bodies = "off";

CREATE OR REPLACE FUNCTION "public".get_habits_stats(p_habit_ids uuid [], p_time_zone text DEFAULT 'UTC'::text) -- noqa
RETURNS SETOF "public".habit_stats
LANGUAGE "plpgsql"
AS $function$
BEGIN
    RETURN QUERY
    WITH filtered_occurrences AS (
        SELECT
            o.habit_id,
            o.occurred_at,
            DATE(o.occurred_at AT TIME ZONE p_time_zone) AS occurrence_date
        FROM occurrences o
        WHERE o.habit_id = ANY(p_habit_ids)
    ),
    latest_entries AS (
        SELECT DISTINCT ON (fo.habit_id)
            fo.habit_id,
            fo.occurred_at AS last_entry_at
        FROM filtered_occurrences fo
        WHERE fo.occurred_at < NOW()
        ORDER BY fo.habit_id, fo.occurred_at DESC
    ),
    entry_counts AS (
        SELECT
            fo.habit_id,
            COUNT(*) AS total_entries
        FROM filtered_occurrences fo
        GROUP BY fo.habit_id
    ),
    daily_occurrences AS (
        SELECT DISTINCT
            fo.habit_id,
            fo.occurrence_date
        FROM filtered_occurrences fo
    ),
    streaks AS (
        SELECT
            doo.habit_id,
            doo.occurrence_date,
            doo.occurrence_date - (ROW_NUMBER() OVER (
                PARTITION BY doo.habit_id ORDER BY doo.occurrence_date
            ))::integer AS streak_group
        FROM daily_occurrences doo
    ),
    streak_lengths AS (
        SELECT
            s.habit_id,
            s.streak_group,
            COUNT(*) AS streak_length,
            MIN(s.occurrence_date) AS streak_start,
            MAX(s.occurrence_date) AS streak_end
        FROM streaks s
        GROUP BY s.habit_id, s.streak_group
    ),
    longest_streaks AS (
        SELECT DISTINCT ON (sl.habit_id)
            sl.habit_id,
            sl.streak_length,
            sl.streak_start,
            sl.streak_end
        FROM streak_lengths sl
        ORDER BY sl.habit_id, sl.streak_length DESC
    )
    SELECT
        h.habit_id,
        le.last_entry_at,
        COALESCE(ls.streak_length, 0)::integer AS longest_streak_length,
        ls.streak_start AS longest_streak_start,
        ls.streak_end AS longest_streak_end,
        COALESCE(ec.total_entries, 0) AS total_entries
    FROM UNNEST(p_habit_ids) AS h(habit_id)
    LEFT JOIN latest_entries le ON le.habit_id = h.habit_id
    LEFT JOIN entry_counts ec ON ec.habit_id = h.habit_id
    LEFT JOIN longest_streaks ls ON ls.habit_id = h.habit_id;
END;
$function$;

GRANT ALL ON FUNCTION "public"."get_habits_stats"("p_habit_ids" "uuid" [], "p_time_zone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_habits_stats"("p_habit_ids" "uuid" [], "p_time_zone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_habits_stats"("p_habit_ids" "uuid" [], "p_time_zone" "text") TO "service_role";
