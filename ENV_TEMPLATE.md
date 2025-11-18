# 🔐 Environment Variables Template

استخدم هذا القالب لنسخ جميع المتغيرات المطلوبة إلى Vercel.

Use this template to copy all required variables to Vercel.

---

## 📋 قائمة المتغيرات | Variables List

### 1. Database | قاعدة البيانات
```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/koutob?retryWrites=true&w=majority
MONGODB_DB=koutob
```

### 2. Authentication | المصادقة
```
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_HERE
NEXTAUTH_URL=https://your-project.vercel.app
```

**لإنشاء NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 3. Cloudinary | الصور
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here
CLOUDINARY_UPLOAD_FOLDER=bookshop/books
```

### 4. Email - SMTP | البريد الإلكتروني (SMTP)

**Gmail (موصى به للمبتدئين | Recommended for beginners)**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Outlook/Hotmail**:
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-outlook-app-password
SMTP_FROM_EMAIL=your-email@outlook.com
```

**Brevo (SMTP مجاني | Free SMTP)**:
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-brevo-smtp-password
SMTP_FROM_EMAIL=your-email@example.com
```

**ملاحظة**: استخدم القيم الخاصة بمزود SMTP الذي اخترته!

### 5. General | عامة
```
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
BCRYPT_SALT_ROUNDS=10
```

---

## 📝 كيفية الاستخدام | How to Use

1. انسخ كل متغير من القائمة أعلاه
2. استبدل القيم المثال بالقيم الحقيقية
3. الصق في Vercel → Settings → Environment Variables
4. تأكد من تحديد **Production**, **Preview**, و **Development**

---

## ⚠️ ملاحظات أمنية | Security Notes

- ❌ **لا تشارك** هذه القيم مع أي شخص
- ❌ **لا ترفع** ملف `.env.local` إلى GitHub
- ✅ **احفظ** نسخة احتياطية من جميع القيم في مكان آمن
- ✅ **استخدم** قيم مختلفة للـ Development و Production

---

## 🔄 بعد النشر الأول | After First Deployment

بعد الحصول على رابط Vercel، عدّل:

1. `NEXTAUTH_URL` = رابط Vercel الجديد
2. `NEXT_PUBLIC_BASE_URL` = رابط Vercel الجديد

ثم Vercel سيعيد النشر تلقائياً.

---

**آخر تحديث**: 2024

