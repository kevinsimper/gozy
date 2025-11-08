CREATE TABLE `vehicle_offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`brand` text,
	`budget` integer,
	`model` text,
	`financing` text,
	`timeframe` text,
	`notes` text,
	`questions_asked` text,
	`status` text DEFAULT 'collecting_info' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicle_offers_public_id_unique` ON `vehicle_offers` (`public_id`);--> statement-breakpoint
CREATE INDEX `vehicle_offers_user_id_created_at_idx` ON `vehicle_offers` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `vehicle_offers_status_idx` ON `vehicle_offers` (`status`);