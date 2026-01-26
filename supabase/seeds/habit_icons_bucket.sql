CREATE POLICY "Anyone can upload a habit icon"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (("bucket_id" = 'habit_icons'::TEXT)); -- noqa: CV10

CREATE POLICY "Habit icon images are publicly accessible"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (("bucket_id" = 'habit_icons'::TEXT)); -- noqa: CV10

CREATE POLICY "Habit icon images can be deleted 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (("bucket_id" = 'habit_icons'::TEXT)); -- noqa: disable=convention.quoted_literals

CREATE POLICY "Habit icon images can be updated 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (("bucket_id" = 'habit_icons'::TEXT)); -- noqa: disable=convention.quoted_literals
