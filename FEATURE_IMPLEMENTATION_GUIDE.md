# Feature Implementation Guide

This document explains the logic and implementation steps for three upcoming features.

---

## 1. Related Products / Recommendations

### **Logic Overview**

Show customers books they might be interested in based on:
- **Same category** (e.g., if viewing a Fiqh book, show other Fiqh books)
- **Same author** (e.g., if viewing Ibn Kathir's book, show other Ibn Kathir books)
- **Customers also bought** (based on order history - books frequently bought together)
- **Recently viewed** (track user's browsing history)
- **Featured recommendations** (admin-selected books on homepage)

### **Implementation Steps**

#### **Step 1: Create Recommendation Service**
**File:** `src/lib/services/recommendationService.ts`

```typescript
// Logic:
// 1. Get books by same category (exclude current book)
// 2. Get books by same author (exclude current book)
// 3. Get books frequently bought together (from order history)
// 4. Combine and deduplicate
// 5. Return top 6-8 recommendations
```

**Functions needed:**
- `getRelatedBooks(bookId, category, author, limit = 6)` - Main function
- `getBooksByCategory(category, excludeId)` - Same category
- `getBooksByAuthor(author, excludeId)` - Same author
- `getFrequentlyBoughtTogether(bookId, limit)` - Based on order items

#### **Step 2: Track Recently Viewed Books**
**File:** `src/lib/stores/viewedBooksStore.ts` (Zustand store)

```typescript
// Store in localStorage:
// - Track last 10-20 viewed books
// - Update on book page visit
// - Use for "Recently Viewed" section
```

#### **Step 3: Create Recommendation Component**
**File:** `src/components/books/RelatedBooks.tsx`

```typescript
// Display:
// - Grid of book cards (reuse BookCard component)
// - Section title: "كتب مشابهة" or "قد يعجبك أيضاً"
// - Responsive layout (2-3 columns on mobile, 4-5 on desktop)
```

#### **Step 4: Add to Book Details Page**
**File:** `src/app/(public)/books/[id]/page.tsx`

```typescript
// Add after reviews section:
<RelatedBooks 
  bookId={book.id}
  category={book.category}
  author={book.author}
/>
```

#### **Step 5: Add "Recently Viewed" to Homepage**
**File:** `src/app/(public)/page.tsx`

```typescript
// Show if user has viewed books:
<RecentlyViewedBooks />
```

#### **Step 6: API Endpoint (Optional)**
**File:** `src/app/api/books/[id]/related/route.ts`

```typescript
// GET endpoint for fetching related books
// Useful for client-side loading
```

### **Database Queries Logic**

```typescript
// 1. Same Category:
BookModel.find({ 
  category: book.category, 
  _id: { $ne: bookId },
  status: "published",
  stock: { $gt: 0 } // Only in-stock books
}).limit(4)

// 2. Same Author:
BookModel.find({ 
  author: book.author, 
  _id: { $ne: bookId },
  status: "published"
}).limit(4)

// 3. Frequently Bought Together:
// Aggregate orders to find books bought with current book
OrderModel.aggregate([
  { $unwind: "$items" },
  { $match: { "items.book": bookId } },
  { $unwind: "$items" },
  { $group: { _id: "$items.book", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 6 }
])
```

### **Priority Order**
1. Same category recommendations (easiest, most relevant)
2. Same author recommendations
3. Recently viewed (client-side, no DB needed)
4. Frequently bought together (requires order analysis)

---

## 2. Low Stock Alerts

### **Logic Overview**

Alert admins when book stock falls below a threshold:
- **Admin Dashboard:** Show warning badge/indicator
- **Email Alerts:** Send email to admin when stock < threshold
- **Product Pages:** Show "Only X left" badge for low stock
- **Auto-hide:** Optionally hide out-of-stock items from public view

### **Implementation Steps**

#### **Step 1: Add Stock Threshold to Book Model**
**File:** `src/lib/models/Book.ts`

```typescript
// Add field:
lowStockThreshold: { 
  type: Number, 
  default: 10, // Global threshold (alert when stock <= 10)
  min: 0 
}
```

#### **Step 2: Create Stock Alert Service**
**File:** `src/lib/services/stockAlertService.ts`

```typescript
// Functions:
// 1. checkLowStock() - Find all books with stock < threshold
// 2. sendLowStockEmail(books) - Email admin with list
// 3. isLowStock(book) - Check if single book is low stock
// 4. getStockStatus(book) - Return "in-stock" | "low-stock" | "out-of-stock"
```

#### **Step 3: Admin Dashboard Widget**
**File:** `src/components/admin/AdminDashboardClient.tsx`

```typescript
// Add section:
<div className="low-stock-alert">
  <h3>تنبيهات المخزون</h3>
  {lowStockBooks.map(book => (
    <div key={book._id}>
      {book.title} - متبقي {book.stock} فقط
      <Link href={`/admin/books?edit=${book._id}`}>
        تحديث المخزون
      </Link>
    </div>
  ))}
</div>
```

#### **Step 4: Email Alert System**
**File:** `src/lib/services/emailService.ts`

```typescript
// Add function:
export async function sendLowStockAlertEmail(books: Book[]) {
  // Email template with:
  // - List of low stock books
  // - Current stock levels
  // - Direct links to update stock
}
```

#### **Step 5: Trigger Alerts**
**File:** `src/app/api/orders/route.ts` (in createOrder)

```typescript
// After order creation, check stock:
const updatedBooks = await updateBookStock(order.items);
for (const book of updatedBooks) {
  if (book.stock <= 10) {
    await sendLowStockAlertEmail([book]);
  }
}
```

#### **Step 6: Stock Badge on Product Pages**
**File:** `src/components/cards/BookCard.tsx`

```typescript
// Add badge:
{stock > 0 && stock <= 10 && (
  <span className="low-stock-badge">
    متبقي {stock} فقط
  </span>
)}
```

#### **Step 7: Scheduled Check (Optional)**
**File:** `src/app/api/cron/check-stock/route.ts`

```typescript
// Cron job (daily or weekly):
// - Check all books
// - Send summary email to admin
// - Can use Vercel Cron or external service
```

### **Alert Logic**

```typescript
// Low Stock Detection:
function isLowStock(book: Book): boolean {
  const threshold = 10;
  return book.stock > 0 && book.stock <= threshold;
}

// Out of Stock:
function isOutOfStock(book: Book): boolean {
  return book.stock === 0;
}

// Stock Status:
function getStockStatus(book: Book): string {
  if (book.stock === 0) return "out-of-stock";
  if (isLowStock(book)) return "low-stock";
  return "in-stock";
}
```

### **Email Template Structure**

```html
<h2>تنبيه: مخزون منخفض</h2>
<p>الكتب التالية تحتاج إلى إعادة تخزين:</p>
<ul>
  <li>اسم الكتاب - متبقي: 5 نسخ</li>
  <li>اسم الكتاب - متبقي: 3 نسخ</li>
</ul>
<a href="/admin/books">تحديث المخزون</a>
```

---

## 3. Newsletter / Email Marketing

### **Logic Overview**

Build customer base and drive repeat sales through email:
- **Newsletter Signup:** Form on homepage/footer
- **Admin Management:** Send newsletters to subscribers
- **Automated Emails:**
  - Welcome email for new customers
  - New book announcements
  - Promotional emails (discount codes, sales)
  - Order confirmations (already exists)

### **Implementation Steps**

#### **Step 1: Create Newsletter Subscriber Model**
**File:** `src/lib/models/NewsletterSubscriber.ts`

```typescript
const NewsletterSubscriberSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { type: String, trim: true }, // Optional
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  unsubscribeToken: { type: String, unique: true },
  preferences: {
    newBooks: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    newsletters: { type: Boolean, default: true }
  }
});
```

#### **Step 2: Newsletter Signup Component**
**File:** `src/components/newsletter/NewsletterSignup.tsx`

```typescript
// Features:
// - Email input field
// - Optional name field
// - Subscribe button
// - Success/error messages
// - Unsubscribe link in emails
```

#### **Step 3: API Endpoints**
**File:** `src/app/api/newsletter/subscribe/route.ts`

```typescript
// POST /api/newsletter/subscribe
// - Validate email
// - Check if already subscribed
// - Create subscriber record
// - Send welcome email
// - Return success/error
```

**File:** `src/app/api/newsletter/unsubscribe/route.ts`

```typescript
// GET /api/newsletter/unsubscribe?token=xxx
// - Verify token
// - Mark as unsubscribed
// - Show confirmation page
```

#### **Step 4: Admin Newsletter Management**
**File:** `src/app/admin/newsletter/page.tsx`

```typescript
// Features:
// - List all subscribers
// - Send newsletter form
// - Email template editor
// - Send test email
// - View send history
```

**File:** `src/components/admin/newsletter/NewsletterManager.tsx`

```typescript
// Components:
// - Subscriber list table
// - Newsletter composer
// - Email template selector
// - Send button with confirmation
```

#### **Step 5: Email Templates**
**File:** `src/lib/templates/newsletterTemplates.ts`

```typescript
// Templates:
// 1. Welcome Email
// 2. New Book Announcement
// 3. Promotional Email (with discount codes)
// 4. Newsletter (monthly/weekly updates)
```

#### **Step 6: Automated Email Triggers**

**A. Welcome Email**
**File:** `src/app/api/auth/signup/route.ts`

```typescript
// After user signup:
if (user.role === "customer") {
  await sendWelcomeEmail(user.email, user.name);
  // Optionally subscribe to newsletter
}
```

**B. New Book Announcement**
**File:** `src/app/api/admin/books/route.ts` (in POST handler)

```typescript
// After creating new book:
if (book.status === "published" && book.isFeatured) {
  await sendNewBookAnnouncement(book);
}
```

**C. Promotional Emails**
**File:** `src/app/api/admin/discount-codes/route.ts` (in POST handler)

```typescript
// After creating discount code:
if (discountCode.isActive) {
  await sendPromotionalEmail(discountCode);
}
```

#### **Step 7: Newsletter Sending Service**
**File:** `src/lib/services/newsletterService.ts`

```typescript
// Functions:
// 1. subscribe(email, name?) - Add subscriber
// 2. unsubscribe(token) - Remove subscriber
// 3. sendNewsletter(subject, content, filters?) - Send to all/subset
// 4. sendToSegment(emails, subject, content) - Send to specific list
// 5. getSubscriberCount() - Total active subscribers
```

#### **Step 8: Add Signup Form to Homepage/Footer**
**File:** `src/components/layout/MainFooter.tsx`

```typescript
// Add newsletter signup section:
<NewsletterSignup />
```

### **Email Sending Logic**

```typescript
// Batch sending (to avoid rate limits):
async function sendNewsletter(
  subject: string,
  htmlContent: string,
  filters?: { preferences?: string[] }
) {
  const subscribers = await NewsletterSubscriberModel.find({
    isActive: true,
    ...(filters?.preferences && {
      [`preferences.${filters.preferences[0]}`]: true
    })
  });

  // Send in batches of 10-20 to avoid overwhelming SMTP
  const batchSize = 10;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    await Promise.all(
      batch.map(sub => 
        sendEmail({
          to: sub.email,
          subject,
          html: htmlContent + `<p><a href="${unsubscribeLink}">إلغاء الاشتراك</a></p>`
        })
      )
    );
    // Wait 1 second between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### **Unsubscribe Flow**

```typescript
// 1. Generate unique token on subscribe
const token = crypto.randomBytes(32).toString('hex');
subscriber.unsubscribeToken = token;

// 2. Include in all emails
const unsubscribeLink = `${baseUrl}/newsletter/unsubscribe?token=${token}`;

// 3. Unsubscribe endpoint verifies token and deactivates
```

### **Email Template Examples**

**Welcome Email:**
```html
<h1>مرحباً بك في مكتبة كتب الإسلامية!</h1>
<p>شكراً لاشتراكك في نشرتنا الإخبارية.</p>
<p>ستتلقى آخر الأخبار عن الكتب الجديدة والعروض الخاصة.</p>
```

**New Book Announcement:**
```html
<h2>كتاب جديد: {book.title}</h2>
<img src="{book.imageUrl}" />
<p>{book.description}</p>
<a href="/books/{book.slug}">اطلب الآن</a>
```

**Promotional Email:**
```html
<h2>عرض خاص!</h2>
<p>استخدم الرمز <strong>{discountCode}</strong> للحصول على خصم {value}%</p>
<p>صالح حتى {endDate}</p>
<a href="/books">تسوق الآن</a>
```

---

## Implementation Priority

### **Phase 1 (Quick Wins)**
1. ✅ **Related Books by Category** - Easiest, immediate value
2. ✅ **Low Stock Badge on Products** - Visual indicator
3. ✅ **Newsletter Signup Form** - Start building subscriber list

### **Phase 2 (Core Features)**
1. ✅ **Low Stock Admin Dashboard** - Alert system
2. ✅ **Recently Viewed Books** - Client-side tracking
3. ✅ **Welcome Email** - Automated on signup

### **Phase 3 (Advanced)**
1. ✅ **Frequently Bought Together** - Requires order analysis
2. ✅ **Newsletter Admin Panel** - Full management system
3. ✅ **Scheduled Stock Checks** - Cron jobs
4. ✅ **Email Segmentation** - Targeted campaigns

---

## Testing Checklist

### **Related Products**
- [ ] Same category books appear on book details page
- [ ] Same author books appear
- [ ] Recently viewed section shows on homepage
- [ ] No duplicate books in recommendations
- [ ] Responsive layout works on mobile

### **Low Stock Alerts**
- [ ] Admin dashboard shows low stock warning
- [ ] Email sent when stock < threshold
- [ ] "Only X left" badge appears on product cards
- [ ] Out-of-stock items hidden (if enabled)

### **Newsletter**
- [ ] Signup form works on homepage/footer
- [ ] Welcome email sent on subscription
- [ ] Admin can send newsletter
- [ ] Unsubscribe link works
- [ ] New book announcements sent
- [ ] Promotional emails sent with discount codes

---

## Notes

- **Email Rate Limits:** Be careful with SMTP rate limits. Batch sending recommended.
- **Privacy:** Always include unsubscribe link in marketing emails (legal requirement).
- **Performance:** Cache recommendation queries (60s TTL) to reduce DB load.
- **Scalability:** For large subscriber lists, consider email service (SendGrid, Mailchimp) instead of direct SMTP.

