CREATE TABLE `checkins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`checked_in_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `checkins_user_id_idx` ON `checkins` (`user_id`);--> statement-breakpoint
CREATE INDEX `checkins_location_id_idx` ON `checkins` (`location_id`);--> statement-breakpoint
CREATE INDEX `checkins_user_id_checked_in_at_idx` ON `checkins` (`user_id`,`checked_in_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `preferred_rtt_location_id` integer;