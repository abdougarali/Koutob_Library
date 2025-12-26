# Email Service Setup Guide

## Resend Configuration

The application uses **Resend** for sending emails (password reset, email verification, etc.).

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Koutob Bookshop")
4. Copy the API key (starts with `re_`)

### Step 3: Add to Environment Variables

Add the following to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Note:** 
- Replace `re_your_api_key_here` with your actual Resend API key
- Replace `noreply@yourdomain.com` with your verified domain email
- For development, you can use Resend's test domain: `onboarding@resend.dev`

### Step 4: Verify Domain (Production Only)

For production, you need to verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

### Step 5: Test Email Sending

The application will work without Resend configured (it will log emails to console in development), but for production you need:

1. Valid `RESEND_API_KEY`
2. Verified domain or use Resend's test domain

## Alternative Email Services

If you prefer a different email service, you can modify `src/lib/services/emailService.ts`:

### SendGrid
```bash
npm install @sendgrid/mail
```

### Nodemailer (SMTP)
```bash
npm install nodemailer
```

### AWS SES
```bash
npm install @aws-sdk/client-ses
```

## Current Email Features

- ✅ Password reset emails
- ⏳ Email verification (coming soon)
- ⏳ Order confirmation emails (future)
- ⏳ Welcome emails (future)

## Troubleshooting

### Emails not sending?

1. Check `RESEND_API_KEY` is set correctly
2. Check `RESEND_FROM_EMAIL` is a verified domain
3. Check Resend dashboard for error logs
4. Check application console for error messages

### Development Mode

In development, if `RESEND_API_KEY` is not set, emails will be logged to console instead of being sent. This is intentional to prevent accidental email sending during development.

## Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

For higher limits, upgrade to a paid plan.

---

**Last Updated:** 2025-01-XX

























