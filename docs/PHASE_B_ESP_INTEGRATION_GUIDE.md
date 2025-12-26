# Phase B: ESP Integration - Detailed Guide

## 📧 What is an ESP (Email Service Provider)?

An ESP is a third-party service that handles email delivery, templates, automation, and analytics. Instead of sending emails directly via SMTP (which can hit spam filters), ESPs provide:
- ✅ Better deliverability (emails reach inbox, not spam)
- ✅ Email templates & automation workflows
- ✅ Analytics (open rates, click rates, bounces)
- ✅ Compliance (GDPR, unsubscribe handling)
- ✅ Contact management (lists, segments, tags)

---

## Step 1: Choose ESP

### Option A: Brevo (Recommended) ⭐

**Why Brevo?**
- ✅ **Free tier**: 300 emails/day (perfect for MVP)
- ✅ **Arabic support**: RTL templates, Arabic fonts
- ✅ **Easy API**: Simple REST API
- ✅ **Good deliverability**: Especially for Middle East
- ✅ **Automation**: Welcome emails, drip campaigns

**Setup:**
1. Sign up at https://www.brevo.com
2. Go to **Settings > API Keys**
3. Create new API key (copy it - you'll need it)
4. Go to **Contacts > Lists** - create a list (note the List ID)

**Pricing:**
- Free: 300 emails/day
- Lite ($25/mo): 10,000 emails/month
- Premium: Custom pricing

### Option B: Mailchimp (Alternative)

**Why Mailchimp?**
- ✅ **Free tier**: 500 contacts, 1,000 emails/month
- ✅ **Popular**: Well-documented, lots of tutorials
- ✅ **Templates**: Many pre-built templates

**Setup:**
1. Sign up at https://mailchimp.com
2. Go to **Account > Extras > API keys**
3. Create API key
4. Get your **Audience ID** (from Audience settings)

**Pricing:**
- Free: 500 contacts, 1,000 emails/month
- Essentials ($13/mo): 500 contacts, 5,000 emails/month

### Option C: SendGrid (Alternative)

**Why SendGrid?**
- ✅ **Free tier**: 100 emails/day
- ✅ **Developer-friendly**: Great API docs
- ✅ **Transactional emails**: Good for order confirmations

**Pricing:**
- Free: 100 emails/day
- Essentials ($19.95/mo): 50,000 emails/month

---

## Step 2: Secure Secrets (Environment Variables)

### What are Environment Variables?

Environment variables store sensitive data (API keys, passwords) outside your code. They're:
- ✅ **Secure**: Not committed to Git
- ✅ **Flexible**: Different values for dev/production
- ✅ **Easy to manage**: Change without code changes

### Implementation:

#### 2.1 Create `.env.local` (Local Development)

Create file: `bookshop/.env.local`

```bash
# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=koutob

# Brevo (ESP)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_LIST_ID=2

# OR Mailchimp (Alternative)
# MAILCHIMP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1
# MAILCHIMP_LIST_ID=xxxxxxxxxx

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

**How to get Brevo credentials:**
1. Login to Brevo dashboard
2. Go to **Settings > API Keys**
3. Click "Generate a new API key"
4. Copy the key (starts with `xkeysib-`)
5. Go to **Contacts > Lists**
6. Create a list or use existing one
7. Click on list → URL shows ID: `https://app.brevo.com/contacts/list/2` → ID is `2`

#### 2.2 Add to Vercel (Production)

1. Go to Vercel dashboard → Your project
2. Go to **Settings > Environment Variables**
3. Add each variable:
   - `BREVO_API_KEY` = `xkeysib-...`
   - `BREVO_LIST_ID` = `2`
   - `MONGODB_URI` = `mongodb+srv://...`
   - `NEXT_PUBLIC_BASE_URL` = `https://yourdomain.com`

**Important:** 
- ✅ Mark as "Production" (and "Preview" if needed)
- ✅ Click "Save" after each variable
- ✅ Redeploy after adding variables

#### 2.3 Access in Code

```typescript
// ✅ Good - Server-side only
const apiKey = process.env.BREVO_API_KEY;

// ❌ Bad - Never expose in client-side
// const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY; // DON'T DO THIS!
```

**Why?** 
- Server-side env vars are secure (never sent to browser)
- `NEXT_PUBLIC_*` vars are exposed to browser (use only for public data)

---

## Step 3: Build Sync Service

### What is "Syncing"?

**Syncing** means keeping MongoDB and ESP in sync:
- When someone subscribes → Add to MongoDB AND Brevo
- When someone unsubscribes → Update MongoDB AND Brevo
- If sync fails → Retry later

### Architecture:

```
User subscribes → MongoDB (saved) → ESP API (sync) → Status updated
                                      ↓
                                   Success? → Status: "synced"
                                   Error? → Status: "error" (retry later)
```

### 3.1 Install ESP SDK

```bash
# For Brevo
npm install @getbrevo/brevo

# OR for Mailchimp
npm install @mailchimp/mailchimp_marketing
```

### 3.2 Create ESP Service

**File:** `bookshop/src/lib/services/espService.ts`

```typescript
import * as brevo from '@getbrevo/brevo';

// Initialize Brevo client
const brevoClient = new brevo.ContactsApi();
brevoClient.setApiKey(brevo.ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

export interface SyncResult {
  success: boolean;
  espContactId?: string;
  error?: string;
}

/**
 * Sync a subscriber to Brevo
 */
export async function syncSubscriberToESP(
  email: string,
  name?: string,
  source: string = "footer",
  tags: string[] = []
): Promise<SyncResult> {
  try {
    // Check if API key is configured
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_LIST_ID) {
      console.warn("[ESP] Brevo not configured, skipping sync");
      return { success: false, error: "ESP not configured" };
    }

    // Prepare contact data
    const contactData = new brevo.CreateContact();
    contactData.email = email;
    contactData.listIds = [Number(process.env.BREVO_LIST_ID)];
    
    if (name) {
      contactData.attributes = {
        FIRSTNAME: name,
        SOURCE: source,
      };
    }

    // Add tags (e.g., ["footer", "ar", "new_books"])
    if (tags.length > 0) {
      contactData.tags = tags;
    }

    // Double opt-in: Set to false if you want immediate subscription
    // Set to true if you want confirmation email first
    contactData.emailBlacklisted = false;
    contactData.smsBlacklisted = false;

    // Call Brevo API
    const response = await brevoClient.createContact(contactData);
    
    return {
      success: true,
      espContactId: response.id?.toString(),
    };
  } catch (error: any) {
    // Handle specific errors
    if (error.statusCode === 400 && error.body?.message?.includes("already exists")) {
      // Contact already exists - try to update instead
      return await updateSubscriberInESP(email, name, source, tags);
    }
    
    console.error("[ESP] Failed to sync subscriber:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Update existing subscriber in Brevo
 */
async function updateSubscriberInESP(
  email: string,
  name?: string,
  source?: string,
  tags?: string[]
): Promise<SyncResult> {
  try {
    const updateContact = new brevo.UpdateContact();
    
    if (name) {
      updateContact.attributes = {
        FIRSTNAME: name,
      };
    }

    if (tags && tags.length > 0) {
      updateContact.tags = tags;
    }

    await brevoClient.updateContact(email, updateContact);
    
    return { success: true };
  } catch (error: any) {
    console.error("[ESP] Failed to update subscriber:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Unsubscribe from ESP
 */
export async function unsubscribeFromESP(email: string): Promise<SyncResult> {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { success: false, error: "ESP not configured" };
    }

    const updateContact = new brevo.UpdateContact();
    updateContact.emailBlacklisted = true; // Blacklist = unsubscribe

    await brevoClient.updateContact(email, updateContact);
    
    return { success: true };
  } catch (error: any) {
    console.error("[ESP] Failed to unsubscribe:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}
```

### 3.3 Update NewsletterSubscriber Model

**File:** `bookshop/src/lib/models/NewsletterSubscriber.ts`

Add sync status fields:

```typescript
const NewsletterSubscriberSchema = new Schema(
  {
    // ... existing fields ...
    
    // ESP Sync fields (Phase B)
    espStatus: {
      type: String,
      enum: ["synced", "pending", "error"],
      default: "pending",
    },
    espContactId: { type: String }, // Brevo contact ID
    espLastSyncedAt: { type: Date },
    espSyncError: { type: String }, // Store error message if sync fails
  },
  {
    timestamps: true,
  },
);
```

### 3.4 Hook Sync into Subscription Endpoints

**File:** `bookshop/src/app/api/newsletter/subscribe/route.ts`

```typescript
import { syncSubscriberToESP } from "@/lib/services/espService";

export async function POST(request: Request) {
  // ... existing code to save to MongoDB ...
  
  // After saving to MongoDB, sync to ESP
  try {
    const tags = [
      subscriber.source, // "footer", "signup", "checkout"
      subscriber.locale || "ar",
      ...(subscriber.interests || []),
    ];

    const syncResult = await syncSubscriberToESP(
      subscriber.email,
      subscriber.name,
      subscriber.source,
      tags
    );

    // Update sync status
    if (syncResult.success) {
      subscriber.espStatus = "synced";
      subscriber.espContactId = syncResult.espContactId;
      subscriber.espLastSyncedAt = new Date();
      subscriber.espSyncError = undefined;
    } else {
      subscriber.espStatus = "error";
      subscriber.espSyncError = syncResult.error;
    }
    
    await subscriber.save();
  } catch (syncError) {
    // Don't fail subscription if ESP sync fails
    console.error("[Newsletter] ESP sync failed:", syncError);
    subscriber.espStatus = "error";
    subscriber.espSyncError = String(syncError);
    await subscriber.save();
  }
  
  // ... rest of code ...
}
```

### 3.5 Create Reconciliation Endpoint

**What is Reconciliation?**

Reconciliation = Compare MongoDB and ESP, fix any differences:
- MongoDB has subscriber but ESP doesn't → Sync to ESP
- ESP has contact but MongoDB doesn't → (Usually ignore, or add to MongoDB)
- Status is "error" → Retry sync

**File:** `bookshop/src/app/api/admin/newsletter/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { syncSubscriberToESP } from "@/lib/services/espService";

export async function POST(request: NextRequest) {
  try {
    // Check admin auth (use your existing admin guard)
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find all subscribers that need syncing
    const pendingSubscribers = await NewsletterSubscriberModel.find({
      $or: [
        { espStatus: "pending" },
        { espStatus: "error" },
      ],
      isActive: true,
    }).limit(100); // Process 100 at a time

    const results = {
      total: pendingSubscribers.length,
      synced: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sync each subscriber
    for (const subscriber of pendingSubscribers) {
      try {
        const tags = [
          subscriber.source,
          subscriber.locale || "ar",
          ...(subscriber.interests || []),
        ];

        const syncResult = await syncSubscriberToESP(
          subscriber.email,
          subscriber.name,
          subscriber.source,
          tags
        );

        if (syncResult.success) {
          subscriber.espStatus = "synced";
          subscriber.espContactId = syncResult.espContactId;
          subscriber.espLastSyncedAt = new Date();
          subscriber.espSyncError = undefined;
          results.synced++;
        } else {
          subscriber.espStatus = "error";
          subscriber.espSyncError = syncResult.error;
          results.failed++;
          results.errors.push(`${subscriber.email}: ${syncResult.error}`);
        }

        await subscriber.save();

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${subscriber.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.synced}/${results.total} subscribers`,
      results,
    });
  } catch (error: any) {
    console.error("[Sync] Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 3.6 Set Up Nightly Cron Job

**Option A: Vercel Cron (Recommended)**

**File:** `bookshop/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/admin/newsletter/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule format:** `minute hour day month weekday`
- `0 2 * * *` = Every day at 2:00 AM UTC
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 0` = Every Sunday at midnight

**Important:** Add secret header to cron:

**File:** `bookshop/src/app/api/admin/newsletter/sync/route.ts`

```typescript
// Allow Vercel cron secret
const cronSecret = request.headers.get("x-vercel-cron-secret");
const isCronRequest = cronSecret === process.env.CRON_SECRET;

// OR check for Vercel cron header
const isVercelCron = request.headers.get("x-vercel-cron") === "1";

if (!isCronRequest && !isVercelCron) {
  // Check admin key for manual requests
  const adminKey = request.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

**Option B: GitHub Actions (Alternative)**

**File:** `.github/workflows/sync-newsletter.yml`

```yaml
name: Sync Newsletter to ESP

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync
        run: |
          curl -X POST \
            -H "x-admin-key: ${{ secrets.ADMIN_KEY }}" \
            https://yourdomain.com/api/admin/newsletter/sync
```

---

## Step 4: Update Admin UI

### 4.1 Add Status Badges

**File:** `bookshop/src/components/admin/newsletter/NewsletterManager.tsx`

```typescript
// Add to the table columns
const columns = [
  // ... existing columns ...
  {
    header: "حالة المزامنة",
    accessor: "espStatus",
    render: (status: string) => {
      const badges = {
        synced: (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ متزامن
          </span>
        ),
        pending: (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ قيد الانتظار
          </span>
        ),
        error: (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ خطأ
          </span>
        ),
      };
      return badges[status as keyof typeof badges] || badges.pending;
    },
  },
  {
    header: "آخر مزامنة",
    accessor: "espLastSyncedAt",
    render: (date: Date | null) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("ar-SA");
    },
  },
];
```

### 4.2 Add Sync Button

```typescript
// Add sync button in the header
<button
  onClick={async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/admin/newsletter/sync", {
        method: "POST",
        headers: {
          "x-admin-key": localStorage.getItem("adminKey") || "",
        },
      });
      const data = await response.json();
      alert(`تم المزامنة: ${data.message}`);
      // Refresh subscribers list
      fetchSubscribers();
    } catch (error) {
      alert("فشلت المزامنة");
    } finally {
      setSyncing(false);
    }
  }}
  disabled={syncing}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  {syncing ? "جاري المزامنة..." : "مزامنة مع ESP"}
