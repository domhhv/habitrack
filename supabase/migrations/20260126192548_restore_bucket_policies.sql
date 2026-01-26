DROP EXTENSION IF EXISTS "pg_net";

CREATE POLICY "Anyone can upload a habit icon 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (("bucket_id" = 'habit_icons'::TEXT)); -- noqa: disable=convention.quoted_literals

CREATE POLICY "Habit icon images are publicly accessible 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (("bucket_id" = 'habit_icons'::TEXT));

CREATE POLICY "Habit icon images can be deleted 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (("bucket_id" = 'habit_icons'::TEXT));

CREATE POLICY "Habit icon images can be updated 2yr2q7_0"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (("bucket_id" = 'habit_icons'::TEXT));

CREATE POLICY "Give users access to own folder i4cqsv_0"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (
    (
        ("bucket_id" = 'occurrence_photos'::TEXT)
        AND ((SELECT ("auth"."uid"())::TEXT AS "uid") = ("storage"."foldername"("name"))[1])
    )
);

CREATE POLICY "Give users access to own folder i4cqsv_1"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (
    (
        ("bucket_id" = 'occurrence_photos'::TEXT)
        AND ((SELECT ("auth"."uid"())::TEXT AS "uid") = ("storage"."foldername"("name"))[1])
    )
);

CREATE POLICY "Give users access to own folder i4cqsv_2"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (
    (
        ("bucket_id" = 'occurrence_photos'::TEXT)
        AND ((SELECT ("auth"."uid"())::TEXT AS "uid") = ("storage"."foldername"("name"))[1])
    )
);

CREATE POLICY "Give users access to own folder i4cqsv_3"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (
    (
        ("bucket_id" = 'occurrence_photos'::TEXT)
        AND ((SELECT ("auth"."uid"())::TEXT AS "uid") = ("storage"."foldername"("name"))[1])
    )
);
