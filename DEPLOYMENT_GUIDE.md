# 🚀 دليل النشر الكامل - Complete Deployment Guide

## 📋 نظرة عامة | Overview

هذا الدليل يوضح كيفية نشر المشروع على Vercel مجاناً مع جميع الخدمات المطلوبة.

This guide shows how to deploy the project to Vercel for free with all required services.

---

## ✅ المتطلبات الأساسية | Prerequisites

### 1. حسابات مجانية مطلوبة | Required Free Accounts

- ✅ **GitHub Account** - لحفظ الكود | For code storage
- ✅ **Vercel Account** - لاستضافة الموقع | For website hosting

### 2. معلومات موجودة في .env.local | Information Already in .env.local

**✅ You already have these in your `.env.local` file:**
- ✅ **MongoDB Atlas** - Connection string and credentials
- ✅ **Cloudinary** - Cloud name, API key, and API secret
- ✅ **SMTP Email** - SMTP host, port, user, and password

**📝 You will copy these values from `.env.local` to Vercel Environment Variables.**

---

## 📝 الخطوة 1: إعداد MongoDB Atlas | Step 1: Setup MongoDB Atlas

### 1.1 إنشاء حساب
1. اذهب إلى [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. سجل حساب جديد (مجاني)
3. اختر **Free M0 Cluster**

### 1.2 إنشاء Cluster
1. اختر **Cloud Provider**: AWS (أو أي واحد)
2. اختر **Region**: الأقرب لك (مثلاً: `eu-central-1`)
3. اختر **Cluster Tier**: **M0 Sandbox** (مجاني)
4. اضغط **Create Cluster**

### 1.3 إعداد قاعدة البيانات
1. انتظر إنشاء الـ Cluster (3-5 دقائق)
2. اضغط **Connect** → **Connect your application**
3. اختر **Driver**: Node.js
4. انسخ **Connection String** (سيبدو هكذا):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 1.4 إنشاء Database User
1. اضغط **Database Access** (من القائمة الجانبية)
2. اضغط **Add New Database User**
3. اختر **Password** authentication
4. أدخل:
   - **Username**: `koutob_admin` (أو أي اسم)
   - **Password**: أنشئ كلمة مرور قوية (احفظها!)
5. **Database User Privileges**: `Atlas admin`
6. اضغط **Add User**

### 1.5 إعداد Network Access
1. اضغط **Network Access** (من القائمة الجانبية)
2. اضغط **Add IP Address**
3. اختر **Allow Access from Anywhere** (0.0.0.0/0)
4. اضغط **Confirm**

### 1.6 الحصول على Connection String النهائي
1. عد إلى **Connect** → **Connect your application**
2. انسخ الـ Connection String
3. استبدل `<username>` و `<password>` بالقيم الحقيقية
4. أضف اسم قاعدة البيانات في النهاية:
   ```
   mongodb+srv://koutob_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/koutob?retryWrites=true&w=majority
   ```
5. **احفظ هذا الرابط** - ستحتاجه لاحقاً

---

## 📸 الخطوة 2: إعداد Cloudinary | Step 2: Setup Cloudinary

### 2.1 إنشاء حساب
1. اذهب إلى [cloudinary.com](https://cloudinary.com)
2. اضغط **Sign Up for Free**
3. سجل حساب جديد

### 2.2 الحصول على Credentials
1. بعد تسجيل الدخول، ستجد **Dashboard**
2. انسخ القيم التالية:
   - **Cloud Name** (مثلاً: `dabc123`)
   - **API Key** (مثلاً: `123456789012345`)
   - **API Secret** (مثلاً: `abcdefghijklmnop`)
3. **احفظ هذه القيم** - ستحتاجها لاحقاً

---

## 📧 الخطوة 3: إعداد Email Service (SMTP) | Step 3: Setup Email Service (SMTP)

**✅ المشروع يستخدم SMTP مباشرة - يمكنك استخدام أي مزود SMTP!**

The project uses SMTP directly - you can use any SMTP provider!

### خيار 1: Gmail (الأسهل | Easiest)

1. اذهب إلى [myaccount.google.com](https://myaccount.google.com)
2. اضغط **Security** → **2-Step Verification** (فعّلها إذا لم تكن مفعلة)
3. اضغط **App Passwords** (كلمات مرور التطبيقات)
4. اختر **Mail** و **Other (Custom name)**
5. أدخل اسم: `Koutob Bookshop`
6. انسخ **App Password** (16 حرف)
7. **احفظه** - ستحتاجه لاحقاً

**إعدادات Gmail**:
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = (App Password من الخطوة 6)
SMTP_FROM_EMAIL = your-email@gmail.com
```

### خيار 2: Outlook/Hotmail

1. اذهب إلى [account.microsoft.com](https://account.microsoft.com)
2. اضغط **Security** → **Advanced security options**
3. فعّل **App passwords** (إذا لم تكن مفعلة)
4. أنشئ App Password جديد
5. انسخ **App Password**

**إعدادات Outlook**:
```
SMTP_HOST = smtp-mail.outlook.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@outlook.com
SMTP_PASSWORD = (App Password)
SMTP_FROM_EMAIL = your-email@outlook.com
```

### خيار 3: Brevo (SMTP مجاني | Free SMTP)

1. اذهب إلى [brevo.com](https://www.brevo.com)
2. سجل حساب جديد (مجاني: 300 إيميل/يوم)
3. بعد التسجيل:
   - اذهب إلى **SMTP & API** → **SMTP**
   - انسخ:
     - **SMTP Server**: `smtp-relay.brevo.com`
     - **Port**: `587`
     - **Login**: (بريدك الإلكتروني)
     - **Password**: (كلمة مرور SMTP - ليست كلمة مرور الحساب!)

**إعدادات Brevo**:
```
SMTP_HOST = smtp-relay.brevo.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@example.com
SMTP_PASSWORD = (SMTP Password من Brevo)
SMTP_FROM_EMAIL = your-email@example.com
```

### خيار 4: أي مزود SMTP آخر | Any Other SMTP Provider

يمكنك استخدام أي مزود SMTP (Yahoo، Mailgun، SendGrid، إلخ). فقط احصل على:
- SMTP Host
- SMTP Port (عادة 587 أو 465)
- Username/Email
- Password/API Key

---

## 💻 الخطوة 4: رفع الكود إلى GitHub | Step 4: Push Code to GitHub

### 4.1 إنشاء Repository جديد
1. اذهب إلى [github.com](https://github.com)
2. اضغط **New Repository**
3. أدخل:
   - **Repository name**: `koutob-bookshop` (أو أي اسم)
   - **Visibility**: Private (أو Public)
4. **لا** تضع علامة على README, .gitignore, license
5. اضغط **Create repository**

### 4.2 رفع الكود
افتح Terminal في مجلد المشروع (`bookshop`):

```bash
# تأكد أنك في مجلد المشروع
cd bookshop

# تحقق من حالة Git
git status

# إذا لم يكن Git مهيأ، قم بهذا:
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# أضف Remote Repository
git remote add origin https://github.com/YOUR_USERNAME/koutob-bookshop.git

# ارفع الكود
git branch -M main
git push -u origin main
```

**ملاحظة**: استبدل `YOUR_USERNAME` باسمك على GitHub

---

## 🌐 الخطوة 5: النشر على Vercel | Step 5: Deploy to Vercel

### 5.1 إنشاء حساب Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **Sign Up**
3. اختر **Continue with GitHub**
4. سجل دخول بحساب GitHub

### 5.2 استيراد المشروع
1. في Dashboard، اضغط **Add New Project**
2. اختر Repository: `koutob-bookshop`
3. اضغط **Import**

### 5.3 إعداد Environment Variables

**قبل الضغط على Deploy**، اضغط **Environment Variables** وأضف:

#### متغيرات قاعدة البيانات | Database Variables
```
MONGODB_URI = mongodb+srv://koutob_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/koutob?retryWrites=true&w=majority
MONGODB_DB = koutob
```

#### متغيرات المصادقة | Authentication Variables
```
NEXTAUTH_SECRET = (أنشئ مفتاح عشوائي - راجع أدناه)
NEXTAUTH_URL = (اتركه فارغاً الآن - سنحدثه بعد النشر)
```

**لإنشاء NEXTAUTH_SECRET**:
```bash
# في Terminal
openssl rand -base64 32
```
انسخ الناتج وضعه في `NEXTAUTH_SECRET`

#### متغيرات Cloudinary | Cloudinary Variables
```
CLOUDINARY_CLOUD_NAME = (من Cloudinary Dashboard)
CLOUDINARY_API_KEY = (من Cloudinary Dashboard)
CLOUDINARY_API_SECRET = (من Cloudinary Dashboard)
CLOUDINARY_UPLOAD_FOLDER = bookshop/books
```

#### متغيرات Email (SMTP) | Email Variables (SMTP)

**مثال Gmail**:
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = (Gmail App Password - 16 characters)
SMTP_FROM_EMAIL = your-email@gmail.com
```

**مثال Outlook**:
```
SMTP_HOST = smtp-mail.outlook.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@outlook.com
SMTP_PASSWORD = (Outlook App Password)
SMTP_FROM_EMAIL = your-email@outlook.com
```

**مثال Brevo**:
```
SMTP_HOST = smtp-relay.brevo.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@example.com
SMTP_PASSWORD = (Brevo SMTP Password)
SMTP_FROM_EMAIL = your-email@example.com
```

**ملاحظة**: استخدم القيم الخاصة بمزود SMTP الذي اخترته!

#### متغيرات عامة | General Variables
```
NEXT_PUBLIC_BASE_URL = (اتركه فارغاً الآن - سنحدثه بعد النشر)
BCRYPT_SALT_ROUNDS = 10
```

### 5.4 النشر الأول | First Deployment
1. بعد إضافة جميع المتغيرات، اضغط **Deploy**
2. انتظر 2-3 دقائق
3. بعد اكتمال النشر، ستحصل على رابط مثل:
   ```
   https://koutob-bookshop.vercel.app
   ```

### 5.5 تحديث NEXTAUTH_URL و NEXT_PUBLIC_BASE_URL
1. بعد النشر، انسخ الرابط الذي حصلت عليه
2. اذهب إلى **Settings** → **Environment Variables**
3. عدل:
   - `NEXTAUTH_URL` = `https://koutob-bookshop.vercel.app`
   - `NEXT_PUBLIC_BASE_URL` = `https://koutob-bookshop.vercel.app`
4. اضغط **Save**
5. Vercel سيعيد النشر تلقائياً

---

## 🗄️ الخطوة 6: إعداد قاعدة البيانات | Step 6: Setup Database

### 6.1 ربط قاعدة البيانات المحلية (اختياري)
إذا كان لديك بيانات محلية تريد نقلها:

1. استخدم MongoDB Compass أو أي أداة
2. اربط بـ MongoDB Atlas
3. انسخ البيانات من قاعدة البيانات المحلية إلى Atlas

### 6.2 إنشاء حساب Admin يدوياً
بعد النشر، ستحتاج لإنشاء حساب Admin:

1. اذهب إلى: `https://your-site.vercel.app/signup`
2. سجل حساب جديد
3. في MongoDB Atlas:
   - اذهب إلى **Collections**
   - افتح collection `users`
   - ابحث عن المستخدم الجديد
   - عدل `role` من `customer` إلى `admin`
   - احفظ

الآن يمكنك تسجيل الدخول كـ Admin!

---

## ✅ الخطوة 7: الاختبار | Step 7: Testing

### 7.1 اختبار الصفحات الأساسية
- ✅ الصفحة الرئيسية: `https://your-site.vercel.app`
- ✅ صفحة الكتب: `https://your-site.vercel.app/books`
- ✅ صفحة السلة: `https://your-site.vercel.app/cart`
- ✅ صفحة Checkout: `https://your-site.vercel.app/checkout`

### 7.2 اختبار المصادقة
- ✅ تسجيل حساب جديد
- ✅ تسجيل الدخول
- ✅ تسجيل الخروج

### 7.3 اختبار لوحة الإدارة
- ✅ تسجيل الدخول كـ Admin
- ✅ إضافة كتاب جديد
- ✅ رفع صورة (يجب أن تعمل مع Cloudinary)

### 7.4 اختبار الطلبات
- ✅ إضافة كتاب للسلة
- ✅ إنشاء طلب
- ✅ التحقق من الطلب في لوحة الإدارة

---

## 🔧 استكشاف الأخطاء | Troubleshooting

### المشكلة: الموقع لا يعمل
**الحل**:
1. تحقق من Environment Variables في Vercel
2. راجع Logs في Vercel Dashboard → **Deployments** → **View Function Logs**

### المشكلة: قاعدة البيانات لا تتصل
**الحل**:
1. تحقق من `MONGODB_URI` في Vercel
2. تأكد من أن Network Access في MongoDB Atlas يسمح بـ `0.0.0.0/0`
3. تحقق من أن Database User موجود وصحيح

### المشكلة: الصور لا ترفع
**الحل**:
1. تحقق من Cloudinary credentials في Vercel
2. تأكد من أن `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` صحيحة

### المشكلة: الإيميلات لا ترسل
**الحل**:
1. تحقق من SMTP credentials
2. إذا استخدمت Gmail، تأكد من استخدام **App Password** وليس كلمة المرور العادية
3. راجع Logs في Vercel

---

## 📊 ملخص المتغيرات المطلوبة | Environment Variables Summary

### Required (مطلوبة)
```
✅ MONGODB_URI
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ SMTP_HOST
✅ SMTP_PORT
✅ SMTP_USER
✅ SMTP_PASSWORD
✅ NEXT_PUBLIC_BASE_URL
```

### Optional (اختيارية)
```
⚠️ MONGODB_DB (افتراضي: koutob)
⚠️ CLOUDINARY_UPLOAD_FOLDER (افتراضي: bookshop/books)
⚠️ SMTP_FROM_EMAIL
⚠️ BCRYPT_SALT_ROUNDS (افتراضي: 10)
```

---

## 🎉 مبروك! | Congratulations!

الآن موقعك يعمل على:
```
https://your-project.vercel.app
```

يمكنك مشاركة هذا الرابط مع العميل للاختبار!

---

## 📝 ملاحظات إضافية | Additional Notes

1. **التحديثات التلقائية**: كل مرة ترفع كود جديد إلى GitHub، Vercel سيعيد النشر تلقائياً
2. **Custom Domain**: يمكنك إضافة نطاق مخصص من Vercel Settings
3. **Backup**: احفظ جميع Environment Variables في مكان آمن
4. **Monitoring**: راقب Logs في Vercel Dashboard بانتظام

---

## 🔗 روابط مفيدة | Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Resend Dashboard](https://resend.com/dashboard)
- [GitHub](https://github.com)

---

**آخر تحديث**: 2024
**الإصدار**: 1.0

