-- noqa: disable=all
SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_habit_with_metrics (
  p_habit   jsonb,
  p_metrics jsonb
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
DECLARE
    "v_habit_id" UUID;
BEGIN
    INSERT INTO "public"."habits" ("user_id", "name", "description", "trait_id", "icon_path")
    VALUES (
        (SELECT "auth"."uid"()),
        "p_habit" ->> 'name',
        "p_habit" ->> 'description',
        ("p_habit" ->> 'trait_id')::UUID,
        "p_habit" ->> 'icon_path'
    )
    RETURNING "id" INTO "v_habit_id";

    PERFORM "public"."save_habit_metrics"("v_habit_id", '{}', "p_metrics", '[]'::JSONB);

    RETURN "v_habit_id";
END;
$function$;

REVOKE ALL ON FUNCTION "public"."create_habit_with_metrics"(jsonb, jsonb) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.save_habit_metrics (
  p_habit_id    uuid,
  p_removed_ids uuid[],
  p_added       jsonb,
  p_updated     jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
BEGIN
    DELETE FROM "public"."habit_metrics"
    WHERE "habit_id" = "p_habit_id"
      AND "id" = ANY(COALESCE("p_removed_ids", '{}'));

    INSERT INTO "public"."habit_metrics" (
        "user_id", "habit_id", "name", "type", "config", "is_required", "sort_order"
    )
    SELECT
        (SELECT "auth"."uid"()),
        "p_habit_id",
        "metric" ->> 'name',
        ("metric" ->> 'type')::"public"."metric_type",
        COALESCE("metric" -> 'config', '{}'::JSONB),
        COALESCE(("metric" ->> 'is_required')::BOOLEAN, false),
        COALESCE(("metric" ->> 'sort_order')::INTEGER, 0)
    FROM JSONB_ARRAY_ELEMENTS(COALESCE("p_added", '[]'::JSONB)) AS "metric";

    UPDATE "public"."habit_metrics" AS "habit_metric"
    SET "name" = "metric" ->> 'name',
        "type" = ("metric" ->> 'type')::"public"."metric_type",
        "config" = COALESCE("metric" -> 'config', '{}'::JSONB),
        "is_required" = COALESCE(("metric" ->> 'is_required')::BOOLEAN, false),
        "sort_order" = COALESCE(("metric" ->> 'sort_order')::INTEGER, 0)
    FROM JSONB_ARRAY_ELEMENTS(COALESCE("p_updated", '[]'::JSONB)) AS "metric"
    WHERE "habit_metric"."id" = ("metric" ->> 'id')::UUID
      AND "habit_metric"."habit_id" = "p_habit_id";
END;
$function$;

REVOKE ALL ON FUNCTION "public"."save_habit_metrics"(uuid, uuid[], jsonb, jsonb) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.save_occurrence (
  p_occurrence         jsonb,
  p_note               text,
  p_metric_values      jsonb,
  p_stock_usages       jsonb,
  p_depleted_stock_ids uuid[],
  p_photo_paths        text[],
  p_occurrence_id      uuid   DEFAULT NULL::uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
DECLARE
    "v_user_id" UUID := (SELECT "auth"."uid"());
    "v_occurrence_id" UUID;
    "v_stock_usages" JSONB := COALESCE("p_stock_usages", '[]'::JSONB);
BEGIN
    IF "p_occurrence_id" IS NULL THEN
        INSERT INTO "public"."occurrences" (
            "user_id", "habit_id", "occurred_at", "has_specific_time", "time_zone", "cost", "currency", "photo_paths"
        )
        VALUES (
            "v_user_id",
            ("p_occurrence" ->> 'habit_id')::UUID,
            ("p_occurrence" ->> 'occurred_at')::TIMESTAMPTZ,
            COALESCE(("p_occurrence" ->> 'has_specific_time')::BOOLEAN, true),
            COALESCE("p_occurrence" ->> 'time_zone', 'UTC'),
            ("p_occurrence" ->> 'cost')::NUMERIC,
            "p_occurrence" ->> 'currency',
            NULLIF(COALESCE("p_photo_paths", '{}'), '{}')
        )
        RETURNING "id" INTO "v_occurrence_id";
    ELSE
        UPDATE "public"."occurrences"
        SET "habit_id" = ("p_occurrence" ->> 'habit_id')::UUID,
            "occurred_at" = ("p_occurrence" ->> 'occurred_at')::TIMESTAMPTZ,
            "has_specific_time" = COALESCE(("p_occurrence" ->> 'has_specific_time')::BOOLEAN, true),
            "cost" = ("p_occurrence" ->> 'cost')::NUMERIC,
            "currency" = "p_occurrence" ->> 'currency',
            "photo_paths" = NULLIF(COALESCE("photo_paths", '{}') || COALESCE("p_photo_paths", '{}'), '{}')
        WHERE "id" = "p_occurrence_id"
        RETURNING "id" INTO "v_occurrence_id";

        IF "v_occurrence_id" IS NULL THEN
            RAISE EXCEPTION 'This entry no longer exists' USING ERRCODE = 'P0002';
        END IF;
    END IF;

    DELETE FROM "public"."occurrence_stock_usages" AS "usage"
    WHERE "usage"."occurrence_id" = "v_occurrence_id"
      AND NOT EXISTS (
          SELECT 1
          FROM JSONB_ARRAY_ELEMENTS("v_stock_usages") AS "next_usage"
          WHERE ("next_usage" ->> 'habit_stock_id')::UUID = "usage"."habit_stock_id"
      );

    INSERT INTO "public"."occurrence_stock_usages" ("user_id", "occurrence_id", "habit_stock_id", "quantity")
    SELECT
        "v_user_id",
        "v_occurrence_id",
        ("next_usage" ->> 'habit_stock_id')::UUID,
        ("next_usage" ->> 'quantity')::INTEGER
    FROM JSONB_ARRAY_ELEMENTS("v_stock_usages") AS "next_usage"
    ON CONFLICT ("occurrence_id", "habit_stock_id") DO UPDATE
    SET "quantity" = EXCLUDED."quantity"
    WHERE "occurrence_stock_usages"."quantity" IS DISTINCT FROM EXCLUDED."quantity";

    UPDATE "public"."habit_stocks"
    SET "is_depleted" = true
    WHERE "id" = ANY(COALESCE("p_depleted_stock_ids", '{}'));

    IF COALESCE("p_note", '') <> '' THEN
        INSERT INTO "public"."notes" ("user_id", "occurrence_id", "content")
        VALUES ("v_user_id", "v_occurrence_id", "p_note")
        ON CONFLICT ("occurrence_id") DO UPDATE
        SET "content" = EXCLUDED."content";
    ELSE
        DELETE FROM "public"."notes"
        WHERE "occurrence_id" = "v_occurrence_id";
    END IF;

    INSERT INTO "public"."occurrence_metric_values" ("user_id", "occurrence_id", "habit_metric_id", "value")
    SELECT "v_user_id", "v_occurrence_id", "metric_value"."key"::UUID, "metric_value"."value"
    FROM JSONB_EACH(COALESCE("p_metric_values", '{}'::JSONB)) AS "metric_value"
    ON CONFLICT ("occurrence_id", "habit_metric_id") DO UPDATE
    SET "value" = EXCLUDED."value";

    RETURN "v_occurrence_id";
END;
$function$;

REVOKE ALL ON FUNCTION "public"."save_occurrence"(jsonb, text, jsonb, jsonb, uuid[], text[], uuid) FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.save_stock (
  p_habit_id        uuid,
  p_stock           jsonb,
  p_metric_defaults jsonb DEFAULT NULL::jsonb,
  p_stock_id        uuid  DEFAULT NULL::uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
DECLARE
    "v_stock_id" UUID;
BEGIN
    IF "p_stock_id" IS NULL THEN
        INSERT INTO "public"."habit_stocks" (
            "user_id", "habit_id", "name", "cost", "currency", "total_items", "remaining_items", "is_depleted"
        )
        VALUES (
            (SELECT "auth"."uid"()),
            "p_habit_id",
            "p_stock" ->> 'name',
            ("p_stock" ->> 'cost')::NUMERIC,
            "p_stock" ->> 'currency',
            ("p_stock" ->> 'total_items')::INTEGER,
            ("p_stock" ->> 'remaining_items')::INTEGER,
            false
        )
        RETURNING "id" INTO "v_stock_id";
    ELSE
        UPDATE "public"."habit_stocks"
        SET "name" = "p_stock" ->> 'name',
            "cost" = ("p_stock" ->> 'cost')::NUMERIC,
            "currency" = "p_stock" ->> 'currency',
            "total_items" = ("p_stock" ->> 'total_items')::INTEGER,
            "remaining_items" = ("p_stock" ->> 'remaining_items')::INTEGER
        WHERE "id" = "p_stock_id"
          AND "habit_id" = "p_habit_id"
        RETURNING "id" INTO "v_stock_id";

        IF "v_stock_id" IS NULL THEN
            RAISE EXCEPTION 'This stock no longer exists' USING ERRCODE = 'P0002';
        END IF;
    END IF;

    IF "p_metric_defaults" IS NOT NULL THEN
        DELETE FROM "public"."habit_stock_metric_defaults"
        WHERE "habit_stock_id" = "v_stock_id";

        INSERT INTO "public"."habit_stock_metric_defaults" (
            "user_id", "habit_stock_id", "habit_metric_id", "value", "should_compound"
        )
        SELECT
            (SELECT "auth"."uid"()),
            "v_stock_id",
            ("metric_default" ->> 'habit_metric_id')::UUID,
            "metric_default" -> 'value',
            COALESCE(("metric_default" ->> 'should_compound')::BOOLEAN, false)
        FROM JSONB_ARRAY_ELEMENTS("p_metric_defaults") AS "metric_default";
    END IF;

    RETURN "v_stock_id";
END;
$function$;

REVOKE ALL ON FUNCTION "public"."save_stock"(uuid, jsonb, jsonb, uuid) FROM PUBLIC, "anon";

GRANT EXECUTE ON FUNCTION "public"."create_habit_with_metrics"(jsonb, jsonb) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."create_habit_with_metrics"(jsonb, jsonb) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."save_habit_metrics"(uuid, uuid[], jsonb, jsonb) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."save_habit_metrics"(uuid, uuid[], jsonb, jsonb) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."save_occurrence"(jsonb, text, jsonb, jsonb, uuid[], text[], uuid) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."save_occurrence"(jsonb, text, jsonb, jsonb, uuid[], text[], uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."save_stock"(uuid, jsonb, jsonb, uuid) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."save_stock"(uuid, jsonb, jsonb, uuid) TO "service_role";
-- noqa: enable=all
