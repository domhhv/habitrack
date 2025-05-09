-- Notes entity - represents notes attached to occurrences or time periods

-- Table definition
CREATE TABLE IF NOT EXISTS "public"."notes" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL CHECK ("content" <> ''), -- noqa: CV10
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "occurrence_id" "uuid",
    "period_kind" "public"."note_period_kind",
    "period_date" "date",
    CONSTRAINT "month_alignment" CHECK (
        (
            ("period_kind" <> 'month'::"public"."note_period_kind") -- noqa: CV10
            OR ("date_trunc"('month'::"text", ("period_date")::timestamp with time zone) = "period_date") -- noqa: CV10
        )
    ),
    CONSTRAINT "note_has_one_target" CHECK (
        (
            (
                (("occurrence_id" IS NOT NULL))::integer
                + ((("period_kind" IS NOT NULL) AND ("period_date" IS NOT NULL)))::integer
            )
            = 1
        )
    ),
    CONSTRAINT "week_alignment" CHECK (
        (
            ("period_kind" <> 'week'::"public"."note_period_kind") -- noqa: CV10
            OR ("date_trunc"('week'::"text", ("period_date")::timestamp with time zone) = "period_date") -- noqa: CV10
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
