CREATE TABLE IF NOT EXISTS "email_outbound_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"job_kind" varchar(32) NOT NULL,
	"payload" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 36 NOT NULL,
	"next_retry_at" timestamp with time zone NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_outbound_jobs" ADD CONSTRAINT "email_outbound_jobs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_outbound_jobs_next_retry" ON "email_outbound_jobs" USING btree ("next_retry_at");