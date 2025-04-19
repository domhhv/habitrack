DROP POLICY "Enable read access for all users" ON "public"."traits";

CREATE POLICY "Enable users to view their own data only"
ON "public"."traits"
AS PERMISSIVE
FOR SELECT
TO "authenticated"
USING ((((SELECT "auth"."uid"() AS "uid") = "user_id") OR ("user_id" IS NULL)));
