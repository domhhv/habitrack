ALTER POLICY "Enable read access for all users"
ON "public"."accounts"
TO "authenticated"
USING (
    (SELECT "auth"."uid"()) = "id"
);
ALTER POLICY "Enable read access for all users"
ON "public"."accounts"
RENAME TO "Enable users to view their own data only";
