drop policy if exists "Enable insert for users based on user_id" on "public"."notes";

drop policy "Enable delete for users based on user_id" on "public"."notes";

drop policy "Enable read access for users based on user_id" on "public"."notes";

drop policy "Enable update for users based on user_id" on "public"."notes";

create policy "Enable delete for users based on user_id"
on "public"."notes"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable read access for users based on user_id"
on "public"."notes"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable update for users based on user_id"
on "public"."notes"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



