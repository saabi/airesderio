CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"message" text,
	"intent" varchar(50) NOT NULL,
	"ip_address" varchar(45),
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pdf_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"pdf_type" varchar(50) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "pdf_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pdf_access_tokens" ADD CONSTRAINT "pdf_access_tokens_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_email" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_email_verified" ON "leads" USING btree ("email_verified_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pdf_tokens_token" ON "pdf_access_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pdf_tokens_unused" ON "pdf_access_tokens" USING btree ("used_at");