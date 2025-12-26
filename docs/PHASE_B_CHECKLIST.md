# Phase B: ESP Integration - Implementation Checklist

## 📋 Quick Reference

### Prerequisites
- [ ] Phase A completed (NewsletterSubscriber model, Admin UI, APIs)
- [ ] MongoDB connected and working
- [ ] Admin panel accessible

---

## Step 1: Choose & Setup ESP

### Brevo Setup
- [ ] Sign up at https://www.brevo.com
- [ ] Verify email address
- [ ] Go to **Settings > API Keys**
- [ ] Create new API key → Copy it
- [ ] Go to **Contacts > Lists**
- [ ] Create a new list (or use default)
- [ ] Note the List ID (from URL: `/list/2` → ID is `2`)

### Alternative: Mailchimp
- [ ] Sign up at https://mailchimp.com
- [ ] Go to **Account > Extras > API keys**
- [ ] Create API key
- [ ] Get Audience ID from **Audience settings**

---

## Step 2: Configure Environment Variables

### Local Development (`.env.local`)
- [ ] Create/update `bookshop/.env.local`
- [ ] Add `BREVO_API_KEY=xkeysib-...`
- [ ] Add `BREVO_LIST_ID=2`
- [ ] Verify `MONGODB_URI` is set
- [ ] Verify `NEXT_PUBLIC_BASE_URL=http://localhost:3002`

### Production (Vercel)
- [ ] Go to Vercel dashboard → Your project
- [ ] Go to **Settings > Environment Variables**
- [ ] Add `BREVO_API_KEY` (mark as Production)
- [ ] Add `BREVO_LIST_ID` (mark as Production)
- [ ] Click **Save** for each variable
- [ ] Redeploy project (or wait for next deployment)

---

## Step 3: Install Dependencies

```bash
# For Brevo
npm install @getbrevo/brevo

# OR for Mailchimp
npm install @mailchimp/mailchimp_marketing
```

- [ ] Run `npm install` command
- [ ] Verify package appears in `package.json`

---

## Step 4: Update Database Model

**File:** `bookshop/src/lib/models/NewsletterSubscriber.ts`

- [ ] Add `espStatus` field (enum: "synced", "pending", "error")
- [ ] Add `espContactId` field (String, optional)
- [ ] Add `espLastSyncedAt` field (Date, optional)
- [ ] Add `espSyncError` field (String, optional)
- [ ] Add index on `espStatus` (optional, for performance)

---

## Step 5: Create ESP Service

**File:** `bookshop/src/lib/services/espService.ts`

- [ ] Create file
- [ ] Import Brevo/Mailchimp SDK
- [ ] Initialize client with API key
- [ ] Implement `syncSubscriberToESP()` function
- [ ] Implement `updateSubscriberInESP()` function
- [ ] Implement `unsubscribeFromESP()` function
- [ ] Add error handling
- [ ] Add logging

---

## Step 6: Hook Sync into Subscription Endpoints

**Files to update:**
- [ ] `bookshop/src/app/api/newsletter/subscribe/route.ts`
- [ ] `bookshop/src/app/api/orders/route.ts` (checkout subscription)
- [ ] `bookshop/src/app/api/auth/verify-email/[token]/route.ts` (signup subscription)

**For each file:**
- [ ] Import `syncSubscriberToESP` from espService
- [ ] After saving to MongoDB, call sync function
- [ ] Update `espStatus` based on result
- [ ] Save sync result to database
- [ ] Don't fail subscription if sync fails (log error only)

---

## Step 7: Create Reconciliation Endpoint

**File:** `bookshop/src/app/api/admin/newsletter/sync/route.ts`

- [ ] Create file
- [ ] Add admin authentication check
- [ ] Query subscribers with status "pending" or "error"
- [ ] Loop through and sync each one
- [ ] Update status after sync
- [ ] Return summary (synced count, failed count, errors)
- [ ] Add rate limiting protection (delay between calls)

---

## Step 8: Setup Nightly Cron Job

### Option A: Vercel Cron (Recommended)

**File:** `bookshop/vercel.json`

