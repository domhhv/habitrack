ALTER TABLE "public"."profiles" ALTER COLUMN "first_day_of_week" DROP DEFAULT;

ALTER TYPE "public"."days_of_week" RENAME TO "days_of_week__old_version_to_be_dropped";

CREATE TYPE "public"."days_of_week" AS ENUM ('sun', 'mon');

ALTER TABLE "public"."profiles" ALTER COLUMN "first_day_of_week"
TYPE "public"."days_of_week" USING "first_day_of_week"::text::"public"."days_of_week";

ALTER TABLE "public"."profiles" ALTER COLUMN "first_day_of_week"
SET DEFAULT 'mon'::"public"."days_of_week"; -- noqa: disable=convention.quoted_literals

DROP TYPE "public"."days_of_week__old_version_to_be_dropped";
