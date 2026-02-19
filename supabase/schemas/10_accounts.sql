CREATE TABLE "public"."profiles" (
    "id" UUID REFERENCES "auth"."users" ("id") ON DELETE CASCADE PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "plan" "public"."user_plans" NOT NULL DEFAULT 'free', -- noqa: disable=convention.quoted_literals
    "first_day_of_week" "public"."days_of_week" NOT NULL DEFAULT 'mon',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ
);

CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

ALTER TABLE "public"."profiles" OWNER TO "postgres";

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on user_id" ON "public"."profiles"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."profiles" FOR INSERT WITH CHECK (
    ("auth"."uid"() = "id")
);

CREATE POLICY "Enable update for users based on user_id" ON "public"."profiles" FOR UPDATE USING (
    ("auth"."uid"() = "id")
);

CREATE POLICY "Enable delete for users based on id" ON "public"."profiles" FOR DELETE USING (
    ("auth"."uid"() = "id")
);

CREATE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."create_profile"();
