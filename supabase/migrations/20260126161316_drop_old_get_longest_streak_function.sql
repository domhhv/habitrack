DROP FUNCTION IF EXISTS "public"."get_longest_streak"("p_habit_id" "uuid");

GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_time_zone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_time_zone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" "uuid", "p_time_zone" "text") TO "service_role";
