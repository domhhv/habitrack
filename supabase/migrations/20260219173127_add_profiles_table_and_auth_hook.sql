CREATE TYPE "public"."days_of_week" AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

CREATE TYPE "public"."user_plans" AS ENUM ('free', 'pro');

CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan" "public"."user_plans" NOT NULL
    DEFAULT 'free'::"public"."user_plans", -- noqa: disable=convention.quoted_literals
    "first_day_of_week" "public"."days_of_week" NOT NULL DEFAULT 'mon'::"public"."days_of_week",
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles" USING "btree" ("email");

CREATE UNIQUE INDEX "profiles_pkey" ON "public"."profiles" USING "btree" ("id");

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY USING INDEX "profiles_pkey";

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_email_key" UNIQUE USING INDEX "profiles_email_key";

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users" (
    "id"
) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."profiles" VALIDATE CONSTRAINT "profiles_id_fkey";

GRANT DELETE ON TABLE "public"."profiles" TO "anon";

GRANT INSERT ON TABLE "public"."profiles" TO "anon";

GRANT REFERENCES ON TABLE "public"."profiles" TO "anon";

GRANT SELECT ON TABLE "public"."profiles" TO "anon";

GRANT TRIGGER ON TABLE "public"."profiles" TO "anon";

GRANT TRUNCATE ON TABLE "public"."profiles" TO "anon";

GRANT UPDATE ON TABLE "public"."profiles" TO "anon";

GRANT DELETE ON TABLE "public"."profiles" TO "authenticated";

GRANT INSERT ON TABLE "public"."profiles" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."profiles" TO "authenticated";

GRANT SELECT ON TABLE "public"."profiles" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."profiles" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."profiles" TO "authenticated";

GRANT UPDATE ON TABLE "public"."profiles" TO "authenticated";

GRANT DELETE ON TABLE "public"."profiles" TO "service_role";

GRANT INSERT ON TABLE "public"."profiles" TO "service_role";

GRANT REFERENCES ON TABLE "public"."profiles" TO "service_role";

GRANT SELECT ON TABLE "public"."profiles" TO "service_role";

GRANT TRIGGER ON TABLE "public"."profiles" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."profiles" TO "service_role";

GRANT UPDATE ON TABLE "public"."profiles" TO "service_role";

CREATE POLICY "Enable delete for users based on id"
ON "public"."profiles"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (("auth"."uid"() = "id"));

CREATE POLICY "Enable insert for users based on user_id"
ON "public"."profiles"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Enable read access for users based on user_id"
ON "public"."profiles"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Enable update for users based on user_id"
ON "public"."profiles"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (("auth"."uid"() = "id"));

CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE FUNCTION "public"."create_profile"() -- noqa
RETURNS TRIGGER
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path TO "public"
AS $function$
BEGIN
    INSERT INTO "public"."profiles" (id, email, name, first_day_of_week)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'name', COALESCE((new.raw_user_meta_data->>'first_day_of_week')::days_of_week, 'mon'));
    RETURN new;
END;
$function$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."create_profile"();

INSERT INTO "public"."profiles" (id, email, name)
SELECT
    id,
    email,
    raw_user_meta_data->>'name'
FROM "auth"."users"
ON CONFLICT (id) DO NOTHING;
