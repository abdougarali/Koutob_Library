# Brevo Setup Steps - Quick Guide

## Step 1: Get Your Brevo List ID

1. **Login to Brevo Dashboard**
   - Go to https://app.brevo.com
   - Login with your account

2. **Navigate to Contacts → Lists**
   - Click on "Contacts" in the left sidebar
   - Click on "Lists"

3. **Create a List (if you don't have one)**
   - Click "Create a list"
   - Name it: "Newsletter Subscribers" (or any name you prefer)
   - Click "Create"

4. **Get the List ID**
   - After creating/selecting a list, look at the URL
   - URL format: `https://app.brevo.com/contacts/list/2`
   - The number at the end (`2`) is your **List ID**
   - **Copy this number** - you'll need it!

---

## Step 2: Add Environment Variables

### For Local Development (`.env.local`):

Create or edit `bookshop/.env.local`:

```bash
# Brevo ESP Integration
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_LIST_ID=2
```

**Important:**
- Replace `xkeysib-your-api-key-here` with your actual API key
- Replace `2` with your actual List ID

### For Production (Vercel):

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings → Environment Variables**
3. Add:
   - **Name:** `BREVO_API_KEY`
   - **Value:** Your API key (starts with `xkeysib-`)
   - **Environment:** Production (and Preview if needed)
   - Click **Save**

4. Add:
   - **Name:** `BREVO_LIST_ID`
   - **Value:** Your List ID (just the number, e.g., `2`)
   - **Environment:** Production (and Preview if needed)
   - Click **Save**

5. **Redeploy** your project after adding variables

---

## Step 3: Verify Setup

After adding environment variables, restart your dev server:

```bash
npm run dev
```

Check the console - you should see:
- No errors about missing BREVO_API_KEY
- No errors about missing BREVO_LIST_ID

---

## Next Steps

After completing these steps, the code implementation will:
1. ✅ Install Brevo SDK
2. ✅ Create ESP service
3. ✅ Update database model
4. ✅ Hook sync into subscription endpoints
5. ✅ Create admin sync endpoint
6. ✅ Update admin UI



