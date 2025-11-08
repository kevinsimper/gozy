ALTER TABLE `messages` ADD `public_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `messages_public_id_unique` ON `messages` (`public_id`);