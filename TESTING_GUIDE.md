# Testing Guide - Phase 1 & Phase 2 Features

This guide will help you test all the newly implemented features.

---

## 🧪 Testing Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Make sure you have:**
   - At least 5-10 books in the database (with different categories and authors)
   - Some books with stock ≤ 10 (for low stock features)
   - SMTP configured (for email features) or check console logs in development

---

## 📚 Phase 1: Quick Wins

### 1. Related Books by Category

**Test Steps:**
1. Go to any book details page: `http://localhost:3002/books/[book-slug]`
2. Scroll down past the reviews section
3. You should see a section titled **"قد يعجبك أيضاً"** (You May Also Like)
4. Verify:
   - ✅ Shows books from the same category
   - ✅ Shows books from the same author (if available)
   - ✅ Does NOT show the current book
   - ✅ Only shows in-stock books
   - ✅ Responsive grid layout (2 columns mobile, 4 desktop)
   - ✅ Clicking a book navigates to its details page

**Expected Result:**
- Grid of 4-6 related books below the reviews
- Books should be relevant (same category/author)

**Troubleshooting:**
- If no books appear: Check if there are other books in the same category
- If only 1-2 books: That's normal if there aren't many books in that category

---

### 2. Low Stock Badge on Products

**Test Steps:**
1. Go to books listing page: `http://localhost:3002/books`
2. Look for books with stock ≤ 10
3. Check book cards

**Verify:**
- ✅ Orange badge appears on book image: **"متبقي X فقط"** (Only X left)
- ✅ Badge shows correct stock number
- ✅ Badge only appears when `stock > 0 && stock <= 10`
- ✅ Badge appears on:
  - Homepage featured books
  - Books listing page
  - Related books section
  - Recently viewed section

**Test Data Setup:**
- In admin panel, edit a book and set stock to 5 or less
- Save and check the book card

**Expected Result:**
- Orange badge at bottom-right of book image
- Badge text: "متبقي 5 فقط" (if stock is 5)

---

### 3. Newsletter Signup

**Test Steps:**

**A. Footer Signup:**
1. Scroll to footer on any page
2. Find **"النشرة الإخبارية"** section
3. Enter an email address
4. Click **"اشتراك"** (Subscribe)

**B. Homepage Signup:**
1. Go to homepage
2. Scroll to newsletter section
3. Enter email (and optionally name)
4. Click **"اشترك الآن"**

**Verify:**
- ✅ Success toast: "تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني"
- ✅ Email field clears after successful signup
- ✅ Welcome email sent (check inbox or console logs)
- ✅ Duplicate subscription shows error: "أنت مشترك بالفعل"
- ✅ Invalid email shows error

**Check Database:**
- Go to MongoDB and check `newslettersubscribers` collection
- Should see new subscriber with:
  - `email`: The email you entered
  - `isActive`: `true`
  - `unsubscribeToken`: Generated token
  - `subscribedAt`: Current timestamp

**Test Unsubscribe:**
1. Check welcome email for unsubscribe link
2. Click the link (should go to `/newsletter/unsubscribe?token=...`)
3. Verify subscriber is marked as `isActive: false`

---

## 🔍 Phase 2: Core Features

### 4. Recently Viewed Books

**Test Steps:**
1. **Clear browser localStorage first** (to start fresh):
   - Open DevTools (F12)
   - Go to Application/Storage → Local Storage
   - Delete `koutob-viewed-books`

2. **View some books:**
   - Go to book details page 1: `/books/[book-1]`
   - Go to book details page 2: `/books/[book-2]`
   - Go to book details page 3: `/books/[book-3]`
   - View at least 3-4 different books

3. **Go to homepage:**
   - Scroll down past featured books section
   - Look for **"شاهدتها مؤخراً"** (Recently Viewed) section

**Verify:**
- ✅ Section appears only if you've viewed books
- ✅ Shows up to 8 recently viewed books
- ✅ Books are in reverse chronological order (most recent first)
- ✅ Clicking a book navigates to its details page
- ✅ Responsive grid layout
- ✅ Section doesn't appear if no books viewed

**Test Persistence:**
1. View some books
2. Refresh the page
3. Recently viewed should still appear
4. Close and reopen browser
5. Recently viewed should still be there (localStorage persistence)

**Check localStorage:**
- Open DevTools → Application → Local Storage
- Look for `koutob-viewed-books`
- Should see array of viewed books with timestamps

---

### 5. Low Stock Admin Dashboard

**Test Steps:**

**A. Setup Test Data:**
1. Go to admin panel: `http://localhost:3002/admin/books`
2. Edit a book and set stock to 5 (or any number ≤ 10)
3. Save the book
4. Repeat for 2-3 more books

