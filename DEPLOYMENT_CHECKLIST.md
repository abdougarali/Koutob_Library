# ✅ قائمة التحقق من النشر | Deployment Checklist

استخدم هذه القائمة للتأكد من إكمال جميع الخطوات قبل النشر.

Use this checklist to ensure all steps are completed before deployment.

---

## 📋 قبل النشر | Pre-Deployment

### 1. حسابات مجانية | Free Accounts
- [ ] حساب GitHub
- [ ] حساب Vercel
- [ ] حساب MongoDB Atlas
- [ ] حساب Cloudinary
- [ ] حساب Email Service (Resend/Brevo)

### 2. إعداد MongoDB Atlas
- [ ] إنشاء M0 Cluster
- [ ] إنشاء Database User
- [ ] إعداد Network Access (0.0.0.0/0)
- [ ] نسخ Connection String

### 3. إعداد Cloudinary
- [ ] نسخ Cloud Name
- [ ] نسخ API Key
- [ ] نسخ API Secret

### 4. إعداد Email Service
- [ ] إنشاء API Key (Resend) أو SMTP credentials (Brevo)
- [ ] نسخ جميع القيم المطلوبة

### 5. رفع الكود إلى GitHub
- [ ] إنشاء Repository جديد
- [ ] رفع الكود (`git push`)

---

## 🚀 أثناء النشر | During Deployment

### 6. إعداد Vercel
- [ ] استيراد المشروع من GitHub
- [ ] إضافة Environment Variables:
  - [ ] `MONGODB_URI`
  - [ ] `MONGODB_DB`
  - [ ] `NEXTAUTH_SECRET` (تم إنشاؤه)
  - [ ] `NEXTAUTH_URL` (سيتم تحديثه لاحقاً)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `CLOUDINARY_UPLOAD_FOLDER`
  - [ ] `SMTP_HOST`
  - [ ] `SMTP_PORT`
  - [ ] `SMTP_SECURE`
  - [ ] `SMTP_USER`
  - [ ] `SMTP_PASSWORD`
  - [ ] `SMTP_FROM_EMAIL`
  - [ ] `NEXT_PUBLIC_BASE_URL` (سيتم تحديثه لاحقاً)
  - [ ] `BCRYPT_SALT_ROUNDS`

### 7. النشر الأول
- [ ] الضغط على Deploy
- [ ] انتظار اكتمال النشر (2-3 دقائق)
- [ ] نسخ الرابط النهائي

### 8. تحديث المتغيرات بعد النشر
- [ ] تحديث `NEXTAUTH_URL` بالرابط الجديد
- [ ] تحديث `NEXT_PUBLIC_BASE_URL` بالرابط الجديد
- [ ] انتظار إعادة النشر التلقائي

---

## ✅ بعد النشر | Post-Deployment

### 9. إعداد قاعدة البيانات
- [ ] إنشاء حساب Admin (من خلال MongoDB Atlas)
- [ ] (اختياري) نسخ البيانات المحلية إلى Atlas

### 10. الاختبار
- [ ] فتح الصفحة الرئيسية
- [ ] اختبار تسجيل حساب جديد
- [ ] اختبار تسجيل الدخول
- [ ] اختبار لوحة الإدارة
- [ ] اختبار إضافة كتاب جديد
- [ ] اختبار رفع صورة (Cloudinary)
- [ ] اختبار إضافة كتاب للسلة
- [ ] اختبار إنشاء طلب
- [ ] اختبار استقبال إيميل (إذا كان متاحاً)

### 11. المراجعة النهائية
- [ ] جميع الصفحات تعمل
- [ ] الصور تظهر بشكل صحيح
- [ ] قاعدة البيانات متصلة
- [ ] المصادقة تعمل
- [ ] الطلبات تُنشأ بنجاح

---

## 🔗 الروابط المهمة | Important Links

بعد النشر، احفظ هذه الروابط:

- **الموقع**: `https://your-project.vercel.app`
- **لوحة الإدارة**: `https://your-project.vercel.app/admin`
- **لوحة تحكم العميل**: `https://your-project.vercel.app/dashboard`
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **Cloudinary Dashboard**: [cloudinary.com/console](https://cloudinary.com/console)

---

## 📝 ملاحظات | Notes

```
الموقع: https://_____________________.vercel.app
تاريخ النشر: ____________________
```

---

**✅ اكتمل النشر بنجاح! | Deployment Completed Successfully!**












