-- Occurrence stock usages entity - links occurrences to stocks with quantity consumed

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."occurrence_stock_usages" (
    "id" UUID DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "occurrence_id" UUID NOT NULL,
    "habit_stock_id" UUID NOT NULL,
    "quantity" INTEGER DEFAULT 1 CHECK ("quantity" > 0)
);

ALTER TABLE "public"."occurrence_stock_usages" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_pkey" PRIMARY KEY ("id");

-- Unique constraint: one usage record per stock per occurrence
ALTER TABLE ONLY "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_occurrence_stock_unique" UNIQUE ("occurrence_id", "habit_stock_id");

-- Foreign keys
ALTER TABLE ONLY "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_occurrence_id_fkey" FOREIGN KEY (
    "occurrence_id"
) REFERENCES "public"."occurrences" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_habit_stock_id_fkey" FOREIGN KEY (
    "habit_stock_id"
) REFERENCES "public"."habit_stocks" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_occurrence_stock_usages_user_id" ON "public"."occurrence_stock_usages" USING "btree" ("user_id");
CREATE INDEX "idx_occurrence_stock_usages_occurrence_id" ON "public"."occurrence_stock_usages" USING "btree" (
    "occurrence_id"
);
CREATE INDEX "idx_occurrence_stock_usages_habit_stock_id" ON "public"."occurrence_stock_usages" USING "btree" (
    "habit_stock_id"
);

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Stock auto-depletion triggers
CREATE OR REPLACE TRIGGER "on_stock_usage_insert"
AFTER INSERT ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_on_usage_insert"();

CREATE OR REPLACE TRIGGER "on_stock_usage_delete"
AFTER DELETE ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_on_usage_delete"();

CREATE OR REPLACE TRIGGER "on_stock_usage_update"
AFTER UPDATE ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_on_usage_update"();

-- Row level security policies
ALTER TABLE "public"."occurrence_stock_usages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."occurrence_stock_usages"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."occurrence_stock_usages"
FOR INSERT TO "authenticated" WITH CHECK (
    (SELECT "auth"."uid"()) = "user_id"
    AND EXISTS (
        SELECT 1 FROM "public"."occurrences"
        WHERE
            "id" = "occurrence_id"
            AND "user_id" = (SELECT "auth"."uid"())
    )
    AND EXISTS (
        SELECT 1 FROM "public"."habit_stocks"
        WHERE
            "id" = "habit_stock_id"
            AND "user_id" = (SELECT "auth"."uid"())
    )
);

CREATE POLICY "Enable read access for users based on user_id" ON "public"."occurrence_stock_usages"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."occurrence_stock_usages"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."occurrence_stock_usages" TO "anon";
GRANT ALL ON TABLE "public"."occurrence_stock_usages" TO "authenticated";
GRANT ALL ON TABLE "public"."occurrence_stock_usages" TO "service_role";

-- noqa: disable=all
-- Creates (no p_occurrence_id) or updates an occurrence with its note, metric values, stock
-- usages, depleted stocks and new photo paths in one transaction, so a failed step leaves nothing
-- half-saved. Usages are matched by stock; the usage triggers still adjust remaining items.
-- SECURITY INVOKER keeps the row level security policies in force.
CREATE OR REPLACE FUNCTION "public"."save_occurrence"(
    "p_occurrence" JSONB,
    "p_note" TEXT,
    "p_metric_values" JSONB,
    "p_stock_usages" JSONB,
    "p_depleted_stock_ids" UUID [],
    "p_photo_paths" TEXT [],
    "p_occurrence_id" UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE "plpgsql"
SECURITY INVOKER
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

ALTER FUNCTION "public"."save_occurrence"(JSONB, TEXT, JSONB, JSONB, UUID [], TEXT [], UUID) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."save_occurrence"(JSONB, TEXT, JSONB, JSONB, UUID [], TEXT [], UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."save_occurrence"(JSONB, TEXT, JSONB, JSONB, UUID [], TEXT [], UUID) FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."save_occurrence"(JSONB, TEXT, JSONB, JSONB, UUID [], TEXT [], UUID) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."save_occurrence"(JSONB, TEXT, JSONB, JSONB, UUID [], TEXT [], UUID) TO "service_role";
-- noqa: enable=all
