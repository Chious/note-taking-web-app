-- Create Tag table if it doesn't exist
CREATE TABLE IF NOT EXISTS `Tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Create NoteTag junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS `NoteTag` (
	`noteId` text NOT NULL,
	`tagId` text NOT NULL,
	PRIMARY KEY(`noteId`, `tagId`),
	FOREIGN KEY (`noteId`) REFERENCES `Note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Update Note table to remove tags column and change content to JSON
-- SQLite doesn't support DROP COLUMN, so we need to recreate the table
-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS `Note_backup` AS SELECT * FROM `Note`;
--> statement-breakpoint

-- Drop the old Note table
DROP TABLE IF EXISTS `Note`;
--> statement-breakpoint

-- Recreate Note table with new schema (content as JSON, no tags column)
CREATE TABLE IF NOT EXISTS `Note` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`isArchived` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`lastEdited` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Migrate data from backup to new table (excluding tags column)
-- Note: This assumes content will be migrated to JSON format by the application
INSERT INTO `Note` (`id`, `userId`, `title`, `content`, `isArchived`, `createdAt`, `updatedAt`, `lastEdited`)
SELECT `id`, `userId`, `title`, `content`, `isArchived`, `createdAt`, `updatedAt`, `lastEdited`
FROM `Note_backup`;
--> statement-breakpoint

-- Clean up backup table
DROP TABLE IF EXISTS `Note_backup`;
