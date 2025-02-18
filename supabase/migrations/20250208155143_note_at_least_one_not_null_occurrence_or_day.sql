ALTER TABLE notes
ADD CONSTRAINT at_least_one_not_null
CHECK (day IS NOT NULL OR occurrence_id IS NOT NULL);
