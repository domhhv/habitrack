CREATE TYPE "public"."metric_type" AS ENUM (
    'number', 'duration', 'percentage', 'scale', 'range', 'choice', 'boolean', 'text'
);

CREATE TABLE "public"."habit_metrics" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone,
    "user_id" uuid NOT NULL,
    "habit_id" uuid NOT NULL,
    "name" text NOT NULL,
    "type" "public"."metric_type" NOT NULL,
    "config" jsonb NOT NULL DEFAULT '{}'::"jsonb", -- noqa: CV10
    "sort_order" integer NOT NULL DEFAULT 0,
    "is_required" boolean NOT NULL DEFAULT false
);

ALTER TABLE "public"."habit_metrics" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."occurrence_metric_values" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone,
    "user_id" uuid NOT NULL,
    "occurrence_id" uuid NOT NULL,
    "habit_metric_id" uuid NOT NULL,
    "value" jsonb NOT NULL
);

ALTER TABLE "public"."occurrence_metric_values" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX "habit_metrics_pkey"
ON "public"."habit_metrics" USING "btree" ("id");

CREATE INDEX "idx_habit_metrics_habit_id"
ON "public"."habit_metrics" USING "btree" ("habit_id");

CREATE INDEX "idx_habit_metrics_user_id"
ON "public"."habit_metrics" USING "btree" ("user_id");

CREATE INDEX "idx_occurrence_metric_values_habit_metric_id"
ON "public"."occurrence_metric_values" USING "btree" (
    "habit_metric_id"
);

CREATE INDEX "idx_occurrence_metric_values_occurrence_id"
ON "public"."occurrence_metric_values" USING "btree" ("occurrence_id");

CREATE INDEX "idx_occurrence_metric_values_user_id"
ON "public"."occurrence_metric_values" USING "btree" ("user_id");

CREATE UNIQUE INDEX "occurrence_metric_values_occurrence_metric_unique"
ON "public"."occurrence_metric_values" USING "btree" (
    "occurrence_id", "habit_metric_id"
);

CREATE UNIQUE INDEX "occurrence_metric_values_pkey"
ON "public"."occurrence_metric_values" USING "btree" ("id");

ALTER TABLE "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_pkey"
PRIMARY KEY USING INDEX "habit_metrics_pkey";

ALTER TABLE "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_pkey"
PRIMARY KEY USING INDEX "occurrence_metric_values_pkey";

ALTER TABLE "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_habit_id_fkey" FOREIGN KEY (
    "habit_id"
) REFERENCES "public"."habits" ("id")
ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_metrics"
VALIDATE CONSTRAINT "habit_metrics_habit_id_fkey";

ALTER TABLE "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_name_check"
CHECK (("name" <> '')) NOT VALID; -- noqa: CV10

ALTER TABLE "public"."habit_metrics"
VALIDATE CONSTRAINT "habit_metrics_name_check";

ALTER TABLE "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_user_id_fkey" FOREIGN KEY (
    "user_id"
) REFERENCES "auth"."users" ("id")
ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."habit_metrics"
VALIDATE CONSTRAINT "habit_metrics_user_id_fkey";

ALTER TABLE "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_habit_metric_id_fkey"
FOREIGN KEY (
    "habit_metric_id"
) REFERENCES "public"."habit_metrics" ("id")
ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrence_metric_values"
VALIDATE CONSTRAINT "occurrence_metric_values_habit_metric_id_fkey";

ALTER TABLE "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_occurrence_id_fkey"
FOREIGN KEY (
    "occurrence_id"
) REFERENCES "public"."occurrences" ("id")
ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrence_metric_values"
VALIDATE CONSTRAINT "occurrence_metric_values_occurrence_id_fkey";

ALTER TABLE "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_occurrence_metric_unique"
UNIQUE USING INDEX "occurrence_metric_values_occurrence_metric_unique";

ALTER TABLE "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_user_id_fkey" FOREIGN KEY (
    "user_id"
) REFERENCES "auth"."users" ("id")
ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."occurrence_metric_values"
VALIDATE CONSTRAINT "occurrence_metric_values_user_id_fkey";

GRANT DELETE ON TABLE "public"."habit_metrics" TO "anon";

GRANT INSERT ON TABLE "public"."habit_metrics" TO "anon";

GRANT REFERENCES ON TABLE "public"."habit_metrics" TO "anon";

GRANT SELECT ON TABLE "public"."habit_metrics" TO "anon";

GRANT TRIGGER ON TABLE "public"."habit_metrics" TO "anon";

GRANT UPDATE ON TABLE "public"."habit_metrics" TO "anon";

GRANT DELETE ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT INSERT ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT SELECT ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT UPDATE ON TABLE "public"."habit_metrics" TO "authenticated";

GRANT DELETE ON TABLE "public"."habit_metrics" TO "service_role";

GRANT INSERT ON TABLE "public"."habit_metrics" TO "service_role";

GRANT REFERENCES ON TABLE "public"."habit_metrics" TO "service_role";

GRANT SELECT ON TABLE "public"."habit_metrics" TO "service_role";

GRANT TRIGGER ON TABLE "public"."habit_metrics" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."habit_metrics" TO "service_role";

GRANT UPDATE ON TABLE "public"."habit_metrics" TO "service_role";

GRANT DELETE ON TABLE "public"."occurrence_metric_values" TO "anon";

GRANT INSERT ON TABLE "public"."occurrence_metric_values" TO "anon";

GRANT REFERENCES ON TABLE "public"."occurrence_metric_values" TO "anon";

GRANT SELECT ON TABLE "public"."occurrence_metric_values" TO "anon";

GRANT TRIGGER ON TABLE "public"."occurrence_metric_values" TO "anon";

GRANT UPDATE ON TABLE "public"."occurrence_metric_values" TO "anon";

GRANT DELETE ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT INSERT ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT SELECT ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT UPDATE ON TABLE "public"."occurrence_metric_values" TO "authenticated";

GRANT DELETE ON TABLE "public"."occurrence_metric_values" TO "service_role";

GRANT INSERT ON TABLE "public"."occurrence_metric_values" TO "service_role";

GRANT REFERENCES ON TABLE "public"."occurrence_metric_values" TO "service_role";

GRANT SELECT ON TABLE "public"."occurrence_metric_values" TO "service_role";

GRANT TRIGGER ON TABLE "public"."occurrence_metric_values" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."occurrence_metric_values" TO "service_role";

GRANT UPDATE ON TABLE "public"."occurrence_metric_values" TO "service_role";

CREATE POLICY "Enable delete for users based on user_id"
ON "public"."habit_metrics"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."habit_metrics"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id"
ON "public"."habit_metrics"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id"
ON "public"."habit_metrics"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable delete for users based on user_id"
ON "public"."occurrence_metric_values"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."occurrence_metric_values"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id"
ON "public"."occurrence_metric_values"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id"
ON "public"."occurrence_metric_values"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE TRIGGER "set_updated_at" BEFORE UPDATE
ON "public"."habit_metrics"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "set_updated_at" BEFORE UPDATE
ON "public"."occurrence_metric_values"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
