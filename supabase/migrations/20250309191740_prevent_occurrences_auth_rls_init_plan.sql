DROP POLICY "Enable delete for users based on user_id" ON "public"."occurrences";

DROP POLICY "Enable read access for users based on user_id" ON "public"."occurrences";

DROP POLICY "Enable update for users based on user_id" ON "public"."occurrences";

CREATE POLICY "Enable delete for users based on user_id"
ON "public"."occurrences"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id"
ON "public"."occurrences"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id"
ON "public"."occurrences"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));
