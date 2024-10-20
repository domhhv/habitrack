alter table "public"."habits" alter column "user_id" set not null;

alter table "public"."occurrences" alter column "timestamp" set not null;

alter table "public"."traits" alter column "color" set not null;

alter table "public"."accounts" alter column "email" set not null;

CREATE UNIQUE INDEX habits_id_key ON public.habits USING btree (id);

CREATE UNIQUE INDEX notes_id_key ON public.notes USING btree (id);

CREATE UNIQUE INDEX occurrences_id_key ON public.occurrences USING btree (id);

CREATE UNIQUE INDEX traits_id_key ON public.traits USING btree (id);

alter table "public"."habits" add constraint "habits_id_key" UNIQUE using index "habits_id_key";

alter table "public"."notes" add constraint "notes_id_key" UNIQUE using index "notes_id_key";

alter table "public"."occurrences" add constraint "occurrences_id_key" UNIQUE using index "occurrences_id_key";

alter table "public"."traits" add constraint "traits_id_key" UNIQUE using index "traits_id_key";
