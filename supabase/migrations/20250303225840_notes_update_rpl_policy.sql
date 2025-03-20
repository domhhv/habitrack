CREATE POLICY "Enable update for users based on user_id" ON "public"."notes" FOR UPDATE USING (
    ("auth"."uid"() = "user_id")
) WITH CHECK (("auth"."uid"() = "user_id"));
