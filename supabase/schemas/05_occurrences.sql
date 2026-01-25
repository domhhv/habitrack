-- Occurrences entity - represents instances when habits are performed

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."occurrences" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "occurred_at" timestamptz NOT NULL,
    "timezone" text NOT NULL,
    "photo_paths" "text" [],
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "habit_id" "uuid" NOT NULL,
    "has_specific_time" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."occurrences" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."occurrences"
ADD CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."occurrences"
ADD CONSTRAINT "occurrences_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits" ("id");

ALTER TABLE ONLY "public"."occurrences"
ADD CONSTRAINT "public_occurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_occurrences_user_id" ON "public"."occurrences" USING "btree" ("user_id");

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."occurrences"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."occurrences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."occurrences"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."occurrences"
FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id" ON "public"."occurrences"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."occurrences"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."occurrences" TO "anon";
GRANT ALL ON TABLE "public"."occurrences" TO "authenticated";
GRANT ALL ON TABLE "public"."occurrences" TO "service_role";
