PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel` text NOT NULL,
	`recipient` text NOT NULL,
	`subject` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`user_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_notifications`("id", "channel", "recipient", "subject", "content", "status", "user_id", "created_at") SELECT "id", "channel", "recipient", "subject", "content", "status", "user_id", "created_at" FROM `notifications`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
ALTER TABLE `__new_notifications` RENAME TO `notifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `notifications_channel_idx` ON `notifications` (`channel`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);