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



