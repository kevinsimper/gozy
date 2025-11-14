CREATE TABLE `whatsapp_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`user_id` integer,
	`phone_number` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `whatsapp_messages_public_id_unique` ON `whatsapp_messages` (`public_id`);--> statement-breakpoint
CREATE INDEX `whatsapp_messages_user_id_created_at_idx` ON `whatsapp_messages` (`user_id`,`created_at`);