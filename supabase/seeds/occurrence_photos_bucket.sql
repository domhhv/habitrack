CREATE POLICY "Give users access to own folder i4cqsv_0"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (
    (
        ("bucket_id" = 'occurrence_photos'::text) -- noqa: disable=convention.quoted_literals
        AND ((SELECT ("auth"."uid"())::text AS "uid") = ("storage"."foldername"("name"))[1])
    )
);

CREATE POLICY "Give users access to own folder i4cqsv_1"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (
    (
        ("bucket_id" = 'occurrence_photos'::text)
        AND ((SELECT ("auth"."uid"())::text AS "uid") = ("storage"."foldername"("name"))[1])
    )
);

CREATE POLICY "Give users access to own folder i4cqsv_2"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (
    (
        ("bucket_id" = 'occurrence_photos'::text)
        AND ((SELECT ("auth"."uid"())::text AS "uid") = ("storage"."foldername"("name"))[1])
    )
);

CREATE POLICY "Give users access to own folder i4cqsv_3"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (
    (
        ("bucket_id" = 'occurrence_photos'::text)
        AND ((SELECT ("auth"."uid"())::text AS "uid") = ("storage"."foldername"("name"))[1])
    )
);
