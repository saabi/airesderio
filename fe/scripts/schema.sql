-- Initial schema for Aires de Río leads and PDF access
-- Run against airesderio database (create it first: CREATE DATABASE airesderio;)

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  intent VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdf_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  pdf_type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_email_verified ON leads(email_verified_at);
CREATE INDEX IF NOT EXISTS idx_pdf_tokens_token ON pdf_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_pdf_tokens_unused ON pdf_access_tokens(used_at) WHERE used_at IS NULL;
