-- Habit metrics entity - represents metric definitions attached to habits

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."habit_metrics" (
    "id" UUID DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "name" TEXT NOT NULL CHECK ("name" <> ''), -- noqa: CV10
    "type" "public"."metric_type" NOT NULL,
    "config" JSONB DEFAULT '{}'::JSONB NOT NULL, -- noqa: CV10
    "sort_order" INTEGER DEFAULT 0 NOT NULL,
    "is_required" BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE "public"."habit_metrics" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_pkey" PRIMARY KEY ("id");

-- Validate that config shape matches the metric type. Types with all-optional config
-- (number/duration/range/boolean/text) only require an object; scale/choice require their
-- structural keys; percentage must be empty.
-- noqa: disable=all
ALTER TABLE "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_config_shape_check" CHECK (
    jsonb_typeof(config) = 'object'
    AND CASE type
        WHEN 'scale' THEN (
            config ? 'min' AND config ? 'max' AND config ? 'step'
            AND jsonb_typeof(config -> 'min') = 'number'
            AND jsonb_typeof(config -> 'max') = 'number'
            AND jsonb_typeof(config -> 'step') = 'number'
        )
        WHEN 'choice' THEN (
            config ? 'options'
            AND jsonb_typeof(config -> 'options') = 'array'
            AND NOT jsonb_path_exists(config, '$.options[*] ? (@.type() != "string")')
        )
        WHEN 'percentage' THEN (config = '{}'::jsonb)
        ELSE TRUE
    END
);
-- noqa: enable=all

-- Foreign keys
ALTER TABLE ONLY "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_habit_metrics_user_id" ON "public"."habit_metrics" USING "btree" ("user_id");
CREATE INDEX "idx_habit_metrics_habit_id" ON "public"."habit_metrics" USING "btree" ("habit_id");

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."habit_metrics"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."habit_metrics" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."habit_metrics"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."habit_metrics"
FOR INSERT WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."habit_metrics"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."habit_metrics"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."habit_metrics" TO "anon";
GRANT ALL ON TABLE "public"."habit_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."habit_metrics" TO "service_role";

-- noqa: disable=all
-- Habit metric writes: each runs in one transaction, so a failed metric never leaves a habit or a
-- half-saved set of definitions behind. SECURITY INVOKER keeps the row level security policies in force.
CREATE OR REPLACE FUNCTION "public"."save_habit_metrics"(
    "p_habit_id" UUID,
    "p_removed_ids" UUID [],
    "p_added" JSONB,
    "p_updated" JSONB
)
RETURNS VOID
LANGUAGE "plpgsql"
SECURITY INVOKER
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

ALTER FUNCTION "public"."save_habit_metrics"(UUID, UUID [], JSONB, JSONB) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_habit_with_metrics"(
    "p_habit" JSONB,
    "p_metrics" JSONB
)
RETURNS UUID
LANGUAGE "plpgsql"
SECURITY INVOKER
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

ALTER FUNCTION "public"."create_habit_with_metrics"(JSONB, JSONB) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."save_habit_metrics"(UUID, UUID [], JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."save_habit_metrics"(UUID, UUID [], JSONB, JSONB) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."save_habit_metrics"(UUID, UUID [], JSONB, JSONB) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."save_habit_metrics"(UUID, UUID [], JSONB, JSONB) TO "service_role";

REVOKE ALL ON FUNCTION "public"."create_habit_with_metrics"(JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."create_habit_with_metrics"(JSONB, JSONB) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."create_habit_with_metrics"(JSONB, JSONB) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."create_habit_with_metrics"(JSONB, JSONB) TO "service_role";
-- noqa: enable=all
