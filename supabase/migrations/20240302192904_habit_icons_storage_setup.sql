-- Set up Storage!
insert into storage.buckets (id, name)
  values ('habit_icons', 'habit_icons');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Allow access to images in public folder" on storage.objects
  for select using ((bucket_id = 'habit_icons'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text));

create policy "Give users select access to own folder" on storage.objects
  for select using ((bucket_id = 'habit_icons'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));

create policy "Give users insert access to own folder" on storage.objects
  for insert with check ((bucket_id = 'habit_icons'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));

create policy "Give users update access to own folder" on storage.objects
  for insert with check ((bucket_id = 'habit_icons'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));

create policy "Give users delete access to own folder" on storage.objects
  for delete using ((bucket_id = 'habit_icons'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]));