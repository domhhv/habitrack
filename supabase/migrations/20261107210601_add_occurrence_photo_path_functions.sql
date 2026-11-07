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