**B. Check Dashboard:**
1. Go to admin dashboard: `http://localhost:3002/admin`
2. Look for **"تنبيهات المخزون"** (Stock Alerts) section
3. Should appear at the top if there are low stock books

**Verify:**
- ✅ Orange alert box appears when `lowStockBooks > 0`
- ✅ Shows count badge: number of low stock books
- ✅ Lists books with:
  - Book title
  - Stock count: "متبقي X من Y"
  - "تحديث" (Update) button
- ✅ "تحديث" button links to edit page
- ✅ Shows up to 10 books
- ✅ "عرض جميع الكتب" link if more than 10

**Test API Endpoint:**
1. Go to: `http://localhost:3002/api/admin/books/low-stock`
2. Should return JSON with array of low stock books
3. Requires admin authentication

**Check Service:**
- Books with `stock > 0 && stock <= 10` should appear
- Default threshold is 10 (can be customized per book)

---

### 6. Welcome Email

**Test Steps:**

**A. Create New Account:**
1. Go to signup page: `http://localhost:3002/signup`
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com (use a real email you can check)
   - Password: password123
   - Phone (optional)
3. Click **"إنشاء حساب"** (Create Account)

**B. Verify Email:**
1. Check your email inbox (or spam folder)
2. You should receive a verification email
3. Click the verification link
4. Account should be created

**C. Check Welcome Email:**
1. After clicking verification link, check your email again
2. You should receive a **Welcome Email** with:
   - Subject: "مرحباً بك في مكتبة كتب الإسلامية!"
   - Welcome message
   - List of features
   - Link to browse books

**Verify:**
- ✅ Welcome email sent automatically after email verification
- ✅ Email is RTL (right-to-left) formatted
- ✅ Contains user's name
- ✅ Includes link to browse books
- ✅ Professional HTML template

**Check Console Logs:**
- In development, check console for:
  - `[Email Verification] Welcome email sent`

**Note:**
- If SMTP is not configured, email won't send but won't cause errors
- Check console logs to see if email would have been sent

---

## 🧹 Cleanup & Reset Tests

### Reset Recently Viewed Books:
```javascript
// In browser console:
localStorage.removeItem('koutob-viewed-books');
```

### Reset Newsletter Subscription:
- Go to MongoDB
- Delete from `newslettersubscribers` collection
- Or use unsubscribe link from email

### Reset Low Stock:
- Go to admin panel
- Edit books and increase stock above threshold (e.g., set to 20)

---

## ✅ Complete Testing Checklist

### Phase 1:
- [ ] Related books appear on book details page
- [ ] Low stock badge shows on book cards (stock ≤ 10)
- [ ] Newsletter signup works in footer
- [ ] Newsletter signup works on homepage
- [ ] Welcome email received after newsletter signup
- [ ] Unsubscribe link works

### Phase 2:
- [ ] Recently viewed books appear on homepage
- [ ] Recently viewed persists after page refresh
- [ ] Low stock alert appears on admin dashboard
- [ ] Low stock alert shows correct books
- [ ] Welcome email sent after account creation
- [ ] Welcome email has correct content

---

## 🐛 Common Issues & Solutions

### Issue: Related books not showing
**Solution:** 
- Make sure there are other books in the same category
- Check if books are published (status: "published")
- Check if books have stock > 0

### Issue: Low stock badge not appearing
**Solution:**
- Verify book stock is between 1-10
- Check browser cache (hard refresh: Ctrl+F5)
- Verify book is published

### Issue: Recently viewed not showing
**Solution:**
- Make sure you've viewed at least one book
- Check localStorage is enabled
- Clear cache and try again

### Issue: Emails not sending
**Solution:**
- Check SMTP configuration in `.env.local`
- Check console logs for errors
- In development, emails may not send but should log

### Issue: Low stock alert not appearing
**Solution:**
- Make sure you're logged in as admin
- Verify books have stock ≤ threshold
- Check API endpoint: `/api/admin/books/low-stock`

---

## 📊 Performance Testing

### Test Related Books Loading:
1. Open Network tab in DevTools
2. Go to book details page
3. Check API call to `/api/books/[slug]/related`
4. Should be cached (60s TTL)
5. Response time should be < 500ms

### Test Recently Viewed:
1. View 20+ books quickly
2. Check localStorage size
3. Should only keep last 20 books
4. No performance degradation

---

## 🎯 Next Steps After Testing

Once all tests pass:
1. ✅ Document any issues found
2. ✅ Test on mobile devices
3. ✅ Test with different browsers
4. ✅ Verify email templates look good
5. ✅ Check responsive layouts

---

## 📝 Notes

- **Development Mode:** Some features may log to console instead of sending emails
- **Caching:** Related books API is cached for 60 seconds
- **LocalStorage:** Recently viewed uses browser localStorage (clears if user clears browser data)
- **Email Service:** Requires SMTP configuration for production

---

**Happy Testing! 🚀**



