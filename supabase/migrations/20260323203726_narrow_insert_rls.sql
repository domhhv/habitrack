DROP POLICY "Enable insert for authenticated users only" ON "public"."habit_metrics";

DROP POLICY "Enable insert for authenticated users only" ON "public"."habits";

DROP POLICY "Enable insert for authenticated users only" ON "public"."notes";

DROP POLICY "Enable insert for authenticated users only" ON "public"."occurrence_metric_values";

DROP POLICY "Enable insert for authenticated users only" ON "public"."occurrences";

DROP POLICY "Enable insert for authenticated users only" ON "public"."occurrence_stock_usages";

CREATE POLICY "Enable insert for users based on user_id"
ON "public"."habit_metrics"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id"
ON "public"."habits"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id"
ON "public"."notes"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id"
ON "public"."occurrence_metric_values"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id"
ON "public"."occurrences"
AS PERMISSIVE
FOR INSERT
TO "public"
WITH CHECK (((SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."occurrence_stock_usages"
AS PERMISSIVE
FOR INSERT
TO "authenticated"
WITH CHECK ((((
    SELECT "auth"."uid"() AS "uid"
) = "user_id") AND (
    EXISTS (
        SELECT 1
        FROM "public"."occurrences"
        WHERE
            (
                ("occurrences"."id" = "occurrence_stock_usages"."occurrence_id")
                AND ("occurrences"."user_id" = (SELECT "auth"."uid"() AS "uid"))
            )
    )
)
AND (EXISTS (
    SELECT 1
    FROM "public"."habit_stocks"
    WHERE
        (
            ("habit_stocks"."id" = "occurrence_stock_usages"."habit_stock_id")
            AND ("habit_stocks"."user_id" = (SELECT "auth"."uid"() AS "uid"))
        )
))));
