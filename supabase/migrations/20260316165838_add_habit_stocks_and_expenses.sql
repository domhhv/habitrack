CREATE TABLE "public"."habit_stock_metric_defaults" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "habit_stock_id" UUID NOT NULL,
    "habit_metric_id" UUID NOT NULL,
    "value" JSONB NOT NULL,
    "should_compound" BOOLEAN NOT NULL DEFAULT false
);


ALTER TABLE "public"."habit_stock_metric_defaults" ENABLE ROW LEVEL SECURITY;


CREATE TABLE "public"."habit_stocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cost" NUMERIC(10, 2),
    "currency" TEXT NOT NULL DEFAULT 'EUR'::TEXT, -- noqa: disable=convention.quoted_literals
    "total_items" INTEGER,
    "remaining_items" INTEGER,
    "is_depleted" BOOLEAN NOT NULL DEFAULT false,
    "purchased_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


ALTER TABLE "public"."habit_stocks" ENABLE ROW LEVEL SECURITY;


CREATE TABLE "public"."occurrence_stock_usages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "occurrence_id" UUID NOT NULL,
    "habit_stock_id" UUID NOT NULL,
    "quantity" INTEGER DEFAULT 1
);


ALTER TABLE "public"."occurrence_stock_usages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."occurrences" ADD COLUMN "cost" NUMERIC(10, 2);

ALTER TABLE "public"."occurrences" ADD COLUMN "currency" TEXT;

ALTER TABLE "public"."profiles" ADD COLUMN "default_currency"
TEXT NOT NULL DEFAULT 'EUR'::TEXT;  -- noqa: disable=convention.quoted_literals

CREATE UNIQUE INDEX "habit_stock_metric_defaults_pkey" ON "public"."habit_stock_metric_defaults" USING "btree" ("id");

CREATE UNIQUE INDEX "habit_stock_metric_defaults_stock_metric_unique"
ON "public"."habit_stock_metric_defaults" USING "btree" (
    "habit_stock_id", "habit_metric_id"
);

CREATE UNIQUE INDEX "habit_stocks_pkey" ON "public"."habit_stocks" USING "btree" ("id");

CREATE INDEX "idx_habit_stock_metric_defaults_habit_metric_id" ON "public"."habit_stock_metric_defaults" USING "btree" (
    "habit_metric_id"
);

CREATE INDEX "idx_habit_stock_metric_defaults_habit_stock_id" ON "public"."habit_stock_metric_defaults" USING "btree" (
    "habit_stock_id"
);

CREATE INDEX "idx_habit_stock_metric_defaults_user_id"
ON "public"."habit_stock_metric_defaults" USING "btree" ("user_id");

CREATE INDEX "idx_habit_stocks_habit_id" ON "public"."habit_stocks" USING "btree" ("habit_id");

CREATE INDEX "idx_habit_stocks_user_id" ON "public"."habit_stocks" USING "btree" ("user_id");

CREATE INDEX "idx_occurrence_stock_usages_habit_stock_id" ON "public"."occurrence_stock_usages"
USING "btree" ("habit_stock_id");

CREATE INDEX "idx_occurrence_stock_usages_occurrence_id" ON "public"."occurrence_stock_usages"
USING "btree" ("occurrence_id");

CREATE INDEX "idx_occurrence_stock_usages_user_id" ON "public"."occurrence_stock_usages" USING "btree" ("user_id");

CREATE UNIQUE INDEX "occurrence_stock_usages_occurrence_stock_unique" ON "public"."occurrence_stock_usages"
USING "btree" (
    "occurrence_id", "habit_stock_id"
);

CREATE UNIQUE INDEX "occurrence_stock_usages_pkey" ON "public"."occurrence_stock_usages" USING "btree" ("id");

ALTER TABLE "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_pkey"
PRIMARY KEY USING INDEX "habit_stock_metric_defaults_pkey";

ALTER TABLE "public"."habit_stocks" ADD CONSTRAINT "habit_stocks_pkey" PRIMARY KEY USING INDEX "habit_stocks_pkey";

ALTER TABLE "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_pkey"
PRIMARY KEY USING INDEX "occurrence_stock_usages_pkey";

ALTER TABLE "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_habit_metric_id_fkey" FOREIGN KEY (
    "habit_metric_id"
) REFERENCES "public"."habit_metrics" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_stock_metric_defaults"
VALIDATE CONSTRAINT "habit_stock_metric_defaults_habit_metric_id_fkey";

ALTER TABLE "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_habit_stock_id_fkey" FOREIGN KEY (
    "habit_stock_id"
) REFERENCES "public"."habit_stocks" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_stock_metric_defaults"
VALIDATE CONSTRAINT "habit_stock_metric_defaults_habit_stock_id_fkey";

