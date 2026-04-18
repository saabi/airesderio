-- Run once against production/staging DBs after deploy.
-- Starred flag for admin contact list (Gmail-style importance).

ALTER TABLE leads ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false;
