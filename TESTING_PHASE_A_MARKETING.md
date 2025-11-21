# Testing Guide - Phase A: Marketing Foundation

This guide will help you test all the newsletter marketing features we just implemented.

---

## Prerequisites

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Make sure MongoDB is connected** (check `.env.local`)

3. **Have admin access** (login at `/admin/login`)

---

## Test 1: Newsletter Subscription from Footer (Source: "footer")

### Steps:
1. Go to homepage: `http://localhost:3002`
2. Scroll down to the newsletter section (or check footer)
3. Enter an email address (e.g., `test1@example.com`)
4. Optionally enter a name
5. Click "اشترك الآن" (Subscribe Now)
6. Check for success toast message

### Expected Results:
- ✅ Success toast: "تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني"
- ✅ Email received (if SMTP configured)
- ✅ In MongoDB: Check `newslettersubscribers` collection
  - `source` should be `"footer"`
  - `isActive` should be `true`
  - `locale` should be `"ar"`

### Verify in MongoDB:
```javascript
db.newslettersubscribers.findOne({ email: "test1@example.com" })
// Should show: source: "footer", isActive: true
```

---

## Test 2: Newsletter Subscription from Signup Form (Source: "signup")

### Steps:
1. Go to signup page (find the signup link or go to `/admin/login` and look for signup)
2. Fill in the signup form:
   - Name: "Test User"
   - Email: `test2@example.com`
   - Password: `password123`
   - **Check the newsletter checkbox**: "أرغب في الاشتراك في النشرة الإخبارية..."
3. Submit the form
4. Check your email for verification link
5. Click the verification link to verify email

### Expected Results:
- ✅ User account created
- ✅ In MongoDB `newslettersubscribers` collection:
  - Email: `test2@example.com`
  - `source` should be `"signup"`
  - `isActive` should be `true`
  - `name` should be "Test User"

### Verify in MongoDB:
```javascript
db.newslettersubscribers.findOne({ email: "test2@example.com" })
// Should show: source: "signup", name: "Test User"
```

---

## Test 3: Newsletter Subscription from Checkout (Source: "checkout")

### Steps:
1. Add some books to cart
2. Go to cart page: `http://localhost:3002/cart`
3. Click "الانتقال إلى الدفع" (Proceed to Checkout)
4. Fill in checkout form:
   - Full Name: "Checkout Test"
   - Phone: `12345678`
   - Email: `test3@example.com` (optional but needed for newsletter)
   - City: "تونس"
   - Address: "Test Address"
5. **Check the newsletter checkbox** at the bottom
6. Submit the order

### Expected Results:
- ✅ Order created successfully
- ✅ In MongoDB `newslettersubscribers` collection:
  - Email: `test3@example.com`
  - `source` should be `"checkout"`
  - `isActive` should be `true`
  - `name` should be "Checkout Test"

### Verify in MongoDB:
```javascript
db.newslettersubscribers.findOne({ email: "test3@example.com" })
// Should show: source: "checkout", name: "Checkout Test"
```

---

## Test 4: Admin Newsletter Management Page

### Steps:
1. Login as admin: `http://localhost:3002/admin/login`
2. In the sidebar, click "النشرة الإخبارية" (Newsletter)
3. You should see the newsletter management page

### Expected Results:
- ✅ Page loads without errors
- ✅ Statistics cards visible:
  - Total active subscribers
  - Last 7 days count
  - Growth rate (if applicable)
  - Source breakdown (footer/signup/checkout)
- ✅ Filters visible (Source and Status dropdowns)
- ✅ Export CSV button visible
- ✅ Subscribers table visible with columns:
  - Email
  - Name
  - Source
  - Status (Active/Inactive)
  - Subscription Date

---

## Test 5: Statistics API

### Steps:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit `/admin/newsletter` page
4. Look for request to `/api/admin/newsletter/stats`

### Expected Results:
- ✅ API returns JSON with:
  ```json
  {
    "total": 3,
    "totalAllTime": 3,
    "last7Days": 3,
    "previous7Days": 0,
    "growthRate": 100,
    "bySource": {
      "footer": 1,
      "signup": 1,
      "checkout": 1
    }
  }
  ```

