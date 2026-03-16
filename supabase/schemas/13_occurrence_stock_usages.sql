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

-- Row level security policies
ALTER TABLE "public"."occurrence_stock_usages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."occurrence_stock_usages"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."occurrence_stock_usages"
FOR INSERT TO "authenticated" WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."occurrence_stock_usages"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."occurrence_stock_usages"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."occurrence_stock_usages" TO "anon";
GRANT ALL ON TABLE "public"."occurrence_stock_usages" TO "authenticated";
GRANT ALL ON TABLE "public"."occurrence_stock_usages" TO "service_role";
