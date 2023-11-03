--> statement-breakpoint
CREATE TRIGGER [UPDATE_<<TABLE_NAME>>_TS]
    AFTER UPDATE ON <<table_name>> FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE <<table_name>> SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;