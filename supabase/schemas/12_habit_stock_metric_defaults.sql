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
