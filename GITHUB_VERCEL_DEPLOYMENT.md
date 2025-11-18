# 🚀 GitHub & Vercel Deployment Guide (English)

Complete step-by-step guide to deploy your project to GitHub and Vercel.

---

## 📋 Prerequisites

✅ You should have:
- All credentials in `.env.local` file (MongoDB, Cloudinary, SMTP)
- A GitHub account
- A Vercel account (we'll create it)

---

## 📦 Step 1: Prepare Your Code for GitHub

### 1.1 Check Your Current Directory

Open Terminal/PowerShell in your project root:

```bash
# Navigate to your project
cd C:\Users\ASUS\Desktop\Library_projects\bookshop

# Verify you're in the right place
ls
# You should see: src/, public/, package.json, etc.
```

### 1.2 Check Git Status

```bash
# Check if Git is initialized
git status
```

**If you see "not a git repository":**
```bash
# Initialize Git
git init
```

**If you see files listed:**
```bash
# Check what files are staged/unstaged
git status
```

### 1.3 Verify .gitignore

Make sure `.env.local` is in `.gitignore` (it should be already):

```bash
# Check .gitignore
cat .gitignore
# or on Windows:
type .gitignore
```

You should see `.env*` in the file. **This is important** - we don't want to upload secrets to GitHub!

### 1.4 Stage All Files

```bash
# Add all files (except those in .gitignore)
git add .

# Verify what will be committed
git status
```

You should **NOT** see `.env.local` in the list. If you do, check your `.gitignore` file.

### 1.5 Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit - Ready for deployment"
```

---

## 🐙 Step 2: Create GitHub Repository

### 2.1 Create New Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**

### 2.2 Repository Settings

Fill in the form:

- **Repository name**: `koutob-bookshop` (or any name you prefer)
- **Description**: (Optional) "Islamic Bookshop - Next.js E-commerce"
- **Visibility**: 
  - Choose **Private** (recommended for production)
  - Or **Public** (if you want it open source)
- **⚠️ DO NOT CHECK:**
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

4. Click **Create repository**

### 2.3 Copy Repository URL

After creating, GitHub will show you a page with setup instructions. **Copy the repository URL**:

```
https://github.com/YOUR_USERNAME/koutob-bookshop.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 📤 Step 3: Push Code to GitHub

### 3.1 Add Remote Repository

In your terminal (still in the `bookshop` directory):

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/koutob-bookshop.git

# Replace YOUR_USERNAME with your actual GitHub username
# Example: git remote add origin https://github.com/john-doe/koutob-bookshop.git
```

**If you get "remote origin already exists" error:**
```bash
# Remove existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/YOUR_USERNAME/koutob-bookshop.git
```

### 3.2 Set Main Branch

```bash
# Rename branch to main (if needed)
git branch -M main

# Verify current branch
git branch
```

### 3.3 Push to GitHub

```bash
# Push code to GitHub
git push -u origin main
```

**First time pushing?** GitHub will ask for authentication:
- **Option 1**: Use GitHub Desktop (easier)
- **Option 2**: Use Personal Access Token (PAT)
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope
  - Use token as password when prompted

**After successful push**, refresh your GitHub repository page. You should see all your files!

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** (top right)
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account
5. Complete the signup process

### 4.2 Import Project from GitHub

1. In Vercel Dashboard, click **Add New Project**
2. You'll see a list of your GitHub repositories
3. Find and click **Import** next to `koutob-bookshop` (or your repo name)

### 4.3 Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

**⚠️ DO NOT CLICK DEPLOY YET!** We need to add environment variables first.

---

## 🔐 Step 5: Add Environment Variables to Vercel

### 5.1 Open Environment Variables Section

Before clicking **Deploy**, click **Environment Variables** (on the right side or below project settings).

### 5.2 Copy Values from .env.local

Open your `.env.local` file and copy each value. Add them one by one in Vercel:

#### 5.2.1 Database Variables

From your `.env.local`, find and add:

```
Key: MONGODB_URI
Value: (your MongoDB connection string from .env.local)
Environment: Production, Preview, Development (check all three)
```

```
Key: MONGODB_DB
Value: koutob (or your database name)
Environment: Production, Preview, Development (check all three)
```

#### 5.2.2 Authentication Variables

```
Key: NEXTAUTH_SECRET
Value: (copy from .env.local, or generate new one)
Environment: Production, Preview, Development (check all three)
```

**To generate new NEXTAUTH_SECRET:**
```bash
# In terminal
openssl rand -base64 32
```

```
Key: NEXTAUTH_URL
Value: (leave empty for now - we'll update after first deploy)
Environment: Production, Preview, Development (check all three)
```

#### 5.2.3 Cloudinary Variables

```
Key: CLOUDINARY_CLOUD_NAME
Value: (from .env.local)
Environment: Production, Preview, Development (check all three)
```

```
Key: CLOUDINARY_API_KEY
Value: (from .env.local)
Environment: Production, Preview, Development (check all three)
```

```
Key: CLOUDINARY_API_SECRET
Value: (from .env.local)
Environment: Production, Preview, Development (check all three)
```

```
Key: CLOUDINARY_UPLOAD_FOLDER
Value: bookshop/books (or from .env.local)
Environment: Production, Preview, Development (check all three)
```

#### 5.2.4 SMTP Email Variables

```
Key: SMTP_HOST
Value: (from .env.local, e.g., smtp.gmail.com)
Environment: Production, Preview, Development (check all three)
```

```
Key: SMTP_PORT
Value: (from .env.local, usually 587)
Environment: Production, Preview, Development (check all three)
```

```
Key: SMTP_SECURE
Value: (from .env.local, usually false)
Environment: Production, Preview, Development (check all three)
```

```
Key: SMTP_USER
Value: (from .env.local, your email)
Environment: Production, Preview, Development (check all three)
```

```
Key: SMTP_PASSWORD
Value: (from .env.local, your SMTP password)
Environment: Production, Preview, Development (check all three)
```

```
Key: SMTP_FROM_EMAIL
Value: (from .env.local, your email)
Environment: Production, Preview, Development (check all three)
```

#### 5.2.5 General Variables

```
Key: NEXT_PUBLIC_BASE_URL
Value: (leave empty for now - we'll update after first deploy)
Environment: Production, Preview, Development (check all three)
```

```
Key: BCRYPT_SALT_ROUNDS
Value: 10 (or from .env.local)
Environment: Production, Preview, Development (check all three)
```

### 5.3 Verify All Variables Added

Scroll through the list and make sure you've added all variables. You should have at least:
- ✅ MONGODB_URI
- ✅ MONGODB_DB
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL (empty for now)
- ✅ CLOUDINARY_CLOUD_NAME
- ✅ CLOUDINARY_API_KEY
- ✅ CLOUDINARY_API_SECRET
- ✅ CLOUDINARY_UPLOAD_FOLDER
- ✅ SMTP_HOST
- ✅ SMTP_PORT
- ✅ SMTP_SECURE
- ✅ SMTP_USER
- ✅ SMTP_PASSWORD
- ✅ SMTP_FROM_EMAIL
- ✅ NEXT_PUBLIC_BASE_URL (empty for now)
- ✅ BCRYPT_SALT_ROUNDS

---

## 🚀 Step 6: Deploy to Vercel

### 6.1 Start Deployment

1. After adding all environment variables, click **Deploy** button
2. Vercel will start building your project
3. Wait 2-3 minutes for the build to complete

### 6.2 Monitor Build Process

You'll see the build logs in real-time:
- ✅ Installing dependencies
- ✅ Building Next.js application
- ✅ Optimizing assets
- ✅ Deployment complete

**If build fails:**
- Check the error logs
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Build configuration issues

### 6.3 Get Your Deployment URL

After successful deployment, you'll see:
- ✅ **Deployment successful!**
- Your site URL: `https://koutob-bookshop.vercel.app` (or similar)

**📝 Copy this URL** - you'll need it in the next step!

---

## 🔄 Step 7: Update Environment Variables

### 7.1 Update NEXTAUTH_URL

1. Go to **Settings** → **Environment Variables**
2. Find `NEXTAUTH_URL`
3. Click **Edit**
4. Set value to your deployment URL:
   ```
   https://koutob-bookshop.vercel.app
   ```
5. Click **Save**

### 7.2 Update NEXT_PUBLIC_BASE_URL

1. Find `NEXT_PUBLIC_BASE_URL`
2. Click **Edit**
3. Set value to your deployment URL:
   ```
   https://koutob-bookshop.vercel.app
   ```
4. Click **Save**

### 7.3 Redeploy

After updating these variables, Vercel will automatically trigger a new deployment. Wait for it to complete (usually 1-2 minutes).

**Or manually redeploy:**
1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**

---

## ✅ Step 8: Verify Deployment

### 8.1 Test Your Website

Open your deployment URL in a browser:
```
https://koutob-bookshop.vercel.app
```

**Check these pages:**
- ✅ Homepage loads correctly
- ✅ Books page: `/books`
- ✅ Cart page: `/cart`
- ✅ Sign up page: `/signup`
- ✅ Login page: `/login`

### 8.2 Test Functionality

1. **Create a test account:**
   - Go to `/signup`
   - Register a new user
   - Check email for verification (if SMTP is working)

2. **Test admin access:**
   - Login to MongoDB Atlas
   - Find the user in `users` collection
   - Change `role` from `customer` to `admin`
   - Login again - you should see admin dashboard

3. **Test image upload:**
   - Login as admin
   - Go to `/admin/books`
   - Try adding a book with image
   - Verify image uploads to Cloudinary

4. **Test order creation:**
   - Add books to cart
   - Complete checkout
   - Verify order appears in admin dashboard

---

## 🔄 Step 9: Automatic Deployments (Future Updates)

### 9.1 How It Works

**Every time you push to GitHub, Vercel automatically:**
1. Detects the new commit
2. Builds your project
3. Deploys the new version

### 9.2 Update Your Code

```bash
# Make changes to your code
# ... edit files ...

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

Vercel will automatically deploy the new version!

### 9.3 View Deployments

- Go to Vercel Dashboard → Your Project → **Deployments**
- See all deployments with status (Ready, Building, Error)
- Click any deployment to see details

---

## 🛠️ Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Go to Settings → Environment Variables
- Verify all required variables are added
- Make sure they're enabled for the correct environment (Production/Preview/Development)

**Error: TypeScript errors**
- Fix errors locally first: `npm run build`
- Push fixed code to GitHub

**Error: MongoDB connection failed**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify database user credentials

### Images Not Uploading

**Error: Cloudinary upload fails**
- Verify Cloudinary credentials in Vercel
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Test Cloudinary credentials locally

### Emails Not Sending

**Error: SMTP authentication failed**
- Verify SMTP credentials
- For Gmail: Make sure you're using **App Password**, not regular password
- Check SMTP port (587 for most providers)
- Verify `SMTP_SECURE` is set correctly (false for port 587)

### Site Not Loading

**Error: 404 or blank page**
- Check deployment logs in Vercel
- Verify build completed successfully
- Check if `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` are set correctly

---

## 📊 Summary Checklist

Use this checklist to ensure everything is set up:

### GitHub Setup
- [ ] Git initialized in project
- [ ] `.env.local` is in `.gitignore`
- [ ] All files committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Files visible on GitHub

### Vercel Setup
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added:
  - [ ] MONGODB_URI
  - [ ] MONGODB_DB
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL (updated after first deploy)
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
  - [ ] CLOUDINARY_UPLOAD_FOLDER
  - [ ] SMTP_HOST
  - [ ] SMTP_PORT
  - [ ] SMTP_SECURE
  - [ ] SMTP_USER
  - [ ] SMTP_PASSWORD
  - [ ] SMTP_FROM_EMAIL
  - [ ] NEXT_PUBLIC_BASE_URL (updated after first deploy)
  - [ ] BCRYPT_SALT_ROUNDS
- [ ] First deployment successful
- [ ] NEXTAUTH_URL updated
- [ ] NEXT_PUBLIC_BASE_URL updated
- [ ] Site tested and working

---

## 🎉 Congratulations!

Your website is now live at:
```
https://your-project.vercel.app
```

You can share this link with your client for testing!

---

## 📝 Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Keep environment variables secure** - Don't share them publicly
3. **Automatic deployments** - Every GitHub push triggers a new deployment
4. **Monitor deployments** - Check Vercel dashboard regularly
5. **Backup your credentials** - Save all environment variables in a secure place

---

**Last Updated**: 2024
**Version**: 1.0

