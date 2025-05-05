ALTER TABLE "public"."notes" DROP CONSTRAINT "notes_occurrence_id_fkey";

ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_occurrence_id_fkey"
FOREIGN KEY ("occurrence_id") REFERENCES "occurrences" ("id")
ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."notes" VALIDATE CONSTRAINT "notes_occurrence_id_fkey";
