ALTER TABLE "public"."occurrences"
ADD COLUMN "occurred_at" timestamptz,
ADD COLUMN "time_zone" text;

UPDATE "public"."occurrences"
SET
    "occurred_at" = to_timestamp("timestamp" / 1000.0),
    "time_zone" = 'Europe/Madrid'; -- noqa: disable=convention.quoted_literals,references.special_chars

ALTER TABLE "public"."occurrences"
ALTER COLUMN "occurred_at" SET NOT NULL,
ALTER COLUMN "time_zone" SET NOT NULL;

ALTER TABLE "public"."occurrences"
DROP COLUMN "timestamp";