ALTER TABLE "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_stock_metric_unique"
UNIQUE USING INDEX "habit_stock_metric_defaults_stock_metric_unique";

ALTER TABLE "public"."habit_stock_metric_defaults"
ADD CONSTRAINT "habit_stock_metric_defaults_user_id_fkey" FOREIGN KEY (
    "user_id"
) REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_stock_metric_defaults" VALIDATE CONSTRAINT "habit_stock_metric_defaults_user_id_fkey";

ALTER TABLE "public"."habit_stocks" ADD CONSTRAINT "habit_stocks_habit_id_fkey" FOREIGN KEY (
    "habit_id"
) REFERENCES "public"."habits" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_stocks" VALIDATE CONSTRAINT "habit_stocks_habit_id_fkey";

ALTER TABLE "public"."habit_stocks"
ADD CONSTRAINT "habit_stocks_name_check"
CHECK (("name" <> ''::TEXT)) NOT VALID; -- noqa: disable=convention.quoted_literals

ALTER TABLE "public"."habit_stocks" VALIDATE CONSTRAINT "habit_stocks_name_check";

ALTER TABLE "public"."habit_stocks" ADD CONSTRAINT "habit_stocks_remaining_items_check" CHECK (
    ("remaining_items" >= 0)
) NOT VALID;

ALTER TABLE "public"."habit_stocks" VALIDATE CONSTRAINT "habit_stocks_remaining_items_check";

ALTER TABLE "public"."habit_stocks"
ADD CONSTRAINT "habit_stocks_total_items_check"
CHECK (("total_items" > 0)) NOT VALID;

ALTER TABLE "public"."habit_stocks" VALIDATE CONSTRAINT "habit_stocks_total_items_check";

ALTER TABLE "public"."habit_stocks" ADD CONSTRAINT "habit_stocks_user_id_fkey" FOREIGN KEY (
    "user_id"
) REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_stocks" VALIDATE CONSTRAINT "habit_stocks_user_id_fkey";

ALTER TABLE "public"."habit_stocks" ADD CONSTRAINT "remaining_le_total" CHECK (
    (("remaining_items" IS null) OR ("total_items" IS null) OR ("remaining_items" <= "total_items"))
) NOT VALID;

ALTER TABLE "public"."habit_stocks" VALIDATE CONSTRAINT "remaining_le_total";

ALTER TABLE "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_habit_stock_id_fkey" FOREIGN KEY (
    "habit_stock_id"
) REFERENCES "public"."habit_stocks" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrence_stock_usages" VALIDATE CONSTRAINT "occurrence_stock_usages_habit_stock_id_fkey";

ALTER TABLE "public"."occurrence_stock_usages" ADD CONSTRAINT "occurrence_stock_usages_occurrence_id_fkey" FOREIGN KEY (
    "occurrence_id"
) REFERENCES "public"."occurrences" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrence_stock_usages" VALIDATE CONSTRAINT "occurrence_stock_usages_occurrence_id_fkey";

ALTER TABLE "public"."occurrence_stock_usages"
ADD CONSTRAINT "occurrence_stock_usages_occurrence_stock_unique"
UNIQUE USING INDEX "occurrence_stock_usages_occurrence_stock_unique";

ALTER TABLE "public"."occurrence_stock_usages" ADD CONSTRAINT "occurrence_stock_usages_quantity_check" CHECK (
    ("quantity" > 0)
) NOT VALID;

ALTER TABLE "public"."occurrence_stock_usages" VALIDATE CONSTRAINT "occurrence_stock_usages_quantity_check";

ALTER TABLE "public"."occurrence_stock_usages" ADD CONSTRAINT "occurrence_stock_usages_user_id_fkey" FOREIGN KEY (
    "user_id"
) REFERENCES "auth"."users" ("id") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrence_stock_usages" VALIDATE CONSTRAINT "occurrence_stock_usages_user_id_fkey";

SET check_function_bodies = "off";

CREATE OR REPLACE FUNCTION "public"."update_stock_on_usage_delete"() -- noqa
RETURNS TRIGGER
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO "public", "pg_temp"
AS $function$
BEGIN
    IF OLD.quantity IS NOT NULL THEN
        UPDATE "public"."habit_stocks"
        SET "remaining_items" = "remaining_items" + OLD.quantity,
            "is_depleted" = (COALESCE("remaining_items", 0) + OLD.quantity) <= 0
        WHERE "id" = OLD.habit_stock_id
          AND "remaining_items" IS NOT NULL;
    END IF;
    RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION "public"."update_stock_on_usage_insert"()
