-- No-op: this migration previously duplicated 0001_split_name (RENAME name + ADD last_name).
-- After 0001 runs, those steps are already applied; re-running them caused:
--   error: column "name" does not exist
-- Journal entry kept for ordering before 0003_email_outbound_jobs.
SELECT 1;
