CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`document_id` integer NOT NULL,
	`sent_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reminders_document_id_idx` ON `reminders` (`document_id`);--> statement-breakpoint
CREATE INDEX `reminders_user_id_idx` ON `reminders` (`user_id`);--> statement-breakpoint
ALTER TABLE `user_documents` ADD `expiry_date` integer;--> statement-breakpoint
ALTER TABLE `user_documents` ADD `description` text;--> statement-breakpoint
ALTER TABLE `user_documents` ADD `reminder_days_before` integer;--> statement-breakpoint
CREATE INDEX `user_documents_expiry_date_idx` ON `user_documents` (`expiry_date`);