ALTER TABLE "public"."occurrences" DROP CONSTRAINT "occurrences_habit_id_fkey";

ALTER TABLE "public"."occurrences" ADD CONSTRAINT "occurrences_habit_id_fkey" FOREIGN KEY (
    "habit_id"
) REFERENCES "public"."habits" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrences" VALIDATE CONSTRAINT "occurrences_habit_id_fkey";
