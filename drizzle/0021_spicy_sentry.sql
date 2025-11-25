CREATE TABLE `helpdesk_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`embedding` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `helpdesk_articles_public_id_unique` ON `helpdesk_articles` (`public_id`);--> statement-breakpoint
CREATE TABLE `helpdesk_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`question` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `helpdesk_questions_article_id_idx` ON `helpdesk_questions` (`article_id`);