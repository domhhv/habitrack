ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_name_check"
CHECK (("name" <> ''::TEXT)) NOT VALID; -- noqa: CV10

ALTER TABLE "public"."habits" VALIDATE CONSTRAINT "habits_name_check";

ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_content_check"
CHECK (("content" <> ''::TEXT)) NOT VALID; -- noqa: CV10

ALTER TABLE "public"."notes" VALIDATE CONSTRAINT "notes_content_check";

ALTER TABLE "public"."traits" ADD CONSTRAINT "traits_color_check"
CHECK (("color" <> ''::TEXT)) NOT VALID; -- noqa: CV10

ALTER TABLE "public"."traits" VALIDATE CONSTRAINT "traits_color_check";

ALTER TABLE "public"."traits" ADD CONSTRAINT "traits_name_check"
CHECK (("name" <> ''::TEXT)) NOT VALID; -- noqa: CV10

ALTER TABLE "public"."traits" VALIDATE CONSTRAINT "traits_name_check";
