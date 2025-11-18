# Production Email Setup Guide

## Why Use Your Own Domain Email?

**Current (Development):**
- FROM: `onboarding@resend.dev`
- This is Resend's test email - works for testing only

**Production (What You Want):**
- FROM: `noreply@yourdomain.com` or `support@yourdomain.com`
- This is YOUR professional email - builds trust with customers

---

## Step-by-Step: Setting Up Your Own Domain Email

### Step 1: Get a Domain Name

If you don't have a domain yet:
1. Buy a domain from:
   - Namecheap (https://www.namecheap.com)
   - GoDaddy (https://www.godaddy.com)
   - Google Domains (https://domains.google)
   - Cloudflare (https://www.cloudflare.com/products/registrar)

2. Example domains:
   - `koutob.com`
   - `koutob-library.com`
   - `islamic-books.com`

**Cost:** Usually $10-15 per year

---

### Step 2: Add Domain to Resend

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/domains
   - Log in to your Resend account

2. **Click "Add Domain":**
   - Enter your domain: `yourdomain.com`
   - Click "Add Domain"

3. **Resend will show you DNS records to add:**
   - You'll see something like this:

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

---

### Step 3: Add DNS Records to Your Domain

**What are DNS records?**
- DNS records tell email servers that your domain is authorized to send emails
- You add these records in your domain provider's dashboard

**Where to add them:**
- If you bought domain from Namecheap → Go to Namecheap DNS settings
- If you bought from GoDaddy → Go to GoDaddy DNS settings
- If you bought from Cloudflare → Go to Cloudflare DNS settings

**Example: Adding DNS Records in Namecheap**

1. Log in to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Go to **Advanced DNS** tab
5. Click **Add New Record** for each record:

**Record 1: SPF (TXT)**
```
Type: TXT Record
Host: @
Value: v=spf1 include:resend.com ~all
TTL: Automatic
```

**Record 2: DKIM (CNAME)**
```
Type: CNAME Record
Host: resend._domainkey
Value: resend._domainkey.resend.com
TTL: Automatic
```

**Record 3: DMARC (TXT)**
```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none;
TTL: Automatic
```

6. Click **Save All Changes**

---

### Step 4: Wait for DNS Propagation

**What is DNS propagation?**
- It takes time for DNS changes to spread across the internet
- Usually takes: **5 minutes to 48 hours**
- Most of the time: **15-30 minutes**

**How to check if it's ready:**
1. Go back to Resend Dashboard: https://resend.com/domains
2. You'll see your domain status:
   - ⏳ **Pending** = Still waiting for DNS records
   - ✅ **Verified** = Ready to use!

**Tip:** You can use https://dnschecker.org to check if DNS records are propagated

---

### Step 5: Update Your Environment Variables

Once your domain is verified in Resend:

**For Production (`.env.production` or production hosting):**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

**For Development (`.env.local` - keep as is):**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Keep this for testing
NEXTAUTH_URL=http://localhost:3002
```

---

## Example: Complete Setup

Let's say your domain is `koutob.com`:

### 1. In Resend Dashboard:
- Add domain: `koutob.com`
- Get DNS records from Resend

### 2. In Your Domain Provider (e.g., Namecheap):
- Add the 3 DNS records (SPF, DKIM, DMARC)

### 3. Wait for Verification:
- Check Resend dashboard
- Status changes from "Pending" to "Verified" ✅

### 4. Update Production Environment:
```env
RESEND_FROM_EMAIL=noreply@koutob.com
```

### 5. Test:
```bash
npm run test-email customer@example.com
```

**Result:**
- Email FROM: `noreply@koutob.com` ✅
- Email TO: `customer@example.com`
- Looks professional! 🎉

---

## Common Email Addresses to Use

You can use any email address with your domain:

- `noreply@yourdomain.com` - Most common (no replies expected)
- `support@yourdomain.com` - For customer support
- `info@yourdomain.com` - General information
- `hello@yourdomain.com` - Friendly greeting
- `contact@yourdomain.com` - Contact inquiries

**For password reset emails, `noreply@yourdomain.com` is perfect.**

---

## Visual Example

### Before (Development):
```
┌─────────────────────────────────┐
│ From: onboarding@resend.dev     │  ← Resend's test email
│ To: customer@example.com        │
│ Subject: Password Reset         │
└─────────────────────────────────┘
```

### After (Production):
```
┌─────────────────────────────────┐
│ From: noreply@koutob.com        │  ← Your professional email
│ To: customer@example.com        │
│ Subject: Password Reset         │
└─────────────────────────────────┘
```

---

## Important Notes

1. **You don't need to create an actual email inbox**
   - `noreply@yourdomain.com` doesn't need to be a real mailbox
   - It's just the "FROM" address that appears in emails
   - Resend handles the actual sending

2. **DNS records are free**
   - No extra cost
   - Just configuration

3. **One domain = Multiple email addresses**
   - Once domain is verified, you can use:
     - `noreply@yourdomain.com`
     - `support@yourdomain.com`
     - `info@yourdomain.com`
     - Any email with your domain!

4. **Keep development email separate**
   - Development: `onboarding@resend.dev` (in `.env.local`)
   - Production: `noreply@yourdomain.com` (in production environment)

---

## Troubleshooting

### Domain Not Verifying?

1. **Check DNS records are correct:**
   - Use https://dnschecker.org
   - Make sure all 3 records are present

2. **Wait longer:**
   - Sometimes takes up to 48 hours
   - Usually works in 15-30 minutes

3. **Check for typos:**
   - Make sure domain name matches exactly
   - No extra spaces or characters

4. **Contact Resend Support:**
   - If still not working after 48 hours
   - They can help troubleshoot

### Can't Send Emails After Verification?

1. **Check environment variables:**
   - Make sure `RESEND_FROM_EMAIL` uses your domain
   - Format: `something@yourdomain.com`

2. **Check Resend dashboard:**
   - Make sure domain shows as "Verified" ✅
   - Not "Pending" ⏳

---

## Summary

**For Now (Development):**
- ✅ Keep using `onboarding@resend.dev`
- ✅ Works perfectly for testing
- ✅ No setup needed

**For Later (Production):**
1. Get a domain name
2. Add domain to Resend
3. Add DNS records to your domain provider
4. Wait for verification
5. Update `RESEND_FROM_EMAIL` to use your domain
6. Done! 🎉

**You don't need to do this now - only when you're ready to deploy to production!**












