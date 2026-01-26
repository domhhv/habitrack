CREATE OR REPLACE FUNCTION "public"."get_longest_streak"( -- noqa
    "p_habit_id" "uuid",
    "p_time_zone" "text" DEFAULT 'UTC'
)
RETURNS "public"."streak_info"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result streak_info;
BEGIN
    WITH daily_occurrences AS (
        SELECT DISTINCT DATE(occurred_at AT TIME ZONE p_time_zone) as occurrence_date
        FROM occurrences
        WHERE habit_id = p_habit_id
        ORDER BY occurrence_date
    ),
    streaks AS (
        SELECT
            occurrence_date,
            occurrence_date - (ROW_NUMBER() OVER (ORDER BY occurrence_date))::integer AS streak_group
        FROM daily_occurrences
    ),
    streak_lengths AS (
        SELECT
            streak_group,
            COUNT(*) as streak_length,
            MIN(occurrence_date) as streak_start,
            MAX(occurrence_date) as streak_end
        FROM streaks
        GROUP BY streak_group
    )
    SELECT
        streak_length,
        streak_start,
        streak_end
    INTO result
    FROM streak_lengths
    ORDER BY streak_length DESC
    LIMIT 1;

    IF result.streak_length IS NULL THEN
        result.streak_length := 0;
        result.streak_start := NULL;
        result.streak_end := NULL;
    END IF;

    RETURN result;
END;
$$;

ALTER FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_timezone" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_timezone" "text") TO "service_role";
