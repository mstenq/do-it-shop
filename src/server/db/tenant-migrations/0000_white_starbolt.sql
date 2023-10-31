CREATE TABLE `tenant_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer,
	`user_id` integer,
	`iv` text NOT NULL,
	`access_token_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text NOT NULL,
	`db_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `tenant_access` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `tenant_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `tenants` (`company_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);
--> statement-breakpoint
CREATE TRIGGER [UPDATE_TENANTS_TS]
    AFTER UPDATE ON tenants FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE tenants SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER [UPDATE_USERS_TS]
    AFTER UPDATE ON users FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE users SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER [UPDATE_TENANT_ACCESS_TS]
    AFTER UPDATE ON tenant_access FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE tenant_access SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;