CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.accounts (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

insert into storage.buckets (id, name, public)
  values ('habit_icons', 'habit_icons', true);

create policy "Anyone can upload a habit icon."
  on "storage"."objects"
  as permissive
  for insert
  to public
  with check ((bucket_id = 'habit_icons'::text));

create policy "Habit icon images are publicly accessible."
  on "storage"."objects"
  as permissive
  for select
  to public
  using ((bucket_id = 'habit_icons'::text));
