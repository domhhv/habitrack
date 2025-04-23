CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; -- noqa

CREATE TRIGGER "set_updated_at"
BEFORE UPDATE ON "traits"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER "set_updated_at"
BEFORE UPDATE ON "habits"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER "set_updated_at"
BEFORE UPDATE ON "occurrences"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER "set_updated_at"
BEFORE UPDATE ON "notes"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
