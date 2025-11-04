ALTER TABLE `users` ADD `login_pin` text;--> statement-breakpoint
ALTER TABLE `users` ADD `login_pin_expiry` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` integer;