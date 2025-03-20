DROP POLICY "Enable delete for users based on user_id" ON "public"."habits";

DROP POLICY "Enable read access for users based on user_id" ON "public"."habits";

DROP POLICY "Enable update for users based on user_id" ON "public"."habits";

CREATE POLICY "Enable delete for users based on user_id"
ON "public"."habits"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for users based on user_id"
ON "public"."habits"
AS PERMISSIVE
FOR SELECT
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable update for users based on user_id"
ON "public"."habits"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "user_id"))
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));
