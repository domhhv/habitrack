DROP FUNCTION "public"."get_longest_streak"("habit_identifier" INTEGER);

CREATE FUNCTION "get_longest_streak"("habit_identifier" INTEGER) -- noqa
RETURNS TABLE (
    "habit_id" INTEGER,
    "streak_start" BIGINT,
    "streak_end" BIGINT,
    "streak_length" INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH "consecutive_timestamps" AS (
        SELECT
            "o"."habit_id",
            "o"."timestamp",
            "o"."timestamp" - "86400" * ROW_NUMBER() OVER (PARTITION BY "o"."habit_id" ORDER BY "o"."timestamp") AS "streak_id"
        FROM "occurrences" "o"
        WHERE "o"."habit_id" = "habit_identifier"
    ),
    "streaks" AS (
        SELECT
            "o"."habit_id"::INTEGER,
            MIN("o"."timestamp") AS "streak_start",
            MAX("o"."timestamp") AS "streak_end",
            COUNT(*)::INTEGER AS "streak_length"
        FROM "consecutive_timestamps" "o"
        GROUP BY "o"."habit_id", "o"."streak_id"
    )
    SELECT
        "o"."habit_id",
        "o"."streak_start",
        "o"."streak_end",
        "o"."streak_length"
    FROM "streaks" "o"
    ORDER BY "o"."streak_length" DESC
    LIMIT 1;
END;
$$ LANGUAGE "plpgsql"; -- noqa
