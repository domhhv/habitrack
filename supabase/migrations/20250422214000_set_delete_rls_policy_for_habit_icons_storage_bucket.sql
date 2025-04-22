CREATE POLICY "Habit icon images can be deleted 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (("bucket_id" = 'habit_icons'::text)); -- noqa: disable=convention.quoted_literals

CREATE POLICY "Habit icon images can be updated 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (("bucket_id" = 'habit_icons'::text)); -- noqa: disable=convention.quoted_literals
