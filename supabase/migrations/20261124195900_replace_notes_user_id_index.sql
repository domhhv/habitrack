DROP INDEX IF EXISTS "public"."idx_notes_user_id";

CREATE INDEX "idx_notes_user_id_created_at_id" ON "public"."notes" USING "btree" (
    "user_id", "created_at" DESC, "id" DESC
);
