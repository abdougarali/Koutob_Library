# 📧 SMTP Email Setup Guide (FREE) - English

## ✅ Free Email Solution Using SMTP

This guide shows you how to set up **FREE email sending** using SMTP (Gmail, Outlook, etc.)

---

## 🎯 Why SMTP?

- ✅ **100% FREE** - No API keys needed
- ✅ **Works with ANY email address** - No restrictions
- ✅ **No domain verification needed** - Use your Gmail/Outlook
- ✅ **Unlimited emails** (within provider limits)
- ✅ **Reliable delivery** - Direct SMTP connection

---

## 📋 Setup Options

### Option 1: Gmail SMTP (Recommended - Easiest)

**Free, works immediately, 500 emails/day limit**

#### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Click on **2-Step Verification**
3. Follow the steps to enable it
4. You'll need your phone number

#### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - If you don't see this link, make sure 2-Step Verification is enabled first
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Library Project** (or any name you want)
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
   - **Important:** Remove all spaces when using it
   - Example: `abcdefghijklmnop`

#### Step 3: Add to `.env.local`

Open `bookshop/.env.local` and add:

```env
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Important Notes:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with your **16-character app password** (no spaces)
- Use the **App Password**, NOT your regular Gmail password

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abouda.garali@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=abouda.garali@gmail.com
```

**Wait!** Remove spaces from the password:
```env
SMTP_PASSWORD=abcdefghijklmnop
```

---

### Option 2: Outlook/Hotmail SMTP

**Free, works immediately**

#### Step 1: Enable App Password

1. Go to: https://account.microsoft.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** section
4. Click **Create a new app password**
5. Select **Mail** and your device
6. Click **Generate**
7. **Copy the app password**

#### Step 2: Add to `.env.local`

```env
# SMTP Configuration (Outlook)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@outlook.com
```

---

### Option 3: Yahoo SMTP

**Free, works immediately**

#### Step 1: Enable App Password

1. Go to: https://login.yahoo.com/account/security
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate app password for **Mail**

#### Step 2: Add to `.env.local`

```env
# SMTP Configuration (Yahoo)
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@yahoo.com
```

---

## 🔧 Complete `.env.local` Example

Your `bookshop/.env.local` file should look like this:

```env
# SMTP Configuration (Gmail - Recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abouda.garali@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=abouda.garali@gmail.com

# Optional: Keep Resend as backup (or remove these lines)
# RESEND_API_KEY=re_xxxxx
# RESEND_FROM_EMAIL=onboarding@resend.dev

# Other settings
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key
MONGODB_URI=your-mongodb-uri
```

---

## 🧪 Test SMTP Configuration

### Step 1: Restart Your Server

After adding SMTP settings to `.env.local`:

1. Stop the server (Press `Ctrl+C` in terminal)
2. Start again: `npm run dev`

### Step 2: Run Test Command

```bash
cd bookshop
npm run test-email-smtp your@email.com
```

Replace `your@email.com` with your actual email address.

**Expected output:**
```
✅ SMTP Configuration:
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: Set

📬 Test email will be sent to: your@email.com

📤 Sending test email via SMTP...

✅ Email sent successfully via SMTP!
   To: your@email.com

💡 Next steps:
   1. Check your inbox (and spam folder)
   2. If email received → SMTP is working! ✅
```

---

## 📊 How It Works

1. **SMTP is checked first** - If configured, uses SMTP (free)
2. **Resend as fallback** - If SMTP not configured, uses Resend
3. **Automatic selection** - No code changes needed

When you sign up or request password reset:
- System checks if SMTP is configured
- If yes → Uses SMTP (free, works with any email)
- If no → Uses Resend (if configured)

---

## ⚙️ SMTP Settings for Different Providers

| Provider | SMTP_HOST | SMTP_PORT | SMTP_SECURE |
|----------|-----------|-----------|-------------|
| **Gmail** | `smtp.gmail.com` | `587` | `false` |
| **Outlook** | `smtp-mail.outlook.com` | `587` | `false` |
| **Yahoo** | `smtp.mail.yahoo.com` | `587` | `false` |
| **Custom** | Your SMTP server | `587` or `465` | `false` or `true` |

---

## 🚨 Common Issues & Solutions

### Issue 1: "EAUTH" Error

**Error Message:**
```
[Email Service SMTP] ❌ Error sending email: Invalid login
Error code: EAUTH
```

**Problem:** Wrong password or app password not used

**Solution:**
1. Make sure you're using **App Password**, not regular password
2. For Gmail: 
   - Go to https://myaccount.google.com/apppasswords
   - Generate a new app password
   - Copy it (16 characters)
   - Remove all spaces when adding to `.env.local`
3. Double-check `SMTP_USER` and `SMTP_PASSWORD` in `.env.local`
4. Make sure there are no extra spaces or quotes

