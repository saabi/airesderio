ALTER TABLE "leads" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "last_name" varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "last_name" DROP DEFAULT;
