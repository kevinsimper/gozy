CREATE TABLE `user_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`file_id` integer NOT NULL,
	`document_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_documents_public_id_unique` ON `user_documents` (`public_id`);