- [ ] Create/update `vercel.json`
- [ ] Add cron configuration:
  ```json
  {
    "crons": [{
      "path": "/api/admin/newsletter/sync",
      "schedule": "0 2 * * *"
    }]
  }
  ```
- [ ] Update sync endpoint to accept Vercel cron header
- [ ] Add `CRON_SECRET` to environment variables (optional, for security)

### Option B: GitHub Actions (Alternative)

**File:** `.github/workflows/sync-newsletter.yml`

- [ ] Create workflow file
- [ ] Configure schedule (cron syntax)
- [ ] Add API call to sync endpoint
- [ ] Add `ADMIN_KEY` to GitHub Secrets

---

## Step 9: Update Admin UI

**File:** `bookshop/src/components/admin/newsletter/NewsletterManager.tsx`

### Add Status Column
- [ ] Add "حالة المزامنة" column to table
- [ ] Create status badge component (synced/pending/error)
- [ ] Display badge based on `espStatus` field

### Add Last Sync Column
- [ ] Add "آخر مزامنة" column
- [ ] Format date in Arabic locale
- [ ] Show "-" if never synced

### Add Sync Button
- [ ] Add "مزامنة مع ESP" button in header
- [ ] Call `/api/admin/newsletter/sync` on click
- [ ] Show loading state while syncing
- [ ] Display success/error message
- [ ] Refresh subscriber list after sync

### Add Retry Button
- [ ] Show retry button for rows with status "error"
- [ ] Create retry endpoint: `/api/admin/newsletter/retry/[id]`
- [ ] Call sync for single subscriber
- [ ] Update UI after retry

---

## Step 10: Testing

### Manual Testing
- [ ] Test subscription from footer → Check Brevo dashboard
- [ ] Test subscription from signup → Check Brevo dashboard
- [ ] Test subscription from checkout → Check Brevo dashboard
- [ ] Check sync status in admin UI (should show "synced")
- [ ] Test manual sync button
- [ ] Test retry button for failed sync
- [ ] Verify subscribers appear in Brevo dashboard

### Error Testing
- [ ] Temporarily break API key → Should show "error" status
- [ ] Fix API key → Retry sync → Should show "synced"
- [ ] Test with invalid email → Should handle gracefully

### Cron Testing
- [ ] Manually trigger cron (or wait for scheduled time)
- [ ] Check Vercel logs for cron execution
- [ ] Verify pending subscribers get synced

---

## Step 11: Documentation

- [ ] Document Brevo API key location (for team)
- [ ] Document how to add new environment variables
- [ ] Document how to manually trigger sync
- [ ] Document how to check sync status
- [ ] Update project status document

---

## 🎯 Completion Criteria

Phase B is **COMPLETE** when:

✅ All checkboxes above are checked  
✅ New subscribers automatically sync to Brevo  
✅ Admin can see sync status for all subscribers  
✅ Manual sync button works  
✅ Retry button works for failed syncs  
✅ Nightly cron job runs successfully  
✅ Subscribers visible in Brevo dashboard  
✅ No errors in console/logs  

---

## 🐛 Troubleshooting

### "ESP not configured" error
- Check `.env.local` has `BREVO_API_KEY` and `BREVO_LIST_ID`
- Restart dev server after adding env vars
- Check Vercel has env vars set

### "Contact already exists" error
- This is handled automatically (updates existing contact)
- Check logs to confirm

### Sync status stuck on "pending"
- Run manual sync button
- Check cron job is running
- Check API key is valid

### Subscribers not appearing in Brevo
- Check API key has correct permissions
- Check List ID is correct
- Check Brevo dashboard → Contacts → List

---

## 📚 Related Files

- `docs/PHASE_B_ESP_INTEGRATION_GUIDE.md` - Detailed technical guide
- `docs/PHASE_B_SIMPLE_EXPLANATION.md` - Simple explanation
- `src/lib/services/espService.ts` - ESP service implementation
- `src/lib/models/NewsletterSubscriber.ts` - Database model
- `src/app/api/admin/newsletter/sync/route.ts` - Sync endpoint

---

## 🚀 Next Phase

After Phase B is complete:
- **Phase C**: Automations (Welcome emails, post-purchase follow-ups)
- **Phase D**: Referral & Loyalty system
- **Phase E**: Compliance & Documentation





