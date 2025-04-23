UPDATE "storage"."buckets"
SET "file_size_limit" = 1024
WHERE "name" = 'habit_icons'; -- noqa: disable=convention.quoted_literals
