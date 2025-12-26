# 🔍 Advanced Search Testing Guide

This guide explains how to test the newly implemented advanced search features: **autocomplete**, **recent searches**, and **popular searches**.

---

## ✅ Features Implemented

1. **Autocomplete Search** - Real-time book suggestions while typing
2. **Recent Searches** - User's search history (logged-in users or anonymous via session)
3. **Popular Searches** - Trending searches based on aggregated data
4. **Search Logging** - Tracks all searches for analytics

---

## 🧪 Testing Steps

### **1. Test Autocomplete Search**

#### Steps:
1. Navigate to `/books` page
2. Click on the search bar
3. Start typing (minimum 2 characters required)
   - Example: Type "فقه" or "تفسير"
4. **Expected Result:**
   - After 300ms delay (debounce), a dropdown appears
   - Shows up to 8 matching books with:
     - Book cover thumbnail
     - Book title
     - Author name
   - Books are clickable

#### Test Cases:
- ✅ Type 1 character → No dropdown
- ✅ Type 2+ characters → Dropdown appears with results
- ✅ Type quickly (debounce) → Only searches after 300ms pause
- ✅ Click on a book → Navigates to book details page
- ✅ Click outside dropdown → Dropdown closes
- ✅ Press Enter → Performs full search

---

### **2. Test Recent Searches**

#### Steps:
1. Perform a few searches:
   - Search for "فقه"
   - Search for "تفسير"
   - Search for "حديث"
2. Clear the search bar (or click on it when empty)
3. **Expected Result:**
   - Dropdown shows "عمليات البحث الأخيرة" section
   - Lists your recent search queries (up to 5)
   - Each query is clickable

#### Test Cases:
- ✅ As logged-in user → Recent searches are saved per user
- ✅ As anonymous user → Recent searches saved via session ID (localStorage)
- ✅ Click on recent search → Performs that search
- ✅ Duplicate searches → Shows most recent version
- ✅ More than 5 searches → Shows only last 5 unique queries

---

### **3. Test Popular Searches**

#### Prerequisites:
- Need some search history in the database (from other users or previous tests)

#### Steps:
1. Navigate to `/books` page
2. Click on empty search bar
3. **Expected Result:**
   - Dropdown shows "الأكثر بحثاً" section
   - Lists popular search queries (up to 5)
   - Based on searches from last 30 days
   - Each query is clickable

#### Test Cases:
- ✅ Shows popular searches when input is empty
- ✅ Click on popular search → Performs that search
- ✅ Popular searches update based on actual search frequency

---

### **4. Test Search Logging**

#### Steps:
1. Open browser DevTools → Network tab
2. Perform a search (type and press Enter)
3. Check Network tab for POST request to `/api/search/log`
4. **Expected Result:**
   - Request is sent with:
     - `query`: The search term
     - `sessionId`: Session ID (for anonymous users)
     - `userId`: User ID (if logged in)
   - Response: `{ success: true }`

#### Test Cases:
- ✅ Logged-in user → Logs with `userId`
- ✅ Anonymous user → Logs with `sessionId`
- ✅ Clicking autocomplete book → Logs with `clickedBookId`
- ✅ Logging doesn't block search functionality (fails silently if error)

---

### **5. Test API Endpoints Directly**

#### **Autocomplete API**
```bash
GET /api/search/autocomplete?q=فقه&limit=8
```
**Expected Response:**
```json
{
  "success": true,
  "results": [
    {
      "slug": "book-slug",
      "title": "Book Title",
      "author": "Author Name",
      "imageUrl": "https://..."
    }
  ]
}
```

#### **Recent Searches API**
```bash
GET /api/search/recent?limit=10
Headers: x-session-id: <session-id> (for anonymous users)
```
**Expected Response:**
```json
{
  "success": true,
  "searches": ["فقه", "تفسير", "حديث"]
}
```

#### **Popular Searches API**
```bash
GET /api/search/popular?limit=10&days=30
```
**Expected Response:**
```json
{
  "success": true,
  "searches": ["فقه", "تفسير", "حديث"]
}
```

#### **Log Search API**
```bash
POST /api/search/log
Content-Type: application/json
Body: {
  "query": "فقه",
  "sessionId": "session_123",
  "clickedBookId": "book-slug" // optional
}
```
**Expected Response:**
```json
{
  "success": true
}
```

---

## 🔍 Database Verification

### Check SearchLog Collection

1. Connect to MongoDB Atlas
2. Navigate to `SearchLog` collection
3. After performing searches, verify:
   - Documents are created with:
     - `query`: Search term
     - `user`: User ID (if logged in) or `null`
     - `sessionId`: Session ID (for anonymous users)
     - `clickedBook`: Book ID (if clicked from autocomplete)
     - `createdAt`: Timestamp

### Verify Popular Searches Aggregation

Run this aggregation in MongoDB Compass or shell:
```javascript
db.searchlogs.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: { $toLower: "$query" },
      query: { $first: "$query" },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  },
  {
    $limit: 10
  }
])
```

---

## 🐛 Troubleshooting

### **Issue: Autocomplete not showing**
- ✅ Check browser console for errors
- ✅ Verify API endpoint is accessible: `/api/search/autocomplete?q=test`
- ✅ Ensure query is at least 2 characters
- ✅ Check network tab for failed requests

### **Issue: Recent searches not showing**
- ✅ Verify session ID is stored in localStorage: `localStorage.getItem("searchSessionId")`
- ✅ Check if user is logged in (recent searches work for both logged-in and anonymous)
- ✅ Ensure searches were performed first
- ✅ Check API response: `/api/search/recent`

### **Issue: Popular searches empty**
- ✅ Need search history in database (perform multiple searches first)
- ✅ Popular searches are based on last 30 days
- ✅ Check aggregation query in database

### **Issue: Search not logging**
- ✅ Check Network tab for POST to `/api/search/log`
- ✅ Verify request body contains `query`
- ✅ Check server logs for errors
- ✅ Logging failures don't block search (fails silently)

---

## 📊 Performance Notes

- **Debounce**: Autocomplete waits 300ms after typing stops
- **Limit**: Autocomplete shows max 8 results
- **Caching**: Recent/popular searches are fetched once on component mount
- **Session ID**: Stored in localStorage, persists across page reloads

---

## ✅ Success Criteria

All features are working correctly if:
1. ✅ Autocomplete dropdown appears while typing (2+ chars)
2. ✅ Recent searches show when input is empty/focused
3. ✅ Popular searches show when input is empty/focused
4. ✅ Clicking suggestions performs search or navigates to book
5. ✅ Searches are logged in database
6. ✅ API endpoints return correct data
7. ✅ Works for both logged-in and anonymous users

---

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add search analytics dashboard for admins
- [ ] Implement search result highlighting
- [ ] Add keyboard navigation (arrow keys) in dropdown
- [ ] Cache popular searches in Redis for better performance
- [ ] Add search suggestions based on user's previous purchases

---

**Happy Testing! 🚀**



















