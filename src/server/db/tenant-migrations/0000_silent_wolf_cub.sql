DROP TABLE `tenants`;
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`website` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`logo` text,
	`db_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `tenants` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `username_idx` ON `tenants` (`username`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `tenants` (`name`);
--> statement-breakpoint
CREATE TRIGGER [UPDATE_DT]
    AFTER UPDATE ON tenants FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE tenants SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;