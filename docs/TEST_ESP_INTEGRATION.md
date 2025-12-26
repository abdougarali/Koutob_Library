# 🧪 Test ESP Integration - Quick Guide

## ✅ Setup Complete!

You have:
- ✅ Brevo API Key configured
- ✅ Brevo List ID = `2` configured
- ✅ All code ready

---

## 🚀 Step 1: Restart Dev Server

**Important:** Environment variables are only loaded when the server starts!

```bash
# Stop current server (Ctrl+C if running)
# Then restart:
npm run dev
```

---

## 🧪 Step 2: Test Newsletter Subscription

### Test 1: Subscribe from Footer

1. Go to: `http://localhost:3002`
2. Scroll to footer
3. Enter a test email (e.g., `test@example.com`)
4. Click "اشترك" (Subscribe)
5. **Expected:** Success message appears

### Test 2: Check MongoDB

1. Go to: `http://localhost:3002/admin/newsletter`
2. Look for your test email
3. **Expected:** 
   - Email appears in the list
   - Status badge shows: **"✓ متزامن"** (synced) or **"⏳ قيد الانتظار"** (pending)

### Test 3: Check Brevo Dashboard

1. Go to: https://app.brevo.com
2. Navigate to: **Contacts → Lists → Your List (#2)**
3. **Expected:** Your test email appears in the list!

---

## 🔍 Step 3: Verify Sync Status

### In Admin Panel (`/admin/newsletter`):

**Good Signs:**
- ✅ Status: **"✓ متزامن"** (synced)
- ✅ Last Sync: Shows a date/time
- ✅ ESP Contact ID: Shows a number

**If Status is "⏳ قيد الانتظار" (pending):**
- This is normal for a few seconds
- Wait 5-10 seconds, then refresh
- Should change to "synced"

**If Status is "✗ خطأ" (error):**
- Click the **"إعادة المحاولة"** (Retry) button
- Check browser console for errors
- Verify API key is correct

---

## 🐛 Troubleshooting

### Problem: Status stays "pending"

**Solution:**
1. Check browser console (F12) for errors
2. Check server terminal for errors
3. Verify `BREVO_API_KEY` is correct in `.env.local`
4. Verify `BREVO_LIST_ID=2` is correct

### Problem: Status shows "error"

**Common Causes:**
- ❌ Invalid API key
- ❌ Wrong List ID
- ❌ Rate limit exceeded (too many requests)
- ❌ Network issue

**Solution:**
1. Double-check API key in Brevo dashboard
2. Verify List ID is `2`
3. Wait a few minutes (rate limit)
4. Click "Retry" button

### Problem: Email not in Brevo

**Solution:**
1. Check sync status in admin panel
2. If status is "error", click "Retry"
3. If status is "synced", wait 1-2 minutes (Brevo may take time to update)
4. Refresh Brevo dashboard

---

## ✅ Success Checklist

- [ ] Dev server restarted
- [ ] Test subscription from footer works
- [ ] Email appears in MongoDB (`/admin/newsletter`)
- [ ] Status shows "synced" (or "pending" then changes to "synced")
- [ ] Email appears in Brevo dashboard
- [ ] ESP Contact ID is populated

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Test from other sources:**
   - Subscribe from checkout page
   - Subscribe from signup page

2. **Test manual sync:**
   - Go to `/admin/newsletter`
   - Click "مزامنة الكل" (Sync All) button
   - Should sync all pending subscribers

3. **Deploy to Vercel:**
   - Add environment variables in Vercel dashboard
   - Test on production

---

## 📝 Notes

- **First sync may take 5-10 seconds** (API call to Brevo)
- **Brevo dashboard may take 1-2 minutes** to show new contacts
- **Rate limit:** Brevo free tier allows 300 emails/day
- **Status "pending" is normal** for a few seconds after subscription

---

**🎉 If all tests pass, Phase B is complete!**