### Manual API Test:
```bash
# Get admin session cookie first, then:
curl http://localhost:3002/api/admin/newsletter/stats \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## Test 6: Filters Functionality

### Steps:
1. On `/admin/newsletter` page
2. Use "المصدر" (Source) filter:
   - Select "التذييل" (Footer)
   - Table should show only footer subscriptions
   - Select "التسجيل" (Signup)
   - Table should show only signup subscriptions
   - Select "الدفع" (Checkout)
   - Table should show only checkout subscriptions
3. Use "الحالة" (Status) filter:
   - Select "نشط" (Active)
   - Table should show only active subscribers
   - Select "غير نشط" (Inactive)
   - Table should show only inactive subscribers

### Expected Results:
- ✅ Filters work correctly
- ✅ Table updates dynamically
- ✅ URL parameters update (optional, if implemented)

---

## Test 7: CSV Export

### Steps:
1. On `/admin/newsletter` page
2. Click "تصدير CSV" (Export CSV) button
3. File should download

### Expected Results:
- ✅ CSV file downloads
- ✅ File name: `newsletter-subscribers-YYYY-MM-DD.csv`
- ✅ File contains columns:
  - البريد الإلكتروني (Email)
  - الاسم (Name)
  - المصدر (Source)
  - الحالة (Status)
  - تاريخ الاشتراك (Subscription Date)
  - الاهتمامات (Interests)
  - اللغة (Locale)
  - العلامات (Tags)
- ✅ Can open in Excel/Google Sheets
- ✅ Arabic text displays correctly (UTF-8 BOM included)

### Test with Filters:
1. Apply a filter (e.g., source = "footer")
2. Click Export CSV
3. ✅ Only filtered results exported

---

## Test 8: Subscribers List API

### Steps:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit `/admin/newsletter` page
4. Look for request to `/api/admin/newsletter/subscribers`

### Expected Results:
- ✅ API returns array of subscribers:
  ```json
  [
    {
      "_id": "...",
      "email": "test1@example.com",
      "name": "...",
      "source": "footer",
      "isActive": true,
      "subscribedAt": "2025-01-XX...",
      "interests": [],
      "locale": "ar",
      "tags": []
    },
    ...
  ]
  ```

---

## Test 9: Duplicate Email Handling

### Steps:
1. Try to subscribe with the same email twice from footer
2. First time: Should succeed
3. Second time: Should show error "أنت مشترك بالفعل في النشرة الإخبارية"

### Expected Results:
- ✅ Prevents duplicate subscriptions
- ✅ Shows appropriate error message
- ✅ If previously unsubscribed, reactivates subscription

---

## Test 10: Reactivation of Unsubscribed Users

### Steps:
1. In MongoDB, set a subscriber to inactive:
   ```javascript
   db.newslettersubscribers.updateOne(
     { email: "test1@example.com" },
     { $set: { isActive: false } }
   )
   ```
2. Try to subscribe again with same email from footer
3. Should reactivate the subscription

### Expected Results:
- ✅ Subscription reactivated
- ✅ `isActive` set to `true`
- ✅ `subscribedAt` updated to current date
- ✅ Success message: "تم إعادة تفعيل الاشتراك بنجاح"

---

## Test 11: Checkbox Behavior (Optional Opt-in)

### Steps:
1. **Signup Form:**
   - Checkbox should be **unchecked by default**
   - User can check it if they want
   - If unchecked, no newsletter subscription

2. **Checkout Form:**
   - Checkbox should be **unchecked by default**
   - User can check it if they want
   - If unchecked, no newsletter subscription

### Expected Results:
- ✅ Checkboxes unchecked by default (not pre-checked)
- ✅ User must explicitly opt-in
- ✅ If unchecked, no subscription created

---

## Test 12: Database Verification

### Steps:
1. Connect to MongoDB (MongoDB Compass or CLI)
2. Check `newslettersubscribers` collection

### Expected Results:
- ✅ Collection exists
- ✅ Documents have all new fields:
  - `source` (footer/signup/checkout)
  - `interests` (array)
  - `locale` (string, default "ar")
  - `tags` (array)
- ✅ Indexes created:
  - `email`
  - `isActive`
  - `unsubscribeToken`
  - `source`
  - `subscribedAt`
  - `createdAt`

### MongoDB Query Examples:
```javascript
// Count by source
db.newslettersubscribers.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: "$source", count: { $sum: 1 } } }
])

// Get all active subscribers
db.newslettersubscribers.find({ isActive: true })

// Get subscribers from last 7 days
db.newslettersubscribers.find({
  subscribedAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) },
  isActive: true
})
```

---

## Test 13: Error Handling

### Steps:
1. Try to subscribe with invalid email (e.g., "notanemail")
2. Try to access `/api/admin/newsletter/stats` without admin login
3. Try to export without admin login

### Expected Results:
- ✅ Invalid email shows validation error
- ✅ Unauthorized API access returns 401/403
- ✅ Error messages in Arabic

---

## Test 14: Responsive Design

### Steps:
1. Open `/admin/newsletter` page
2. Resize browser window (mobile, tablet, desktop)
3. Check filters, table, and buttons

### Expected Results:
- ✅ Page responsive on all screen sizes
- ✅ Table scrollable on mobile
- ✅ Filters stack properly on mobile
- ✅ Buttons accessible on all devices

---

## Quick Test Checklist

- [ ] Footer subscription works
- [ ] Signup form checkbox appears and works
- [ ] Checkout form checkbox appears and works
- [ ] Admin newsletter page loads
- [ ] Statistics display correctly
- [ ] Filters work
- [ ] CSV export works
- [ ] Subscribers table displays data
- [ ] Source tracking works (footer/signup/checkout)
- [ ] Duplicate prevention works
- [ ] Reactivation works
- [ ] Checkboxes unchecked by default
- [ ] MongoDB data structure correct

---

## Common Issues & Solutions

### Issue: "Cannot read property 'source' of undefined"
**Solution:** Make sure you've restarted the dev server after model changes

### Issue: Statistics show 0
**Solution:** Check if subscribers exist in MongoDB, verify `isActive: true`

### Issue: Export CSV shows garbled text
**Solution:** Open in Excel with UTF-8 encoding, or use Google Sheets

### Issue: Checkbox not appearing
**Solution:** Clear browser cache, restart dev server

### Issue: API returns 401 Unauthorized
**Solution:** Make sure you're logged in as admin, check session cookie

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Phase A is complete
2. Ready to proceed to **Phase B: ESP Integration**
3. Document any issues found during testing

---

## Notes

- All email addresses used in testing should be test emails
- You can use services like `mailinator.com` or `10minutemail.com` for testing emails
- MongoDB queries can be run in MongoDB Compass or via CLI
- Check browser console for any JavaScript errors
- Check server logs for API errors

