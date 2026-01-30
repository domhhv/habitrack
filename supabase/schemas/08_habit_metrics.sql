-- Habit metrics entity - represents metric definitions attached to habits

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."habit_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "habit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL CHECK ("name" <> ''), -- noqa: CV10
    "type" "public"."metric_type" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL, -- noqa: CV10
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."habit_metrics" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_pkey" PRIMARY KEY ("id");

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

CREATE POLICY "Enable insert for authenticated users only" ON "public"."habit_metrics"
FOR INSERT TO "authenticated" WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id" ON "public"."habit_metrics"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."habit_metrics"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."habit_metrics" TO "anon";
GRANT ALL ON TABLE "public"."habit_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."habit_metrics" TO "service_role";
