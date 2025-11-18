# Email Delivery Troubleshooting Guide

## Problem: Customers Not Receiving Password Reset Emails

Follow these steps to diagnose and fix email delivery issues.

---

## Step 1: Verify Environment Variables

### Check `.env.local` file exists in `bookshop/` directory

Your `.env.local` should contain:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXTAUTH_URL=http://localhost:3002
```

### How to get Resend API Key:

1. Go to https://resend.com
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `re_`)
6. Paste it in `.env.local` as `RESEND_API_KEY`

### For Testing (Use This First):

```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

This email is pre-verified by Resend and works immediately for testing.

---

## Step 2: Check Terminal Logs

When you start the server, you should see:

```
[Email Service] Configuration check:
  - RESEND_API_KEY: Set (re_xxxxx...)
  - RESEND_FROM_EMAIL: onboarding@resend.dev
[Email Service] ✅ Resend initialized successfully
```

**If you see:**
- `RESEND_API_KEY: NOT SET` → Add the API key to `.env.local`
- `RESEND_FROM_EMAIL: NOT SET` → Add `RESEND_FROM_EMAIL=onboarding@resend.dev` to `.env.local`

---

## Step 3: Test Email Sending

When a customer requests password reset, check the terminal for:

### ✅ Success Logs:
```
[Email Service] Attempting to send email...
[Email Service] From: onboarding@resend.dev
[Email Service] To: customer@example.com
[Email Service] Subject: إعادة تعيين كلمة المرور - مكتبة كتب الإسلامية
[Email Service] ✅ Email sent successfully to customer@example.com
[Email Service] Email ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[Email Service] 📧 Check Resend Dashboard: https://resend.com/emails
```

### ❌ Error Logs (Common Issues):

#### Issue 1: API Key Not Set
```
[Email Service] ⚠️ RESEND_API_KEY not configured - emails will not be sent
```
**Fix:** Add `RESEND_API_KEY` to `.env.local`

#### Issue 2: Invalid FROM Email
```
[Email Service] ❌ Invalid FROM email. Please set RESEND_FROM_EMAIL in .env.local
```
**Fix:** Add `RESEND_FROM_EMAIL=onboarding@resend.dev` to `.env.local`

#### Issue 3: Domain Not Verified
```
[Email Service] ❌ Resend API Error:
  - Message: Domain not verified
```
**Fix:** Use `onboarding@resend.dev` for testing, or verify your domain in Resend dashboard

#### Issue 4: Invalid API Key
```
[Email Service] ❌ Resend API Error:
  - Message: Invalid API key
```
**Fix:** 
1. Check the API key in `.env.local` is correct
2. Make sure there are no extra spaces
3. Regenerate the key in Resend dashboard if needed

---

## Step 4: Check Resend Dashboard

1. Go to https://resend.com/emails
2. Log in to your Resend account
3. Check the **Emails** section

You should see:
- ✅ **Delivered** - Email was sent successfully
- ⏳ **Pending** - Email is being processed
- ❌ **Failed** - Email failed to send (check error message)
- 📧 **Bounced** - Email was rejected by recipient's server

### If Email Shows as "Delivered" but Customer Didn't Receive:

1. **Check Spam Folder** - Most common issue
2. **Check Email Address** - Make sure customer entered correct email
3. **Email Provider Blocking** - Some providers (Gmail, Outlook) may delay emails
4. **Wait a Few Minutes** - Sometimes there's a delay

---

## Step 5: Common Fixes

### Fix 1: Restart Development Server

After changing `.env.local`:
1. Stop the server (Ctrl+C)
2. Start again: `npm run dev`
3. Try sending email again

### Fix 2: Verify API Key Format

The API key should:
- Start with `re_`
- Be about 40-50 characters long
- Have no spaces or quotes

**Wrong:**
```env
RESEND_API_KEY="re_xxxxx"  # ❌ Don't use quotes
RESEND_API_KEY= re_xxxxx   # ❌ No spaces
```

**Correct:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx  # ✅
```

### Fix 3: Check Email Address Format

Make sure customer's email is valid:
- ✅ `customer@example.com`
- ❌ `customer@example` (missing TLD)
- ❌ `customer example.com` (has space)

---

## Step 6: Test with Development Link

If email service is not configured, the system will show a development reset link in the browser. This is for testing only.

**To receive actual emails:**
1. Set up Resend API key
2. Use `onboarding@resend.dev` as FROM email
3. Restart server
4. Try again

---

## Step 7: Production Setup

For production, you need to:

1. **Verify Your Domain** in Resend:
   - Go to Resend Dashboard → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification

2. **Update `.env.local`** (or production environment):
   ```env
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Test in Production:**
   - Send test email
   - Check Resend dashboard
   - Verify delivery

---

## Quick Checklist

- [ ] `.env.local` file exists in `bookshop/` directory
- [ ] `RESEND_API_KEY` is set and correct
- [ ] `RESEND_FROM_EMAIL` is set (use `onboarding@resend.dev` for testing)
- [ ] Server was restarted after changing `.env.local`
- [ ] Terminal shows "✅ Resend initialized successfully"
- [ ] Terminal shows "✅ Email sent successfully" when testing
- [ ] Checked Resend dashboard at https://resend.com/emails
- [ ] Customer checked spam folder
- [ ] Customer's email address is correct

---

## Still Not Working?

1. **Check Resend Dashboard** - See actual error messages
2. **Check Terminal Logs** - Look for error messages
3. **Verify API Key** - Make sure it's active in Resend
4. **Test with Different Email** - Try your own email address
5. **Check Resend Status** - https://status.resend.com

---

## Support

If emails are showing as "Delivered" in Resend but not arriving:
- This is usually a recipient email provider issue
- Check spam folder
- Wait 5-10 minutes
- Try a different email address

If Resend shows errors:
- Check the error message in terminal
- Check Resend dashboard for details
- Follow the error-specific fix above












