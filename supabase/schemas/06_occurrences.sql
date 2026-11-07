-- Occurrences entity - represents instances when habits are performed

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."occurrences" (
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT "now"(),
    "time_zone" TEXT NOT NULL DEFAULT 'UTC', -- noqa: disable=convention.quoted_literals
    "photo_paths" TEXT[],
    "id" UUID DEFAULT "gen_random_uuid"() NOT NULL,
    "habit_id" UUID NOT NULL,
    "has_specific_time" BOOLEAN DEFAULT true NOT NULL,
    "cost" NUMERIC(10, 2),
    "currency" TEXT
);

ALTER TABLE "public"."occurrences" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."occurrences"
ADD CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."occurrences"
ADD CONSTRAINT "occurrences_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."occurrences"
ADD CONSTRAINT "public_occurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_occurrences_user_id_occurred_at" ON "public"."occurrences" USING "btree" (
    "user_id", "occurred_at"
);
CREATE INDEX "idx_occurrences_occurred_at" ON "public"."occurrences" USING "btree" ("occurred_at");

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."occurrences"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."occurrences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."occurrences"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."occurrences"
FOR INSERT WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."occurrences"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."occurrences"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."occurrences" TO "anon";
GRANT ALL ON TABLE "public"."occurrences" TO "authenticated";
GRANT ALL ON TABLE "public"."occurrences" TO "service_role";

-- noqa: disable=all
-- Photo path functions: each change is one UPDATE, so concurrent writes never drop each other's paths.
-- SECURITY INVOKER keeps the row level security policies above in force.
CREATE OR REPLACE FUNCTION "public"."add_occurrence_photo_paths"(
    "p_occurrence_id" UUID,
    "p_photo_paths" TEXT []
)
RETURNS VOID
LANGUAGE "sql"
SECURITY INVOKER
SET search_path TO ''
AS $function$
    UPDATE "public"."occurrences"
    SET "photo_paths" = NULLIF(COALESCE("photo_paths", '{}') || "p_photo_paths", '{}')
    WHERE "id" = "p_occurrence_id";
$function$;

ALTER FUNCTION "public"."add_occurrence_photo_paths"(UUID, TEXT []) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."remove_occurrence_photo_path"(
    "p_occurrence_id" UUID,
    "p_photo_path" TEXT
)
RETURNS VOID
LANGUAGE "sql"
SECURITY INVOKER
SET search_path TO ''
AS $function$
    UPDATE "public"."occurrences"
    SET "photo_paths" = NULLIF(ARRAY_REMOVE("photo_paths", "p_photo_path"), '{}')
    WHERE "id" = "p_occurrence_id";
$function$;

ALTER FUNCTION "public"."remove_occurrence_photo_path"(UUID, TEXT) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."add_occurrence_photo_paths"(UUID, TEXT []) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."add_occurrence_photo_paths"(UUID, TEXT []) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."add_occurrence_photo_paths"(UUID, TEXT []) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."add_occurrence_photo_paths"(UUID, TEXT []) TO "service_role";

REVOKE ALL ON FUNCTION "public"."remove_occurrence_photo_path"(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."remove_occurrence_photo_path"(UUID, TEXT) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."remove_occurrence_photo_path"(UUID, TEXT) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."remove_occurrence_photo_path"(UUID, TEXT) TO "service_role";
-- noqa: enable=all
