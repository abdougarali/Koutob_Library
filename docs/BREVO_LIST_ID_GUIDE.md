# How to Get Your Brevo List ID - Step by Step

## ✅ What You DON'T Need to Configure (For Now)

You're seeing these options in Brevo:
- ❌ **Attributs des contacts** (Contact Attributes) - Not needed now
- ❌ **Attributs des entreprises** (Company Attributes) - Not needed now
- ❌ **Webhooks** - Not needed now
- ❌ **Contacts non engagés** (Unengaged Contacts) - Not needed now
- ❌ **Ouvertures Apple MPP** - Not needed now

**You can skip all of these for Phase B!**

---

## ✅ What You DO Need: List ID

### Step 1: Go to Lists (Not Settings)

1. In Brevo dashboard, click on **"Contacts"** in the left sidebar
2. Click on **"Lists"** (NOT "Settings" or "Contact Attributes")
3. You should see a page with your contact lists

### Step 2: Create a List (If You Don't Have One)

1. Click **"Create a list"** button (or "Créer une liste")
2. Enter a name: **"Newsletter Subscribers"** (or any name you prefer)
3. Click **"Create"** (or "Créer")

### Step 3: Get the List ID

1. After creating/selecting a list, look at the **URL in your browser**
2. The URL will look like:
   ```
   https://app.brevo.com/contacts/list/2
   ```
3. The number at the end (`2`) is your **List ID**
4. **Copy this number** - you'll need it!

---

## 📸 Visual Guide

```
Brevo Dashboard
├── Contacts (Click here)
│   ├── Lists ← GO HERE! (Not Settings)
│   │   ├── Create a list
│   │   └── Your List (URL shows ID: /list/2)
│   ├── Settings ← You were here (skip for now)
│   │   ├── Contact Attributes
│   │   ├── Webhooks
│   │   └── etc.
│   └── Contacts (individual contacts)
```

---

## 🎯 Quick Steps Summary

1. **Click "Contacts"** in left sidebar
2. **Click "Lists"** (not Settings)
3. **Create a list** (if needed) or **select existing list**
4. **Look at URL** → Copy the number after `/list/`
5. **That's your List ID!**

---

## ✅ Example

If your URL is:
```
https://app.brevo.com/contacts/list/5
```

Then your **List ID is: `5`**

Add it to `.env.local`:
```bash
BREVO_LIST_ID=5
```

---

## 🚨 Common Mistake

**Don't go to:**
- Contacts → Settings → Contact Attributes ❌

**Go to:**
- Contacts → Lists ✅

---

## 📝 Next Steps After Getting List ID

1. Add to `.env.local`:
   ```bash
   BREVO_API_KEY=xkeysib-your-key-here
   BREVO_LIST_ID=2  # Your actual List ID
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Test subscription!

---

**That's it! You don't need to configure anything else in Brevo for Phase B.**



