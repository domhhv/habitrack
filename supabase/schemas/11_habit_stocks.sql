-- Habit stocks entity - represents purchased batches/packs of items for a habit

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."habit_stocks" (
    "id" UUID DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "name" TEXT NOT NULL CHECK ("name" <> ''), -- noqa: CV10
    "cost" NUMERIC(10, 2),
    "currency" TEXT NOT NULL DEFAULT 'EUR', -- noqa: disable=convention.quoted_literals
    "total_items" INTEGER CHECK ("total_items" > 0),
    "remaining_items" INTEGER CHECK ("remaining_items" >= 0),
    "is_depleted" BOOLEAN DEFAULT false NOT NULL,
    "purchased_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,

    CONSTRAINT "remaining_le_total" CHECK (
        "remaining_items" IS null OR "total_items" IS null
        OR "remaining_items" <= "total_items"
    )
);

ALTER TABLE "public"."habit_stocks" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."habit_stocks"
ADD CONSTRAINT "habit_stocks_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."habit_stocks"
ADD CONSTRAINT "habit_stocks_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."habit_stocks"
ADD CONSTRAINT "habit_stocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_habit_stocks_user_id" ON "public"."habit_stocks" USING "btree" ("user_id");
CREATE INDEX "idx_habit_stocks_habit_id" ON "public"."habit_stocks" USING "btree" ("habit_id");

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."habit_stocks"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."habit_stocks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."habit_stocks"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."habit_stocks"
FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for users based on user_id" ON "public"."habit_stocks"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."habit_stocks"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."habit_stocks" TO "anon";
GRANT ALL ON TABLE "public"."habit_stocks" TO "authenticated";
GRANT ALL ON TABLE "public"."habit_stocks" TO "service_role";
