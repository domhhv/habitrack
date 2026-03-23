-- noqa: disable=all
-- Utility functions for the application

-- Function to create a profile when a new user is created in the auth system --
CREATE FUNCTION "public"."create_profile"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    INSERT INTO "public"."profiles" (id, email, name, first_day_of_week)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'name', COALESCE((new.raw_user_meta_data->>'first_day_of_week')::days_of_week, 'mon'));
    RETURN new;
END;
$$;

ALTER FUNCTION "public"."create_profile"() OWNER TO "postgres";

-- Function to track the longest streak for a habit
CREATE FUNCTION "public"."get_longest_streak"(
    "p_habit_id" UUID,
    "p_time_zone" TEXT DEFAULT 'UTC'::text
)
RETURNS public.streak_info
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
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
            occurrence_date - (ROW_NUMBER() OVER (ORDER BY occurrence_date))::INTEGER AS streak_group
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

ALTER FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) OWNER TO "postgres";

-- Function to get batched statistics for multiple habits
CREATE FUNCTION "public"."get_habits_stats"(
    "p_habit_ids" UUID[],
    "p_time_zone" TEXT DEFAULT 'UTC'::text
)
RETURNS SETOF public.habit_stats
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
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
            ))::INTEGER AS streak_group
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
        COALESCE(ls.streak_length, 0)::INTEGER AS longest_streak_length,
        ls.streak_start AS longest_streak_start,
        ls.streak_end AS longest_streak_end,
        COALESCE(ec.total_entries, 0) AS total_entries
    FROM UNNEST(p_habit_ids) AS h(habit_id)
    LEFT JOIN latest_entries le ON le.habit_id = h.habit_id
    LEFT JOIN entry_counts ec ON ec.habit_id = h.habit_id
    LEFT JOIN longest_streaks ls ON ls.habit_id = h.habit_id;
END;
$$;

ALTER FUNCTION "public"."get_habits_stats"("p_habit_ids" UUID[], "p_time_zone" TEXT) OWNER TO "postgres";

-- Function to automatically update updated_at timestamp
CREATE FUNCTION "public"."update_updated_at_column"() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

-- Function to decrement remaining_items on stock usage insert (quantifiable stocks only)
CREATE FUNCTION "public"."update_stock_on_usage_insert"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    IF NEW.quantity IS NOT NULL THEN
        UPDATE "public"."habit_stocks"
        SET "remaining_items" = "remaining_items" - NEW.quantity,
            "is_depleted" = ("remaining_items" - NEW.quantity) <= 0
        WHERE "id" = NEW.habit_stock_id
          AND "remaining_items" IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_stock_on_usage_insert"() OWNER TO "postgres";

-- Function to restore remaining_items on stock usage delete
CREATE OR REPLACE FUNCTION "public"."update_stock_on_usage_delete"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    IF OLD.quantity IS NOT NULL THEN
        UPDATE "public"."habit_stocks"
        SET "remaining_items" = "remaining_items" + OLD.quantity,
            "is_depleted" = (COALESCE("remaining_items", 0) + OLD.quantity) <= 0
        WHERE "id" = OLD.habit_stock_id
          AND "remaining_items" IS NOT NULL;
    END IF;
    RETURN OLD;
END;
$$;

ALTER FUNCTION "public"."update_stock_on_usage_delete"() OWNER TO "postgres";

-- Function to handle remaining_items on stock usage update (restore old, apply new)
CREATE OR REPLACE FUNCTION "public"."update_stock_on_usage_update"() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
    -- Restore old quantity to the old stock
    IF OLD.quantity IS NOT NULL THEN
        UPDATE "public"."habit_stocks"
        SET "remaining_items" = "remaining_items" + OLD.quantity,
            "is_depleted" = (COALESCE("remaining_items", 0) + OLD.quantity) <= 0
        WHERE "id" = OLD.habit_stock_id
          AND "remaining_items" IS NOT NULL;
    END IF;

    -- Apply new quantity to the new stock
    IF NEW.quantity IS NOT NULL THEN
        UPDATE "public"."habit_stocks"
        SET "remaining_items" = "remaining_items" - NEW.quantity,
            "is_depleted" = ("remaining_items" - NEW.quantity) <= 0
        WHERE "id" = NEW.habit_stock_id
          AND "remaining_items" IS NOT NULL;
    END IF;

    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_stock_on_usage_update"() OWNER TO "postgres";

-- Grant permissions on functions
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) TO "anon";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_habits_stats"("p_habit_ids" UUID[], "p_time_zone" TEXT) TO "anon";
GRANT ALL ON FUNCTION "public"."get_habits_stats"("p_habit_ids" UUID[], "p_time_zone" TEXT) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_habits_stats"("p_habit_ids" UUID[], "p_time_zone" TEXT) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_stock_on_usage_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_stock_on_usage_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_stock_on_usage_insert"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_stock_on_usage_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_stock_on_usage_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_stock_on_usage_delete"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_stock_on_usage_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_stock_on_usage_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_stock_on_usage_update"() TO "service_role";
