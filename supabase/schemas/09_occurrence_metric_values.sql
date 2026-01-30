-- Occurrence metric values entity - represents metric values recorded per occurrence

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."occurrence_metric_values" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "occurrence_id" "uuid" NOT NULL,
    "habit_metric_id" "uuid" NOT NULL,
    "value" "jsonb" NOT NULL
);

ALTER TABLE "public"."occurrence_metric_values" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_pkey" PRIMARY KEY ("id");

-- Unique constraint: one value per metric per occurrence
ALTER TABLE ONLY "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_occurrence_metric_unique" UNIQUE ("occurrence_id", "habit_metric_id");

-- Foreign keys
ALTER TABLE ONLY "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_occurrence_id_fkey" FOREIGN KEY (
    "occurrence_id"
) REFERENCES "public"."occurrences" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_habit_metric_id_fkey" FOREIGN KEY (
    "habit_metric_id"
) REFERENCES "public"."habit_metrics" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."occurrence_metric_values"
ADD CONSTRAINT "occurrence_metric_values_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_occurrence_metric_values_user_id" ON "public"."occurrence_metric_values" USING "btree" ("user_id");
CREATE INDEX "idx_occurrence_metric_values_occurrence_id" ON "public"."occurrence_metric_values" USING "btree" (
    "occurrence_id"
);
CREATE INDEX "idx_occurrence_metric_values_habit_metric_id" ON "public"."occurrence_metric_values" USING "btree" (
    "habit_metric_id"
);

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."occurrence_metric_values"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."occurrence_metric_values" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."occurrence_metric_values"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."occurrence_metric_values"
FOR INSERT TO "authenticated" WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."occurrence_metric_values"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."occurrence_metric_values"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."occurrence_metric_values" TO "anon";
GRANT ALL ON TABLE "public"."occurrence_metric_values" TO "authenticated";
GRANT ALL ON TABLE "public"."occurrence_metric_values" TO "service_role";
