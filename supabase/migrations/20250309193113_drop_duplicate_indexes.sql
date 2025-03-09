ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS "habits_id_key";

DROP INDEX IF EXISTS public.habits_id_key;

ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS "notes_id_key";

DROP INDEX IF EXISTS public.notes_id_key;

ALTER TABLE public.occurrences DROP CONSTRAINT IF EXISTS "occurrences_id_key";

DROP INDEX IF EXISTS public.occurrences_id_key;

ALTER TABLE public.traits DROP CONSTRAINT IF EXISTS "traits_id_key";

DROP INDEX IF EXISTS public.traits_id_key;
