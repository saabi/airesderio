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
   - **Host:** Use `smtp.dreamhost.com` (not `mail.yourdomain.com` – that causes certificate mismatch)
   - **Port:** 465 (SSL) or 587 (TLS)
   - **User:** full email address
   - **Password:** mailbox password

### Environment Variables

Set these in `.env`:

```env
SMTP_HOST=smtp.dreamhost.com
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

SMTP_HOST=smtp.dreamhost.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@airesderio.com
SMTP_PASS=your_password

CONTACT_FORM_RECIPIENT=info@airesderio.com
CONTACT_FORM_FROM=noreply@airesderio.com
```

---

## Step 4: Admin (Contactos)

The `/admin/contactos` page lists leads. Configure in `.env`:

```env
ADMIN_EMAILS=admin1@airesderio.com,admin2@airesderio.com,admin3@airesderio.com
ADMIN_PASSWORD=your_shared_admin_password
ADMIN_SESSION_SECRET=generate_with_openssl_rand_hex_32
```

Generate `ADMIN_SESSION_SECRET`:

```bash
openssl rand -hex 32
```

Then visit `/admin/login` and sign in with any listed email and the shared password.

### Test SMTP

Run the test script to verify your SMTP configuration:

```bash
cd fe
npm run test:smtp
```

This sends a test email to `CONTACT_FORM_RECIPIENT`. To send to a different address:

```bash
npm run test:smtp -- --to=your@email.com
```

---

## Troubleshooting

### SMTP authentication failed (535)

- **Mailbox vs forwarder** – SMTP requires a full **mailbox**, not an email forwarder. In DreamHost: Mail → Manage → the address must be a "Mailbox" (with storage). If it's "Forward only", create a new mailbox.
- Use the **mailbox password** for the email address in `SMTP_USER`, not the DreamHost panel password
- Reset the mailbox password in DreamHost: Mail → Manage → select the address → change password
- **Test login in DreamHost webmail** – If you can log in at https://webmail.dreamhost.com with the same email and password, the mailbox is valid
- Ensure no extra spaces or quotes around values in `.env`; if the password contains `$`, `"`, or `'`, it may need escaping or wrapping differently
- Confirm `SMTP_USER` is the full email (e.g. `info@airesderio.com`)
- **Try port 587** – DreamHost often works better with STARTTLS: add to `.env`:
  ```env
  SMTP_PORT=587
  SMTP_SECURE=false
  ```
  Or run the test with: `npm run test:smtp -- --587`

### Contact form fails with 500

- Ensure `DATABASE_URL` is set and migrations have run
- If SMTP is misconfigured, the API may still return success and log the error (in dev)

### PDF download link not working

- Token is one-time use; expired tokens return 410
- Check that `fe/static/pdf/ficha-tecnica.pdf` and `fe/static/pdf/planos.pdf` exist
- In production, the server must run from a directory where `static/pdf/` is available (e.g. project root)
