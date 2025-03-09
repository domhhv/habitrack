drop policy "Enable delete for users based on user_id" on "public"."habits";

drop policy "Enable read access for users based on user_id" on "public"."habits";

drop policy "Enable update for users based on user_id" on "public"."habits";

create policy "Enable delete for users based on user_id"
on "public"."habits"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable read access for users based on user_id"
on "public"."habits"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable update for users based on user_id"
on "public"."habits"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



