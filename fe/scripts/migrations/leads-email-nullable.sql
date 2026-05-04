-- Run once against production/staging DBs after deploy.
-- WhatsApp manual leads may omit email; application still requires email for manual-entry.

ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;
