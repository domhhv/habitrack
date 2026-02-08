-- Habits entity - represents user habits

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."habits" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL CHECK ("name" <> ''), -- noqa: CV10
    "description" "text",
    "icon_path" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trait_id" "uuid"
);

ALTER TABLE "public"."habits" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."habits"
ADD CONSTRAINT "habits_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."habits"
ADD CONSTRAINT "habits_trait_id_fkey" FOREIGN KEY ("trait_id") REFERENCES "public"."traits" ("id");

ALTER TABLE ONLY "public"."habits"
ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_habits_user_id" ON "public"."habits" USING "btree" ("user_id");

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."habits"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."habits" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."habits"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."habits"
FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id" ON "public"."habits"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."habits"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."habits" TO "anon";
GRANT ALL ON TABLE "public"."habits" TO "authenticated";
GRANT ALL ON TABLE "public"."habits" TO "service_role";
