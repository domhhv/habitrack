UPDATE "storage"."buckets"
SET "file_size_limit" = 102400
WHERE "name" = 'habit_icons'; -- noqa: disable=convention.quoted_literals