RETURNS TRIGGER
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO "public", "pg_temp"
AS $function$
BEGIN
    IF NEW.quantity IS NOT NULL THEN
        UPDATE "public"."habit_stocks"
        SET "remaining_items" = "remaining_items" - NEW.quantity,
            "is_depleted" = ("remaining_items" - NEW.quantity) <= 0
        WHERE "id" = NEW.habit_stock_id
          AND "remaining_items" IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$function$;

GRANT DELETE ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT INSERT ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT REFERENCES ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT SELECT ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT TRIGGER ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT TRUNCATE ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT UPDATE ON TABLE "public"."habit_stock_metric_defaults" TO "anon";

GRANT DELETE ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT INSERT ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT SELECT ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT UPDATE ON TABLE "public"."habit_stock_metric_defaults" TO "authenticated";

GRANT DELETE ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT INSERT ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT REFERENCES ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT SELECT ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT TRIGGER ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT UPDATE ON TABLE "public"."habit_stock_metric_defaults" TO "service_role";

GRANT DELETE ON TABLE "public"."habit_stocks" TO "anon";

GRANT INSERT ON TABLE "public"."habit_stocks" TO "anon";

GRANT REFERENCES ON TABLE "public"."habit_stocks" TO "anon";

GRANT SELECT ON TABLE "public"."habit_stocks" TO "anon";

GRANT TRIGGER ON TABLE "public"."habit_stocks" TO "anon";

GRANT TRUNCATE ON TABLE "public"."habit_stocks" TO "anon";

GRANT UPDATE ON TABLE "public"."habit_stocks" TO "anon";

GRANT DELETE ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT INSERT ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT SELECT ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT UPDATE ON TABLE "public"."habit_stocks" TO "authenticated";

GRANT DELETE ON TABLE "public"."habit_stocks" TO "service_role";

GRANT INSERT ON TABLE "public"."habit_stocks" TO "service_role";

GRANT REFERENCES ON TABLE "public"."habit_stocks" TO "service_role";

GRANT SELECT ON TABLE "public"."habit_stocks" TO "service_role";

GRANT TRIGGER ON TABLE "public"."habit_stocks" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."habit_stocks" TO "service_role";

GRANT UPDATE ON TABLE "public"."habit_stocks" TO "service_role";

GRANT DELETE ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT INSERT ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT REFERENCES ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT SELECT ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT TRIGGER ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT TRUNCATE ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT UPDATE ON TABLE "public"."occurrence_stock_usages" TO "anon";

GRANT DELETE ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT INSERT ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT SELECT ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT UPDATE ON TABLE "public"."occurrence_stock_usages" TO "authenticated";

GRANT DELETE ON TABLE "public"."occurrence_stock_usages" TO "service_role";

GRANT INSERT ON TABLE "public"."occurrence_stock_usages" TO "service_role";

GRANT REFERENCES ON TABLE "public"."occurrence_stock_usages" TO "service_role";

GRANT SELECT ON TABLE "public"."occurrence_stock_usages" TO "service_role";

GRANT TRIGGER ON TABLE "public"."occurrence_stock_usages" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."occurrence_stock_usages" TO "service_role";

GRANT UPDATE ON TABLE "public"."occurrence_stock_usages" TO "service_role";


CREATE POLICY "Enable delete for users based on user_id"
ON "public"."habit_stock_metric_defaults"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable insert for authenticated users only"
ON "public"."habit_stock_metric_defaults"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable read access for users based on user_id"
ON "public"."habit_stock_metric_defaults"
AS PERMISSIVE
FOR SELECT
TO public
USING (((SELECT auth.uid() AS uid) = user_id));


CREATE POLICY "Enable update for users based on user_id"
ON "public"."habit_stock_metric_defaults"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable delete for users based on user_id"
ON "public"."habit_stocks"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable insert for authenticated users only"
ON "public"."habit_stocks"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable read access for users based on user_id"
ON "public"."habit_stocks"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable update for users based on user_id"
ON "public"."habit_stocks"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable delete for users based on user_id"
ON "public"."occurrence_stock_usages"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable insert for authenticated users only"
ON "public"."occurrence_stock_usages"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable read access for users based on user_id"
ON "public"."occurrence_stock_usages"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE POLICY "Enable update for users based on user_id"
ON "public"."occurrence_stock_usages"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));


CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."habit_stock_metric_defaults"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."habit_stocks"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "on_stock_usage_delete" AFTER DELETE ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_on_usage_delete"();

CREATE TRIGGER "on_stock_usage_insert" AFTER INSERT ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_on_usage_insert"();

CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."occurrence_stock_usages"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
