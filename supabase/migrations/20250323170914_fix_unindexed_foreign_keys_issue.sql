CREATE INDEX "idx_traits_user_id" ON "public"."traits" ("user_id");

CREATE INDEX "idx_habits_user_id" ON "public"."habits" ("user_id");

CREATE INDEX "idx_occurrences_user_id" ON "public"."occurrences" ("user_id");

CREATE INDEX "idx_notes_user_id" ON "public"."notes" ("user_id");

CREATE INDEX "idx_habits_trait_id" ON "public"."habits" ("trait_id");

CREATE INDEX "idx_occurrences_habit_id" ON "public"."occurrences" ("habit_id");

CREATE INDEX "idx_notes_occurrence_id" ON "public"."notes" ("occurrence_id");
