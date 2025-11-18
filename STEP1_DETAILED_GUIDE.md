# 📦 Step 1: Prepare Your Code for GitHub - Detailed Guide

Complete step-by-step instructions with PowerShell commands for Windows.

---

## 🎯 What We're Doing

We're preparing your code to be uploaded to GitHub. This involves:
1. Checking your current location
2. Initializing Git (if needed)
3. Verifying `.env.local` is protected
4. Staging all files
5. Creating your first commit

---

## 📍 Step 1.1: Check Your Current Directory

### What to Do:

1. **Open PowerShell** (or Terminal)
   - Press `Windows Key + X`
   - Select **Windows PowerShell** or **Terminal**
   - Or search for "PowerShell" in Start Menu

2. **Navigate to your project folder**

   Type this command and press Enter:
   ```powershell
   cd C:\Users\ASUS\Desktop\Library_projects\bookshop
   ```

3. **Verify you're in the right place**

   Type this command:
   ```powershell
   Get-Location
   ```
   
   **Expected output:**
   ```
   Path
   ----
   C:\Users\ASUS\Desktop\Library_projects\bookshop
   ```

4. **List files to confirm**

   Type this command:
   ```powershell
   ls
   ```
   or
   ```powershell
   dir
   ```

   **You should see:**
   - `src/` folder
   - `public/` folder
   - `package.json` file
   - `.gitignore` file
   - Other project files

   **✅ If you see these files, you're in the right place!**

---

## 🔍 Step 1.2: Check Git Status

### What to Do:

1. **Check if Git is initialized**

   Type this command:
   ```powershell
   git status
   ```

### Scenario A: Git is NOT initialized

**You'll see this error:**
```
fatal: not a git repository (or any of the parent directories): .git
```

**Solution:**
```powershell
# Initialize Git repository
git init
```

**Expected output:**
```
Initialized empty Git repository in C:/Users/ASUS/Desktop/Library_projects/bookshop/.git
```

**Then check status again:**
```powershell
git status
```

### Scenario B: Git is already initialized

**You'll see something like:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/SomeFile.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        new-file.tsx

