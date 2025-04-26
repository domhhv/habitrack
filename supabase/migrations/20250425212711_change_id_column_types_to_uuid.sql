ALTER TABLE "public"."habits" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "public"."notes" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "public"."occurrences" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "public"."traits" ADD COLUMN "new_id" UUID NOT NULL DEFAULT gen_random_uuid();

UPDATE "public"."traits" SET "new_id" = gen_random_uuid()
WHERE "new_id" IS NULL;
UPDATE "public"."habits" SET "new_id" = gen_random_uuid()
WHERE "new_id" IS NULL;
UPDATE "public"."occurrences" SET "new_id" = gen_random_uuid()
WHERE "new_id" IS NULL;
UPDATE "public"."notes" SET "new_id" = gen_random_uuid()
WHERE "new_id" IS NULL;

ALTER TABLE "public"."occurrences" ADD COLUMN "habit_uuid" UUID;
UPDATE "public"."occurrences"
SET "habit_uuid" = "h"."new_id"
FROM "public"."habits" AS "h"
WHERE "occurrences"."habit_id" = "h"."id";

ALTER TABLE "public"."notes" ADD COLUMN "occurrence_uuid" UUID;
UPDATE "public"."notes"
SET "occurrence_uuid" = "o"."new_id"
FROM "public"."occurrences" AS "o"
WHERE "notes"."occurrence_id" = "o"."id";

ALTER TABLE "public"."habits" ADD COLUMN "trait_uuid" UUID;
UPDATE "public"."habits"
SET "trait_uuid" = "t"."new_id"
FROM "public"."traits" AS "t"
WHERE "habits"."trait_id" = "t"."id";

ALTER TABLE "public"."occurrences" ALTER COLUMN "habit_uuid" SET NOT NULL;
ALTER TABLE "public"."habits" ALTER COLUMN "trait_uuid" SET NOT NULL;

ALTER TABLE "public"."occurrences" DROP CONSTRAINT public_occurrences_habit_id_fkey;
ALTER TABLE "public"."notes" DROP CONSTRAINT notes_occurrence_id_fkey;
ALTER TABLE "public"."habits" DROP CONSTRAINT public_habits_trait_id_fkey;

ALTER TABLE "public"."habits" DROP CONSTRAINT habits_pkey;
ALTER TABLE "public"."notes" DROP CONSTRAINT notes_pkey;
ALTER TABLE "public"."occurrences" DROP CONSTRAINT calendar_events_pkey;
ALTER TABLE "public"."traits" DROP CONSTRAINT traits_pkey;

ALTER TABLE "public"."occurrences" DROP COLUMN "habit_id";
ALTER TABLE "public"."notes" DROP COLUMN "occurrence_id";
ALTER TABLE "public"."habits" DROP COLUMN "trait_id";
ALTER TABLE "public"."habits" DROP COLUMN "id";
ALTER TABLE "public"."notes" DROP COLUMN "id";
ALTER TABLE "public"."occurrences" DROP COLUMN "id";
ALTER TABLE "public"."traits" DROP COLUMN "id";

ALTER TABLE "public"."habits" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "public"."occurrences" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "public"."notes" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "public"."traits" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "public"."occurrences" RENAME COLUMN "habit_uuid" TO "habit_id";
ALTER TABLE "public"."notes" RENAME COLUMN "occurrence_uuid" TO "occurrence_id";
ALTER TABLE "public"."habits" RENAME COLUMN "trait_uuid" TO "trait_id";

ALTER TABLE "public"."habits" ADD PRIMARY KEY ("id");
ALTER TABLE "public"."notes" ADD PRIMARY KEY ("id");
ALTER TABLE "public"."occurrences" ADD PRIMARY KEY ("id");
ALTER TABLE "public"."traits" ADD PRIMARY KEY ("id");

ALTER TABLE "public"."occurrences"
ADD CONSTRAINT "occurrences_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits" ("id");

ALTER TABLE "public"."notes"
ADD CONSTRAINT "notes_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "public"."occurrences" ("id");

ALTER TABLE "public"."habits"
ADD CONSTRAINT "habits_trait_id_fkey" FOREIGN KEY ("trait_id") REFERENCES "public"."traits" ("id");


SET check_function_bodies = "off";

DROP FUNCTION IF EXISTS "public"."get_longest_streak"(INTEGER) CASCADE;

-- noqa: disable=all

CREATE OR REPLACE FUNCTION "public".get_longest_streak(p_habit_id UUID)
 RETURNS streak_info
 LANGUAGE "plpgsql"
AS $function$
DECLARE
    result streak_info;
BEGIN
    WITH daily_occurrences AS (
        SELECT DISTINCT DATE(to_timestamp(timestamp/1000)) as occurrence_date
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
$function$;
