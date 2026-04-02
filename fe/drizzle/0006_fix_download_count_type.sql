-- Ensure leads.download_count is an integer. If a same-named column existed with another
-- type (e.g. timestamptz), ADD COLUMN IF NOT EXISTS in 0005 would have been skipped and
-- "download_count + 1" in the PDF API would error with:
--   operator does not exist: timestamp with time zone + integer
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns c
		WHERE c.table_schema = 'public'
			AND c.table_name = 'leads'
			AND c.column_name = 'download_count'
			AND c.data_type NOT IN ('integer', 'smallint', 'bigint')
	) THEN
		ALTER TABLE "leads" DROP COLUMN "download_count";
		ALTER TABLE "leads" ADD COLUMN "download_count" integer NOT NULL DEFAULT 0;
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns c
		WHERE c.table_schema = 'public'
			AND c.table_name = 'leads'
			AND c.column_name = 'download_count'
	) THEN
		ALTER TABLE "leads" ADD COLUMN "download_count" integer NOT NULL DEFAULT 0;
	END IF;
END;
$$;
