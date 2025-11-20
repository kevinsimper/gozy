CREATE TABLE `rate_limit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`endpoint` text NOT NULL,
	`action` text NOT NULL,
	`global_count` integer,
	`ip_count` integer,
	`user_agent` text,
	`country` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_logs_identifier_created_at_idx` ON `rate_limit_logs` (`identifier`,`created_at`);--> statement-breakpoint
CREATE INDEX `rate_limit_logs_endpoint_created_at_idx` ON `rate_limit_logs` (`endpoint`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`endpoint` text NOT NULL,
	`requests` integer DEFAULT 0 NOT NULL,
	`resets_at` integer NOT NULL,
	`is_over_threshold` integer DEFAULT false NOT NULL,
	`last_alarm_sent_at` integer,
	`alarm_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_identifier_endpoint_idx` ON `rate_limits` (`identifier`,`endpoint`);--> statement-breakpoint
CREATE INDEX `rate_limits_resets_at_idx` ON `rate_limits` (`resets_at`);