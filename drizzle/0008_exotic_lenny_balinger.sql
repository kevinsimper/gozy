CREATE TABLE `event_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event` text NOT NULL,
	`log` text,
	`details_link` text,
	`user_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_logs_id_idx` ON `event_logs` (`id`);--> statement-breakpoint
CREATE INDEX `event_logs_user_id_idx` ON `event_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `pageviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pageviews_id_idx` ON `pageviews` (`id`);--> statement-breakpoint
CREATE INDEX `pageviews_user_id_created_at_idx` ON `pageviews` (`user_id`,`created_at`);