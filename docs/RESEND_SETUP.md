# Resend Setup Guide - Quick Start

**Purpose:** Set up Resend email service for local testing of the contact form.

---

## Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (no credit card required for testing)
3. Verify your email address

---

## Step 2: Get API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section (in the left sidebar)
3. Click **Create API Key**
4. Give it a name (e.g., "Local Development")
5. Copy the API key (starts with `re_`)
   - ⚠️ **Important:** You can only see the key once. Copy it immediately!

---

## Step 3: Understand Resend Testing Limitations

### ⚠️ Important: Resend Test Domain Restrictions

**When using Resend's test domain (`resend.dev`):**
- ✅ **From email:** Must be `onboarding@resend.dev`
- ✅ **To email:** Must be **your Resend account email** (the email you signed up with)
- ❌ **Cannot send to other email addresses** until you verify a domain

**Your Resend account email is:** The email address you used to sign up for Resend (e.g., `ushiferreyra@gmail.com`)

### For Local Testing

Use this configuration in your `.env`:

```env
RESEND_API_KEY=re_your_key_here
CONTACT_FORM_FROM=onboarding@resend.dev
CONTACT_FORM_RECIPIENT=your-resend-account-email@gmail.com
```

**Replace `your-resend-account-email@gmail.com` with the email you used to sign up for Resend.**

### For Production (Sending to Any Email)

You **must verify your domain** first:

1. Go to Resend dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `ferreyrapons.com`)
4. Add the DNS records (SPF, DKIM) as instructed
5. Wait for verification (usually a few minutes)
6. Once verified, you can use:
   - **From email:** `sebastian@ferreyrapons.com` (or any email on your verified domain)
   - **To email:** Any email address

---

## Step 4: Set Up Environment Variables

### Option A: Copy from example (Recommended)

Copy the example file and edit it:

```bash
cd fe
cp .env.example .env
```

Then edit `.env` and update the values:

```env
# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Contact Form Configuration
# IMPORTANT: When using test domain, recipient MUST be your Resend account email
CONTACT_FORM_RECIPIENT=your-resend-account-email@gmail.com
CONTACT_FORM_FROM=onboarding@resend.dev
```

**Replace:**
- `re_your_api_key_here` with your actual Resend API key
- `your-resend-account-email@gmail.com` with **the email you used to sign up for Resend** (not any email - must be your account email when using test domain)

### Option B: Export Environment Variables

```bash
export RESEND_API_KEY=re_your_api_key_here
export CONTACT_FORM_RECIPIENT=your-email@example.com
export CONTACT_FORM_FROM=onboarding@resend.dev
```

**Note:** This only works for the current terminal session. Use `.env` file for persistence.

---

## Step 5: Test the Form

1. **Start the development server:**
   ```bash
   cd fe
   npm run dev
   ```

2. **Open the contact form** in your browser (usually at `http://localhost:5173`)

3. **Fill out and submit the form**

4. **Check your email** - You should receive the form submission

5. **Check the server logs** - The API route will log any errors

---

## Troubleshooting

### Form submission fails

**Check:**
1. Is `RESEND_API_KEY` set correctly?
   ```bash
   # In fe/ directory
   cat .env | grep RESEND_API_KEY
   ```

2. Is the API key valid?
   - Go to Resend dashboard → API Keys
   - Verify the key is active

3. Check server logs:
   ```bash
   # Look for errors in the terminal where npm run dev is running
   ```

### Email not received

**Check:**
1. **Spam folder** - Test emails might go to spam
2. **Email address** - Verify `CONTACT_FORM_RECIPIENT` matches your Resend account email (when using test domain)
3. **Resend dashboard** - Go to **Logs** to see if email was sent
4. **Rate limits** - Free tier has limits (check Resend dashboard)

### "You can only send testing emails to your own email address"

**This error means:**
- You're using `onboarding@resend.dev` as the `from` address (test domain)
- But the `to` address (`CONTACT_FORM_RECIPIENT`) is NOT your Resend account email

**Solution:**
1. Find your Resend account email (the email you signed up with)
2. Set `CONTACT_FORM_RECIPIENT` to that exact email address
3. Restart the dev server

**Example:**
```env
# If you signed up with ushiferreyra@gmail.com
CONTACT_FORM_RECIPIENT=ushiferreyra@gmail.com
CONTACT_FORM_FROM=onboarding@resend.dev
```

**To send to other emails:** You must verify your domain first (see Step 3 above).

### "Error de configuración del servidor"

This means `RESEND_API_KEY` is not set or not accessible.

**Solution:**
1. Verify `.env` file exists in `fe/` directory
2. Restart the dev server after creating/updating `.env`
3. Check that the variable name is exactly `RESEND_API_KEY` (case-sensitive)

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Your Resend API key | `re_abc123...` |
| `CONTACT_FORM_RECIPIENT` | ⚠️ Optional | Email to receive submissions | `contact@example.com` |
| `CONTACT_FORM_FROM` | ⚠️ Optional | Sender email address | `onboarding@resend.dev` |

**Defaults:**
- If `CONTACT_FORM_RECIPIENT` is not set, defaults to: `contacto@ferreyrapons.com`
- If `CONTACT_FORM_FROM` is not set, defaults to: `noreply@ferreyrapons.com`

---

## Development Mode Fallback

If `RESEND_API_KEY` is not set, the form will:
- ✅ Still return success (for testing UI)
- ✅ Log the submission to console
- ❌ Not send actual emails

**Console output example:**
```
Form submission (dev mode): {
  nombre: 'John Doe',
  correo: 'john@example.com',
  ...
}
```

---

## Next Steps

Once local testing works:

1. **For Production:**
   - Add your domain to Resend
   - Verify DNS records
   - Update `CONTACT_FORM_FROM` to use your verified domain
   - Set environment variables on the server (in PM2 ecosystem file or system environment)

2. **Security:**
   - Never commit `.env` file (already in `.gitignore`)
   - Use different API keys for development and production
   - Restrict API key permissions if possible

---

## Quick Reference

```bash
# 1. Copy example and edit
cd fe
cp .env.example .env
# Edit .env and add your Resend API key

# 2. Start dev server
npm run dev

# 3. Test form at http://localhost:5173
```

**Minimum required for testing:**
```env
RESEND_API_KEY=re_your_key_here
CONTACT_FORM_RECIPIENT=your-resend-account-email@gmail.com
CONTACT_FORM_FROM=onboarding@resend.dev
```

**⚠️ Important:** `CONTACT_FORM_RECIPIENT` must be the email you used to sign up for Resend when using the test domain.

---

**Related:**
- [Form Submission Status](./FORM_SUBMISSION_STATUS.md)
- [Development Setup](./specs/development-setup.md)
- [Resend Documentation](https://resend.com/docs)

