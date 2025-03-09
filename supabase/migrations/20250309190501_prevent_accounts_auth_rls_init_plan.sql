drop policy "Enable delete for users based on id" on "public"."accounts";

drop policy "Users can insert own account" on "public"."accounts";

drop policy "Users can update own account" on "public"."accounts";

create policy "Enable delete for users based on id"
on "public"."accounts"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = id));


create policy "Users can insert own account"
on "public"."accounts"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Users can update own account"
on "public"."accounts"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id));



