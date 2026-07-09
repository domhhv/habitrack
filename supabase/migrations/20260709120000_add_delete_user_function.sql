-- noqa: disable=all
CREATE OR REPLACE FUNCTION "public"."delete_user"()
RETURNS VOID
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path TO "public", "pg_temp"
AS $function$
DECLARE
    current_user_id UUID := "auth"."uid"();
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
    END IF;

    DELETE FROM "auth"."users"
    WHERE "id" = current_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002';
    END IF;
END;
$function$;

ALTER FUNCTION "public"."delete_user"() OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."delete_user"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."delete_user"() FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."delete_user"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."delete_user"() TO "service_role";
