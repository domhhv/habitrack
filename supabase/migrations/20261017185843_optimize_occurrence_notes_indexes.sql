DROP INDEX IF EXISTS "public"."idx_occurrences_user_id";

DROP INDEX IF EXISTS "public"."notes_occurrence_id_idx";

CREATE INDEX "idx_occurrences_occurred_at" ON "public"."occurrences" USING "btree" ("occurred_at");

CREATE INDEX "idx_occurrences_user_id_occurred_at" ON "public"."occurrences" USING "btree" ("user_id", "occurred_at");
