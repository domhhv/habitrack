set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_longest_streak(habit_identifier integer)
 RETURNS TABLE(habit_id integer, streak_start date, streak_end date, streak_length integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH consecutive_days AS (
    SELECT
      o.habit_id,
      o.day,
      o.day - INTERVAL '1 day' * ROW_NUMBER() OVER (PARTITION BY o.habit_id ORDER BY o.day) AS streak_id
    FROM occurrences o
    WHERE o.habit_id = habit_identifier
  ),
  streaks AS (
    SELECT
      o.habit_id::INT,
      MIN(o.day) AS streak_start,
      MAX(o.day) AS streak_end,
      COUNT(*)::INT AS streak_length
    FROM consecutive_days o
    GROUP BY o.habit_id, o.streak_id
  )
  SELECT o.habit_id, o.streak_start, o.streak_end, o.streak_length
  FROM streaks o
  ORDER BY o.streak_length DESC
  LIMIT 1;
END;
$function$
;


