-- Habit stock metric defaults entity - predefined metric values per stock for auto-populating occurrence metrics

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."habit_stock_metric_defaults" (
    "id" UUID DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "habit_stock_id" UUID NOT NULL,
    "habit_metric_id" UUID NOT NULL,
    "value" JSONB NOT NULL,
    "should_compound" BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE "public"."habit_stock_metric_defaults" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_pkey" PRIMARY KEY ("id");

-- Unique constraint: one default value per metric per stock
ALTER TABLE ONLY "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_stock_metric_unique" UNIQUE ("habit_stock_id", "habit_metric_id");

-- Foreign keys
ALTER TABLE ONLY "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_habit_stock_id_fkey" FOREIGN KEY (
    "habit_stock_id"
) REFERENCES "public"."habit_stocks" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_habit_metric_id_fkey" FOREIGN KEY (
    "habit_metric_id"
) REFERENCES "public"."habit_metrics" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_habit_stock_metric_defaults_user_id" ON "public"."habit_stock_metric_defaults" USING "btree" (
    "user_id"
);
CREATE INDEX "idx_habit_stock_metric_defaults_habit_stock_id" ON "public"."habit_stock_metric_defaults" USING "btree" (
    "habit_stock_id"
);
CREATE INDEX "idx_habit_stock_metric_defaults_habit_metric_id" ON "public"."habit_stock_metric_defaults" USING "btree" (
    "habit_metric_id"
);

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."habit_stock_metric_defaults"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Validate value shape against the metric type
CREATE OR REPLACE TRIGGER "validate_metric_value" BEFORE INSERT OR UPDATE ON "public"."habit_stock_metric_defaults"
FOR EACH ROW EXECUTE FUNCTION "public"."validate_metric_value"();

-- Row level security policies
ALTER TABLE "public"."habit_stock_metric_defaults" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."habit_stock_metric_defaults"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."habit_stock_metric_defaults"
FOR INSERT TO "authenticated" WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."habit_stock_metric_defaults"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."habit_stock_metric_defaults"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."habit_stock_metric_defaults" TO "anon";
GRANT ALL ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";
GRANT ALL ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

-- noqa: disable=all
-- Creates or updates a stock and, when p_metric_defaults is given, replaces its metric defaults,
-- all in one transaction. SECURITY INVOKER keeps the row level security policies in force.
CREATE OR REPLACE FUNCTION "public"."save_stock"(
    "p_habit_id" UUID,
    "p_stock" JSONB,
    "p_metric_defaults" JSONB DEFAULT NULL,
    "p_stock_id" UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE "plpgsql"
SECURITY INVOKER
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

ALTER FUNCTION "public"."save_stock"(UUID, JSONB, JSONB, UUID) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."save_stock"(UUID, JSONB, JSONB, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."save_stock"(UUID, JSONB, JSONB, UUID) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."save_stock"(UUID, JSONB, JSONB, UUID) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."save_stock"(UUID, JSONB, JSONB, UUID) TO "service_role";
-- noqa: enable=all
