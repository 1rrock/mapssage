CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`trace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`parent_id` text,
	`content` text NOT NULL,
	`is_deleted` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trace_id`) REFERENCES `traces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comments_trace` ON `comments` (`trace_id`);--> statement-breakpoint
CREATE INDEX `idx_comments_parent` ON `comments` (`parent_id`);