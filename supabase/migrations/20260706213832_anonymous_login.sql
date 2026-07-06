-- noqa: disable=all
ALTER TABLE "public"."profiles" ALTER COLUMN "email" DROP NOT NULL;

SET check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO "public", "pg_temp"
AS $function$
BEGIN
    UPDATE "public"."profiles"
    SET email = new.email
    WHERE id = new.id AND email IS DISTINCT FROM new.email;
    RETURN new;
END;
$function$;

CREATE TRIGGER "on_auth_user_email_updated" AFTER UPDATE OF "email" ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."sync_profile_email"();

GRANT ALL ON FUNCTION "public"."sync_profile_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_profile_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_profile_email"() TO "service_role";
