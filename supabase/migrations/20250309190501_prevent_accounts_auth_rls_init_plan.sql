DROP POLICY "Enable delete for users based on id" ON "public"."accounts";

DROP POLICY "Users can insert own account" ON "public"."accounts";

DROP POLICY "Users can update own account" ON "public"."accounts";

CREATE POLICY "Enable delete for users based on id"
ON "public"."accounts"
AS PERMISSIVE
FOR DELETE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Users can insert own account"
ON "public"."accounts"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Users can update own account"
ON "public"."accounts"
AS PERMISSIVE
FOR UPDATE
TO "public"
USING (((SELECT "auth"."uid"() AS "uid") = "id"));
