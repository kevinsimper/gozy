CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`category` text,
	`author` text,
	`is_published` integer DEFAULT true NOT NULL,
	`published_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_public_id_unique` ON `news` (`public_id`);--> statement-breakpoint
CREATE INDEX `news_is_published_idx` ON `news` (`is_published`);--> statement-breakpoint
CREATE INDEX `news_published_at_idx` ON `news` (`published_at`);