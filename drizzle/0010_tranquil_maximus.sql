CREATE TABLE `rtt_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`appointment_date` integer NOT NULL,
	`appointment_hour` integer NOT NULL,
	`description` text,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rtt_bookings_public_id_unique` ON `rtt_bookings` (`public_id`);--> statement-breakpoint
CREATE INDEX `rtt_bookings_user_id_created_at_idx` ON `rtt_bookings` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `rtt_bookings_status_idx` ON `rtt_bookings` (`status`);--> statement-breakpoint
CREATE INDEX `rtt_bookings_location_date_hour_idx` ON `rtt_bookings` (`location_id`,`appointment_date`,`appointment_hour`);--> statement-breakpoint
CREATE TABLE `rtt_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`postal_code` text NOT NULL,
	`city` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`opening_hours_mon_thu` text,
	`opening_hours_fri` text,
	`opening_hours_sat` text,
	`emergency_hours` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rtt_locations_slug_unique` ON `rtt_locations` (`slug`);