ALTER TABLE `messages` ADD `sent_by_admin_id` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `manual_mode` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `manual_mode_enabled_at` integer;