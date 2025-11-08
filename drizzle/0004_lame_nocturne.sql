CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`file_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_user_id_created_at_idx` ON `messages` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_file_id_idx` ON `messages` (`file_id`);--> statement-breakpoint
CREATE INDEX `user_documents_user_id_created_at_idx` ON `user_documents` (`user_id`,`created_at`);