import { pgTable, uuid, varchar, text, timestamp, index, integer } from 'drizzle-orm/pg-core';

export const leads = pgTable(
	'leads',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		firstName: varchar('first_name', { length: 255 }).notNull(),
		lastName: varchar('last_name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 50 }),
		message: text('message'),
		intent: varchar('intent', { length: 50 }).notNull(),
		ipAddress: varchar('ip_address', { length: 45 }),
		emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => ({
		emailIdx: index('idx_leads_email').on(table.email),
		emailVerifiedIdx: index('idx_leads_email_verified').on(table.emailVerifiedAt)
	})
);

export const pdfAccessTokens = pgTable(
	'pdf_access_tokens',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leadId: uuid('lead_id')
			.notNull()
			.references(() => leads.id),
		token: varchar('token', { length: 64 }).notNull().unique(),
		pdfType: varchar('pdf_type', { length: 50 }).notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => ({
		tokenIdx: index('idx_pdf_tokens_token').on(table.token),
		unusedIdx: index('idx_pdf_tokens_unused').on(table.usedAt)
	})
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type PdfAccessToken = typeof pdfAccessTokens.$inferSelect;
export type NewPdfAccessToken = typeof pdfAccessTokens.$inferInsert;

export const emailOutboundJobs = pgTable(
	'email_outbound_jobs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leadId: uuid('lead_id')
			.notNull()
			.references(() => leads.id),
		jobKind: varchar('job_kind', { length: 32 }).notNull(),
		payload: text('payload').notNull(),
		attempts: integer('attempts').notNull().default(0),
		maxAttempts: integer('max_attempts').notNull().default(36),
		nextRetryAt: timestamp('next_retry_at', { withTimezone: true }).notNull(),
		lastError: text('last_error'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		completedAt: timestamp('completed_at', { withTimezone: true })
	},
	(table) => ({
		nextRetryIdx: index('idx_email_outbound_jobs_next_retry').on(table.nextRetryAt)
	})
);

export type EmailOutboundJob = typeof emailOutboundJobs.$inferSelect;
export type NewEmailOutboundJob = typeof emailOutboundJobs.$inferInsert;
