-- Table definition
CREATE TABLE IF NOT EXISTS "public"."traits" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "name" "text" NOT NULL CHECK ("name" <> ''), -- noqa: CV10
    "description" "text",
    "user_id" "uuid",
    "color" "text" NOT NULL CHECK ("color" <> ''), -- noqa: CV10
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."traits" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."traits"
ADD CONSTRAINT "traits_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."traits"
ADD CONSTRAINT "traits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_traits_user_id" ON "public"."traits" USING "btree" ("user_id");

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."traits"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."traits" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for users based on user_id" ON "public"."traits"
FOR INSERT WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable users to view their own data only" ON "public"."traits"
FOR SELECT TO "authenticated" USING ((((SELECT "auth"."uid"() AS "uid") = "user_id") OR ("user_id" IS NULL)));

-- Grants
GRANT ALL ON TABLE "public"."traits" TO "anon";
GRANT ALL ON TABLE "public"."traits" TO "authenticated";
GRANT ALL ON TABLE "public"."traits" TO "service_role";
