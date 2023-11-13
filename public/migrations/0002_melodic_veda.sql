CREATE TABLE `permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` text NOT NULL,
	`table` text NOT NULL,
	`view` integer DEFAULT false NOT NULL,
	`edit` integer DEFAULT false NOT NULL,
	`create` integer DEFAULT false NOT NULL,
	`delete` integer DEFAULT false NOT NULL,
	`edit_others` integer DEFAULT false NOT NULL,
	`delete_others` integer DEFAULT false NOT NULL,
	`additional_permissions` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `role_idx` ON `permissions` (`role_id`);--> statement-breakpoint
CREATE TRIGGER [UPDATE_PERMISSIONS_TS]
    AFTER UPDATE ON permissions FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE permissions SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;--> statement-breakpoint
CREATE TRIGGER [UPDATE_ROLES_TS]
    AFTER UPDATE ON roles FOR EACH ROW
    WHEN OLD.updated_at = NEW.updated_at OR OLD.updated_at IS NULL
BEGIN
    UPDATE roles SET updated_at=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;