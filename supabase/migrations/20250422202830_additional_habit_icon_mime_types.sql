UPDATE "storage"."buckets"
SET "allowed_mime_types" = '{image/png,image/jpeg,image/svg,image/svg+xml,image/vnd.microsoft.icon}' -- noqa: disable=references.special_chars,layout.long_lines,convention.quoted_literals
WHERE "name" = 'habit_icons'; -- noqa: disable=convention.quoted_literals