</button>
```

### 4.3 Add Retry Button for Failed Syncs

```typescript
// In the table row for error status
{subscriber.espStatus === "error" && (
  <button
    onClick={async () => {
      // Retry sync for this subscriber
      const response = await fetch(`/api/admin/newsletter/retry/${subscriber._id}`, {
        method: "POST",
        headers: {
          "x-admin-key": localStorage.getItem("adminKey") || "",
        },
      });
      if (response.ok) {
        fetchSubscribers(); // Refresh
      }
    }}
    className="text-sm text-blue-600 hover:text-blue-800"
  >
    إعادة المحاولة
  </button>
)}
```

---

## 📊 Summary: What We Built

1. ✅ **ESP Integration**: Brevo/Mailchimp connection
2. ✅ **Auto-sync**: New subscribers automatically sync to ESP
3. ✅ **Status tracking**: Know which subscribers are synced/pending/error
4. ✅ **Reconciliation**: Nightly job fixes any sync issues
5. ✅ **Admin UI**: See sync status, manually trigger sync, retry failed syncs

---

## 🧪 Testing Checklist

- [ ] Sign up for Brevo account
- [ ] Add API key to `.env.local`
- [ ] Test subscription from footer → Check Brevo dashboard
- [ ] Test subscription from signup → Check Brevo dashboard
- [ ] Test subscription from checkout → Check Brevo dashboard
- [ ] Check sync status in admin UI
- [ ] Test manual sync button
- [ ] Test retry button for failed syncs
- [ ] Verify nightly cron job runs (check Vercel logs)

---

## 🚨 Common Issues & Solutions

### Issue: "ESP not configured"
**Solution:** Make sure `BREVO_API_KEY` and `BREVO_LIST_ID` are in `.env.local` and Vercel

### Issue: "Contact already exists"
**Solution:** The service handles this by updating existing contact instead of creating new one

### Issue: "Rate limit exceeded"
**Solution:** Add delays between API calls (already included in sync endpoint)

### Issue: "Sync status stuck on 'pending'"
**Solution:** Run manual sync or wait for nightly cron job

---

## 📚 Next Steps

After Phase B is complete:
- **Phase C**: Automations (Welcome emails, post-purchase follow-ups)
- **Phase D**: Referral & Loyalty system
- **Phase E**: Compliance & Documentation



