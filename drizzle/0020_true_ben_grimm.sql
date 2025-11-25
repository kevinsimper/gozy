CREATE TABLE `qr_code_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`qr_code_id` integer NOT NULL,
	`user_agent` text,
	`country` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `qr_code_scans_qr_code_id_idx` ON `qr_code_scans` (`qr_code_id`);--> statement-breakpoint
CREATE INDEX `qr_code_scans_created_at_idx` ON `qr_code_scans` (`created_at`);--> statement-breakpoint
CREATE TABLE `qr_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`short_code` text NOT NULL,
	`name` text NOT NULL,
	`redirect_url` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_codes_short_code_unique` ON `qr_codes` (`short_code`);