-- Set up Storage!
insert into storage.buckets (id, name)
  values ('habit_icons', 'habit_icons');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Havit icon images are publicly accessible." on storage.objects
  for select using (bucket_id = 'habit_icons');

create policy "Anyone can upload a habit icon." on storage.objects
  for insert with check (bucket_id = 'habit_icons');