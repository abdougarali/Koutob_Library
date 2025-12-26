# 📧 SMTP Email Setup Guide (FREE)

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
2. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: **Library Project**
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

#### Step 3: Add to `.env.local`

```env
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Important:**
- Use the **16-character app password**, not your regular Gmail password
- Remove spaces from app password: `abcdefghijklmnop`

---

### Option 2: Outlook/Hotmail SMTP

**Free, works immediately**

#### Step 1: Enable App Password
1. Go to: https://account.microsoft.com/security
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate app password for **Mail**

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

```env
# SMTP Configuration (Gmail - Recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abouda.garali@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=abouda.garali@gmail.com

# Optional: Keep Resend as backup (or remove)
# RESEND_API_KEY=re_xxxxx
# RESEND_FROM_EMAIL=onboarding@resend.dev

# Other settings
NEXTAUTH_URL=http://localhost:3002
```

---

## 🧪 Test SMTP Configuration

Run this command to test:

```bash
cd bookshop
npm run test-email-smtp your@email.com
```

**Expected output:**
```
✅ Email sent successfully via SMTP!
   To: your@email.com
   Message ID: <xxxxx>
```

---

## 📊 How It Works

1. **SMTP is checked first** - If configured, uses SMTP (free)
2. **Resend as fallback** - If SMTP not configured, uses Resend
3. **Automatic selection** - No code changes needed

---

## ⚙️ SMTP Settings for Different Providers

| Provider | SMTP_HOST | SMTP_PORT | SMTP_SECURE |
|----------|-----------|-----------|-------------|
| Gmail | `smtp.gmail.com` | `587` | `false` |
| Outlook | `smtp-mail.outlook.com` | `587` | `false` |
| Yahoo | `smtp.mail.yahoo.com` | `587` | `false` |
| Custom | Your SMTP server | `587` or `465` | `false` or `true` |

---

## 🚨 Common Issues & Solutions

### Issue 1: "EAUTH" Error
**Problem:** Wrong password or app password not used

**Solution:**
- Make sure you're using **App Password**, not regular password
- For Gmail: Generate app password from https://myaccount.google.com/apppasswords
- Remove spaces from app password

### Issue 2: "ECONNECTION" Error
**Problem:** Wrong SMTP_HOST or SMTP_PORT

**Solution:**
- Check SMTP_HOST is correct for your provider
- Check SMTP_PORT (usually 587 for TLS, 465 for SSL)

### Issue 3: "Less secure app" Error (Gmail)
**Problem:** Gmail blocking access

**Solution:**
- Use **App Password** (not regular password)
- Enable 2-Step Verification first
- Generate app password from Google Account settings

### Issue 4: Emails Going to Spam
**Problem:** Email provider marking as spam

**Solution:**
- This is normal for new SMTP accounts
- Ask recipients to mark as "Not Spam"
- Over time, delivery improves

---

## 📈 Email Limits

| Provider | Daily Limit | Notes |
|----------|-------------|-------|
| Gmail | 500 emails/day | Personal account |
| Outlook | 300 emails/day | Personal account |
| Yahoo | 500 emails/day | Personal account |

**For production:** Consider upgrading to business email or using email service (SendGrid, Mailgun)

---

## ✅ Advantages of SMTP

1. **100% FREE** - No costs
2. **No API keys** - Just email and app password
3. **Works immediately** - No verification needed
4. **Works with ANY recipient** - No restrictions
5. **Reliable** - Direct SMTP connection

---

## 🎯 Quick Start

1. **Choose provider** (Gmail recommended)
2. **Enable 2-Step Verification**
3. **Generate App Password**
4. **Add to `.env.local`**
5. **Restart server**
6. **Test with:** `npm run test-email-smtp your@email.com`

---

## 📝 Notes

- **SMTP has priority** - If SMTP is configured, it will be used
- **Resend as backup** - If SMTP fails, can fallback to Resend
- **No code changes** - System automatically uses SMTP if configured
- **Works for all emails** - No restrictions on recipient addresses

---

**You're all set! SMTP is now your free email solution! 🎉**