no changes added to commit (use "git add ." to stage all files)
```

**✅ This is normal!** It means Git is working and tracking your files.

---

## 🔒 Step 1.3: Verify .gitignore (IMPORTANT!)

### Why This Matters:

We need to make sure `.env.local` (which contains your secrets) is NOT uploaded to GitHub.

### What to Do:

1. **Check if .gitignore exists**

   Type this command:
   ```powershell
   Test-Path .gitignore
   ```

   **Expected output:**
   ```
   True
   ```

   If it says `False`, the file doesn't exist. But it should exist in your project.

2. **View .gitignore contents**

   Type this command:
   ```powershell
   Get-Content .gitignore
   ```
   or
   ```powershell
   type .gitignore
   ```

   **Look for this line:**
   ```
   .env*
   ```

   **✅ If you see `.env*`, your `.env.local` is protected!**

   This means:
   - `.env.local` will NOT be uploaded to GitHub
   - Your secrets are safe
   - You can proceed

3. **Double-check .env.local is ignored**

   Type this command:
   ```powershell
   git status
   ```

   **Look at the output carefully:**
   - ✅ **GOOD**: You should NOT see `.env.local` in the list
   - ❌ **BAD**: If you see `.env.local`, it's not being ignored

   **If .env.local appears in the list:**
   - Open `.gitignore` file
   - Make sure it contains `.env*` on a line by itself
   - Save the file
   - Run `git status` again

---

## 📦 Step 1.4: Stage All Files

### What "Staging" Means:

Staging means telling Git which files you want to include in your commit. We'll stage ALL files (except those in `.gitignore`).

### What to Do:

1. **Stage all files**

   Type this command:
   ```powershell
   git add .
   ```

   **Expected output:**
   - No error message = Success!
   - If you see errors, read them carefully

2. **Verify what will be committed**

   Type this command:
   ```powershell
   git status
   ```

   **Expected output:**
   ```
   On branch main

   Changes to be committed:
     (use "git restore --staged <file>..." to unstage)
           new file:   src/components/SomeComponent.tsx
           new file:   src/app/page.tsx
           modified:   package.json
           ... (many more files)
   ```

   **Important checks:**
   - ✅ You should see many files listed
   - ✅ You should see `src/`, `public/`, `package.json`, etc.
   - ❌ You should NOT see `.env.local` in the list
   - ❌ You should NOT see `node_modules/` in the list

3. **If .env.local appears (it shouldn't):**

   **STOP!** Don't commit yet. Fix this first:

   ```powershell
   # Remove .env.local from staging
   git restore --staged .env.local
   
   # Verify it's removed
   git status
   ```

   Then check your `.gitignore` file again.

---

## 💾 Step 1.5: Create Initial Commit

### What a "Commit" Means:

A commit is like saving a snapshot of your code. This is your first snapshot that will be uploaded to GitHub.

### What to Do:

1. **Create your first commit**

   Type this command:
   ```powershell
   git commit -m "Initial commit - Ready for deployment"
   ```

   **Expected output:**
   ```
   [main (root-commit) abc1234] Initial commit - Ready for deployment
    X files changed, Y insertions(+)
   ```

   The numbers (X files, Y insertions) will vary based on your project size.

2. **If you see this error:**

   ```
   *** Please tell me who you are.

   Run

     git config --global user.email "you@example.com"
     git config --global user.name "Your Name"

   to set your account's default identity.
   ```

   **Solution:** Configure Git with your name and email:

   ```powershell
   # Replace with YOUR email
   git config --global user.email "your-email@example.com"
   
   # Replace with YOUR name
   git config --global user.name "Your Name"
   ```

   **Then try the commit again:**
   ```powershell
   git commit -m "Initial commit - Ready for deployment"
   ```

3. **Verify the commit was created**

   Type this command:
   ```powershell
   git log
   ```

   **Expected output:**
   ```
   commit abc1234def5678... (HEAD -> main)
   Author: Your Name <your-email@example.com>
   Date:   [current date and time]

       Initial commit - Ready for deployment
   ```

   **✅ Success!** Your first commit is created.

4. **Check status one more time**

   Type this command:
   ```powershell
   git status
   ```

   **Expected output:**
   ```
   On branch main
   nothing to commit, working tree clean
   ```

   **✅ Perfect!** This means all files are committed and ready.

---

## ✅ Step 1 Complete Checklist

Before moving to Step 2, verify:

- [ ] You're in the correct directory (`C:\Users\ASUS\Desktop\Library_projects\bookshop`)
- [ ] Git is initialized (`git status` works)
- [ ] `.gitignore` contains `.env*`
- [ ] `.env.local` is NOT in `git status` output
- [ ] All files are staged (`git status` shows "Changes to be committed")
- [ ] First commit is created (`git log` shows your commit)
- [ ] Working tree is clean (`git status` shows "nothing to commit")

---

## 🎯 What's Next?

Once Step 1 is complete, you're ready for:
- **Step 2**: Create GitHub Repository
- **Step 3**: Push Code to GitHub

---

## 🛠️ Common Issues & Solutions

### Issue 1: "git is not recognized"

**Error:**
```
git : The term 'git' is not installed...
```

**Solution:**
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Install it (use default settings)
3. Restart PowerShell
4. Try again

### Issue 2: "Permission denied"

**Error:**
```
Permission denied (publickey).
```

**Solution:**
This usually happens when pushing. We'll handle authentication in Step 3.

### Issue 3: "Too many files" or slow staging

**If `git add .` is very slow:**
- This is normal for large projects
- Wait for it to complete
- Don't interrupt it

### Issue 4: Can't see .gitignore

**If `.gitignore` doesn't exist:**
- Create it manually
- Add this content:
  ```
  .env*
  node_modules/
  .next/
  ```

---

## 📝 Quick Reference Commands

Copy-paste these commands in order:

```powershell
# 1. Navigate to project
cd C:\Users\ASUS\Desktop\Library_projects\bookshop

# 2. Check location
Get-Location

# 3. Check Git status
git status

# 4. If Git not initialized (only if needed)
git init

# 5. Verify .gitignore
Get-Content .gitignore

# 6. Stage all files
git add .

# 7. Verify staging
git status

# 8. Create commit
git commit -m "Initial commit - Ready for deployment"

# 9. Verify commit
git log

# 10. Final status check
git status
```

---

**✅ Once all these steps complete successfully, you're ready for Step 2!**

---

**Last Updated**: 2024
**Version**: 1.0

