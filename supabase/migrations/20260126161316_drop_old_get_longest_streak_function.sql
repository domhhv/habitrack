DROP FUNCTION IF EXISTS "public"."get_longest_streak"("p_habit_id" UUID);

GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) TO "anon";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_longest_streak"("p_habit_id" UUID, "p_time_zone" TEXT) TO "service_role";
