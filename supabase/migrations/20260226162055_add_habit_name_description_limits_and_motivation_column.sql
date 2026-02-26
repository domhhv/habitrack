ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_name_check";

ALTER TABLE "public"."habits" ADD COLUMN "motivation" CHARACTER VARYING(2000);

ALTER TABLE "public"."habits" ALTER COLUMN "description" SET DATA TYPE CHARACTER VARYING(
    100
) USING "description"::CHARACTER VARYING(100);

ALTER TABLE "public"."habits" ALTER COLUMN "name"
SET DEFAULT 'Untitled'::CHARACTER VARYING; -- noqa: disable=convention.quoted_literals

ALTER TABLE "public"."habits" ALTER COLUMN "name" SET DATA TYPE CHARACTER VARYING(50) USING "name"::CHARACTER VARYING(
    50
);

ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_name_check"
CHECK ((("name")::TEXT <> ''::TEXT)) NOT VALID;

ALTER TABLE "public"."habits" VALIDATE CONSTRAINT "habits_name_check";