---

### Issue 2: "ECONNECTION" or "ETIMEDOUT" Error

**Error Message:**
```
[Email Service SMTP] ❌ Error sending email: Connection timeout
Error code: ECONNECTION
```

**Problem:** Wrong SMTP_HOST or SMTP_PORT

**Solution:**
1. Check `SMTP_HOST` is correct for your provider:
   - Gmail: `smtp.gmail.com`
   - Outlook: `smtp-mail.outlook.com`
   - Yahoo: `smtp.mail.yahoo.com`
2. Check `SMTP_PORT`:
   - Usually `587` for TLS (SMTP_SECURE=false)
   - Or `465` for SSL (SMTP_SECURE=true)
3. Try port `465` with `SMTP_SECURE=true` if `587` doesn't work

---

### Issue 3: "Less secure app" Error (Gmail)

**Error Message:**
```
[Email Service SMTP] ❌ Error: Less secure app access
```

**Problem:** Gmail blocking access

**Solution:**
1. **Don't use "Less secure app"** - It's deprecated
2. Use **App Password** instead:
   - Enable 2-Step Verification
   - Generate App Password from https://myaccount.google.com/apppasswords
   - Use the 16-character app password (not your regular password)

---

### Issue 4: Emails Going to Spam

**Problem:** Email provider marking as spam

**Solution:**
1. This is normal for new SMTP accounts
2. Ask recipients to:
   - Check spam/junk folder
   - Mark email as "Not Spam"
   - Add sender to contacts
3. Over time, delivery improves as your account reputation builds

---

### Issue 5: "SMTP not configured" Message

**Error Message:**
```
[Email Service SMTP] ⚠️ SMTP not configured - emails will not be sent
```

**Problem:** SMTP settings missing in `.env.local`

**Solution:**
1. Check `.env.local` file exists in `bookshop/` directory
2. Make sure all SMTP variables are set:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
3. Restart server after changing `.env.local`

---

## 📈 Email Limits

| Provider | Daily Limit | Notes |
|----------|-------------|-------|
| **Gmail** | 500 emails/day | Personal account |
| **Outlook** | 300 emails/day | Personal account |
| **Yahoo** | 500 emails/day | Personal account |

**For production:** Consider upgrading to business email or using email service (SendGrid, Mailgun)

---

## ✅ Advantages of SMTP

1. **100% FREE** - No costs
2. **No API keys** - Just email and app password
3. **Works immediately** - No verification needed
4. **Works with ANY recipient** - No restrictions on email addresses
5. **Reliable** - Direct SMTP connection
6. **No domain setup** - Use your existing email

---

## 🎯 Quick Start Checklist

- [ ] Choose email provider (Gmail recommended)
- [ ] Enable 2-Step Verification
- [ ] Generate App Password
- [ ] Add SMTP settings to `.env.local`
- [ ] Remove spaces from app password
- [ ] Restart server
- [ ] Test with: `npm run test-email-smtp your@email.com`
- [ ] Check inbox (and spam folder)
- [ ] ✅ Done! SMTP is working!

---

## 📝 Important Notes

- **SMTP has priority** - If SMTP is configured, it will be used automatically
- **Resend as backup** - If SMTP fails, can fallback to Resend (if configured)
- **No code changes** - System automatically uses SMTP if configured
- **Works for all emails** - No restrictions on recipient addresses
- **Use App Password** - Never use your regular email password

---

## 🔍 Verify It's Working

### Check Terminal When Server Starts

You should see:
```
[Email Service SMTP] Configuration check:
  - SMTP_HOST: smtp.gmail.com
  - SMTP_PORT: 587
  - SMTP_USER: your-email@gmail.com
  - SMTP_PASSWORD: Set
  - SMTP Configured: ✅ Yes
[Email Service SMTP] ✅ SMTP transporter created successfully
```

### Check Terminal When Sending Email

You should see:
```
[Email Service] Using SMTP (free) to send email
[Email Service SMTP] ✅ Email sent successfully to customer@example.com
```

---

## 🆘 Still Having Issues?

1. **Double-check `.env.local`:**
   - File location: `bookshop/.env.local`
   - No typos
   - No extra spaces
   - No quotes around values
   - App password has no spaces

2. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

3. **Test SMTP:**
   ```bash
   npm run test-email-smtp your@email.com
   ```

4. **Check error messages:**
   - Read terminal output carefully
   - Look for specific error codes (EAUTH, ECONNECTION, etc.)
   - Follow the solution for that error

---

## 📚 Additional Resources

- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Outlook App Passwords:** https://account.microsoft.com/security
- **Yahoo App Passwords:** https://login.yahoo.com/account/security

---

**You're all set! SMTP is now your free email solution! 🎉**

**After setup, your emails will work with ANY email address - no restrictions!**












