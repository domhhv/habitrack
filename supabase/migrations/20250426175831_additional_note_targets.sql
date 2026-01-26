CREATE TYPE "note_period_kind" AS ENUM ('day', 'week', 'month');

ALTER TABLE "notes"
ADD COLUMN "period_kind" note_period_kind NULL,
ADD COLUMN "period_date" date NULL;

-- noqa: disable=convention.quoted_literals

UPDATE "notes" SET
    "period_kind" = 'day',
    "period_date" = "day"
WHERE "day" IS NOT NULL;

ALTER TABLE "notes" DROP COLUMN "day";

ALTER TABLE "notes"
ADD CONSTRAINT "note_has_one_target"
CHECK (
    ("occurrence_id" IS NOT NULL)::int
    + ("period_kind" IS NOT NULL AND "period_date" IS NOT NULL)::int
    = 1
);

ALTER TABLE "notes"
ADD CONSTRAINT "week_alignment"
CHECK (
    "period_kind" <> 'week'
    OR date_trunc('week', "period_date") = "period_date"
),
ADD CONSTRAINT "month_alignment"
CHECK (
    "period_kind" <> 'month'
    OR date_trunc('month', "period_date") = "period_date"
);

CREATE INDEX ON "notes" ("occurrence_id") WHERE "occurrence_id" IS NOT NULL;
CREATE INDEX ON "notes" ("period_kind", "period_date")
WHERE "period_kind" IS NOT NULL;
