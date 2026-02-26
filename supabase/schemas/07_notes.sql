-- Notes entity - represents notes attached to occurrences or time periods

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."notes" (
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL CHECK ("content" <> ''), -- noqa: CV10
    "id" UUID DEFAULT "gen_random_uuid"() NOT NULL,
    "occurrence_id" UUID UNIQUE,
    "period_kind" "public"."note_period_kind",
    "period_date" DATE,
    CONSTRAINT "month_alignment" CHECK (
        (
            ("period_kind" <> 'month'::"public"."note_period_kind") -- noqa: CV10
            OR ("date_trunc"('month'::TEXT, ("period_date")::TIMESTAMP WITH TIME ZONE) = "period_date") -- noqa: CV10
        )
    ),
    CONSTRAINT "note_has_one_target" CHECK (
        (
            (
                (("occurrence_id" IS NOT NULL))::INTEGER
                + ((("period_kind" IS NOT NULL) AND ("period_date" IS NOT NULL)))::INTEGER
            )
            = 1
        )
    ),
    CONSTRAINT "week_alignment" CHECK (
        (
            ("period_kind" <> 'week'::"public"."note_period_kind") -- noqa: CV10
            OR ("date_trunc"('week'::TEXT, ("period_date")::TIMESTAMP WITH TIME ZONE) = "period_date") -- noqa: CV10
        )
    )
);

ALTER TABLE "public"."notes" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."notes"
ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."notes"
ADD CONSTRAINT "notes_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "public"."occurrences" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notes"
ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users" (
    "id"
) ON UPDATE CASCADE ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_notes_user_id" ON "public"."notes" USING "btree" ("user_id");
CREATE INDEX "notes_occurrence_id_idx" ON "public"."notes" USING "btree" ("occurrence_id") WHERE (
    "occurrence_id" IS NOT NULL
);
CREATE INDEX "notes_period_kind_period_date_idx" ON "public"."notes" USING "btree" (
    "period_kind", "period_date"
) WHERE ("period_kind" IS NOT NULL);

-- Updated at trigger
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."notes"
FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Row level security policies
ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."notes"
FOR DELETE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."notes"
FOR INSERT TO "authenticated" WITH CHECK (TRUE);

CREATE POLICY "Enable read access for users based on user_id" ON "public"."notes"
FOR SELECT USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."notes"
FOR UPDATE USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";
