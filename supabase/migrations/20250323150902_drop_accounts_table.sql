ALTER TABLE "public"."traits" DROP CONSTRAINT "public_traits_user_id_fkey";

ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_user_id_fkey";

ALTER TABLE "public"."notes" DROP CONSTRAINT "notes_user_id_fkey";

ALTER TABLE "public"."traits" ADD CONSTRAINT "traits_user_id_fkey" FOREIGN KEY ("user_id")
REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."traits" VALIDATE CONSTRAINT "traits_user_id_fkey";

ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id")
REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habits" VALIDATE CONSTRAINT "habits_user_id_fkey";

ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id")
REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."notes" VALIDATE CONSTRAINT "notes_user_id_fkey";

DROP TABLE "public"."accounts";

DROP TRIGGER "on_auth_user_created" ON "auth"."users";

DROP FUNCTION "public"."handle_new_user"();
