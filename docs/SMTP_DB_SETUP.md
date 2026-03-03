# SMTP & Database Setup Guide

**Purpose:** Configure DreamHost SMTP for contact notifications and PostgreSQL for storing leads and PDF access tokens.

---

## Overview

The contact form and PDF download flow depend on:

- **PostgreSQL** – Stores leads (name, email, intent, etc.) and one-time PDF tokens
- **SMTP (DreamHost)** – Sends notification emails when someone submits the form

---

## Step 1: PostgreSQL Database

### Option A: DreamHost (Production)

1. Log in to DreamHost panel
2. Go to **Databases** → **Create a New Database**
3. Create a database (e.g. `airesderio`)
4. Create a user and assign it to the database
5. Copy the connection string – it looks like:
   ```
   postgresql://user:password@hostname.dreamhost.com:5432/airesderio
   ```
6. Set `DATABASE_URL` in your `.env`

### Option B: Local Development (Docker)

1. Start the PostgreSQL container:
   ```bash
   cd fe
   docker compose up -d
   ```
2. Add to your `fe/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/airesderio
   ```
3. Stop the container when done:
   ```bash
   cd fe
   docker compose down
   ```

**Requirements:** Docker and Docker Compose installed. The first run will pull the `postgres:16-alpine` image and run `fe/scripts/init-db.sql` to create tables. If you already have Postgres running elsewhere, create the database manually and skip Docker.

### Initialize Schema

Run migrations to create tables:

```bash
cd fe
npm run db:push
# or
npm run db:migrate
```

---

## Step 2: SMTP (DreamHost)

### Get SMTP Credentials

1. Log in to DreamHost panel
2. Go to **Mail** → **Manage**
3. Create or use an existing email address (e.g. `noreply@airesderio.com`)
4. Note the credentials:
   - **Host:** `mail.yourdomain.com` (or `smtp.dreamhost.com`)
   - **Port:** 465 (SSL) or 587 (TLS)
   - **User:** full email address
   - **Password:** mailbox password

### Environment Variables

Set these in `.env`:

```env
SMTP_HOST=mail.airesderio.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@airesderio.com
SMTP_PASS=your_mailbox_password

CONTACT_FORM_RECIPIENT=info@airesderio.com
CONTACT_FORM_FROM=noreply@airesderio.com
```

---

## Step 3: Full .env Example

Copy `fe/.env.example` to `fe/.env` and fill in:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key

DATABASE_URL=postgresql://user:password@host:5432/airesderio

SMTP_HOST=mail.airesderio.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@airesderio.com
SMTP_PASS=your_password

CONTACT_FORM_RECIPIENT=info@airesderio.com
CONTACT_FORM_FROM=noreply@airesderio.com
```

---

## Troubleshooting

### Contact form fails with 500

- Ensure `DATABASE_URL` is set and migrations have run
- If SMTP is misconfigured, the API may still return success but log the error (in dev)

### PDF download link not working

- Token is one-time use; expired tokens return 410
- Check that `fe/static/pdf/ficha-tecnica.pdf` and `fe/static/pdf/planos.pdf` exist
- In production, the server must run from a directory where `static/pdf/` is available (e.g. project root)
