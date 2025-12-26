# 🔍 Debug Email Delivery Issue

## Problem: Customers Not Receiving Verification Emails

Even though `onboarding@resend.dev` should work, emails are not being received.

---

## Step 1: Check Terminal When Server Starts

When you run `npm run dev`, you should see:

```
[Email Service] Configuration check:
  - RESEND_API_KEY: Set (re_xxxxx...)
  - RESEND_FROM_EMAIL: onboarding@resend.dev
[Email Service] ✅ Resend initialized successfully
```

**If you see:**
- `RESEND_API_KEY: NOT SET` → **Problem found!** Add it to `.env.local`
- `RESEND_FROM_EMAIL: NOT SET` → **Problem found!** Add it to `.env.local`

---

## Step 2: Check Terminal When Signing Up

When a customer signs up, check the terminal for:

### ✅ Success (Email Sent):
```
[Signup] ✅ Verification token successfully saved to database!
✅ VERIFICATION EMAIL SENT SUCCESSFULLY
To: customer@example.com
Check your inbox and spam folder
Also check: https://resend.com/emails
```

### ❌ Failure (Email NOT Sent):
```
[Signup] ✅ Verification token successfully saved to database!
⚠️ VERIFICATION EMAIL NOT SENT
Reason: RESEND_API_KEY not configured or email service error
🔗 EMAIL VERIFICATION LINK (Development Mode):
http://localhost:3002/verify-email/[token]
```

**If you see the ❌ message:**
- Email service is not configured correctly
- Check `.env.local` file

---

## Step 3: Verify `.env.local` File

**Location:** `bookshop/.env.local`

**Must contain:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXTAUTH_URL=http://localhost:3002
```

**Common mistakes:**
- ❌ `RESEND_API_KEY="re_xxxxx"` (don't use quotes)
- ❌ `RESEND_API_KEY = re_xxxxx` (no spaces around `=`)
- ❌ `RESEND_FROM_EMAIL=abouda.garali@gmail.com` (can't use Gmail)
- ✅ `RESEND_API_KEY=re_xxxxx` (correct)
- ✅ `RESEND_FROM_EMAIL=onboarding@resend.dev` (correct)

---

## Step 4: Test Email Service Directly

Run this command to test if email service works:

```bash
cd bookshop
npm run test-email your@email.com
```

**Expected output:**
```
✅ Email sent successfully!
   Email ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   To: your@email.com
```

**If you see error:**
- Check the error message
- Fix the issue
- Try again

---

## Step 5: Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Log in to your Resend account
3. Check the **Emails** section

**You should see:**
- ✅ **Delivered** - Email was sent (check spam folder)
- ⏳ **Pending** - Email is being processed
- ❌ **Failed** - Check error message

---

## Common Issues & Solutions

### Issue 1: "RESEND_API_KEY: NOT SET"
**Solution:**
1. Get API key from https://resend.com
2. Add to `.env.local`: `RESEND_API_KEY=re_xxxxx`
3. Restart server

### Issue 2: "RESEND_FROM_EMAIL: NOT SET"
**Solution:**
1. Add to `.env.local`: `RESEND_FROM_EMAIL=onboarding@resend.dev`
2. Restart server

### Issue 3: "Domain not verified" Error
**Solution:**
- Make sure `RESEND_FROM_EMAIL=onboarding@resend.dev`
- Don't use your own email (like Gmail)

### Issue 4: Email Shows "Delivered" but Not Received
**Solution:**
1. Check spam folder
2. Wait 5-10 minutes
3. Try different email address
4. Check Resend dashboard for actual status

### Issue 5: Server Not Reading `.env.local`
**Solution:**
1. Make sure file is in `bookshop/` directory (not root)
2. Restart server after changing `.env.local`
3. Check file name is exactly `.env.local` (not `.env.local.txt`)

---

## Quick Checklist

- [ ] `.env.local` file exists in `bookshop/` directory
- [ ] `RESEND_API_KEY` is set (starts with `re_`)
- [ ] `RESEND_FROM_EMAIL=onboarding@resend.dev` is set
- [ ] No quotes around values in `.env.local`
- [ ] No spaces around `=` sign
- [ ] Server was restarted after changing `.env.local`
- [ ] Terminal shows "✅ Resend initialized successfully"
- [ ] `npm run test-email` works
- [ ] Checked Resend dashboard

---

## What to Send Me

When asking for help, please provide:

1. **Terminal output when server starts:**
   ```
   [Email Service] Configuration check:
   ...
   ```

2. **Terminal output when signing up:**
   ```
   [Signup] ...
   ✅ VERIFICATION EMAIL SENT SUCCESSFULLY
   OR
   ⚠️ VERIFICATION EMAIL NOT SENT
   ```

3. **Result of test command:**
   ```bash
   npm run test-email your@email.com
   ```

4. **What you see in Resend dashboard:**
   - Emails appear?
   - Status (Delivered/Failed/Pending)?

---

## Still Not Working?

1. **Double-check `.env.local`:**
   - File location: `bookshop/.env.local`
   - No typos
   - No extra spaces
   - No quotes

2. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

3. **Test email service:**
   ```bash
   npm run test-email your@email.com
   ```

4. **Check Resend account:**
   - API key is active?
   - Account has credits?
   - Check Resend dashboard

---

**Remember:** `onboarding@resend.dev` works immediately - no domain setup needed!























