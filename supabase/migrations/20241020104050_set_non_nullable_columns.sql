ALTER TABLE "public"."habits" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "public"."occurrences" ALTER COLUMN "timestamp" SET NOT NULL;

ALTER TABLE "public"."traits" ALTER COLUMN "color" SET NOT NULL;

ALTER TABLE "public"."accounts" ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "habits_id_key" ON "public"."habits" USING "btree" ("id");

CREATE UNIQUE INDEX "notes_id_key" ON "public"."notes" USING "btree" ("id");

CREATE UNIQUE INDEX "occurrences_id_key" ON "public"."occurrences" USING "btree" ("id");

CREATE UNIQUE INDEX "traits_id_key" ON "public"."traits" USING "btree" ("id");

ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_id_key" UNIQUE USING INDEX "habits_id_key";

ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_id_key" UNIQUE USING INDEX "notes_id_key";

ALTER TABLE "public"."occurrences" ADD CONSTRAINT "occurrences_id_key" UNIQUE USING INDEX "occurrences_id_key";

ALTER TABLE "public"."traits" ADD CONSTRAINT "traits_id_key" UNIQUE USING INDEX "traits_id_key";
