CREATE UNIQUE INDEX "notes_occurrence_id_key" ON "public"."notes" USING "btree" ("occurrence_id");

ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_occurrence_id_key" UNIQUE USING INDEX "notes_occurrence_id_key";
