INSERT INTO "storage"."buckets" ("id", "name", "public")
VALUES ("habit_icons", "habit_icons", true);

CREATE POLICY "Anyone can upload a habit icon"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (("bucket_id" = "habit_icons"::TEXT));

CREATE POLICY "Habit icon images are publicly accessible"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (("bucket_id" = "habit_icons"::TEXT));

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

CREATE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger" -- noqa
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO "public"
    AS $$
BEGIN
    INSERT INTO "public"."accounts" (id, email, name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>"name");
    RETURN new;
END;
$$;
