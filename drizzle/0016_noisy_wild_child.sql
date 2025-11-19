CREATE TABLE `driver_taxi_ids` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`taxi_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `driver_taxi_ids_user_id_idx` ON `driver_taxi_ids` (`user_id`);