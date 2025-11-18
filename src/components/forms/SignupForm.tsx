"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PasswordInput } from "./PasswordInput";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For phone field, only allow numbers and limit to 8 digits
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 8);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    if (formData.phone && formData.phone.length > 0 && formData.phone.length !== 8) {
      newErrors.phone = "رقم الهاتف يجب أن يكون 8 أرقام";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((detail: any) => {
            const field = detail.path[0];
            if (field) {
              fieldErrors[field] = detail.message;
            }
          });
          setErrors(fieldErrors);
          toast.error(data.error || "فشل في إنشاء الحساب");
        } else {
          setErrors({ submit: data.error || "فشل في إنشاء الحساب" });
          toast.error(data.error || "فشل في إنشاء الحساب");
        }
        return;
      }

      // Success - redirect to verification page
      toast.success(data.message || "تم إرسال رابط التحقق إلى بريدك الإلكتروني");
      
      // Redirect to verification page (no dev link shown)
      router.push("/verify-email");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("حدث خطأ أثناء إنشاء الحساب");
      setErrors({ submit: "حدث خطأ غير متوقع" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          الاسم الكامل <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.name
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="أدخل اسمك الكامل"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.email
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          رقم الهاتف
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={8}
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.phone
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="12345678"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
        )}
        <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
          8 أرقام فقط (اختياري)
        </p>
      </div>

      {/* Password */}
      <div>
        <PasswordInput
          id="password"
          name="password"
          label="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.password
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="6 أحرف على الأقل"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="تأكيد كلمة المرور"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={`w-full rounded-lg border px-4 py-3 text-sm transition ${
            errors.confirmPassword
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          }`}
          placeholder="أعد إدخال كلمة المرور"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          العنوان
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          placeholder="العنوان الكامل"
        />
      </div>

      {/* City */}
      <div>
        <label
          htmlFor="city"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          المدينة
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          placeholder="المدينة"
        />
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "جاري الإنشاء..." : "إنشاء حساب"}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-[color:var(--color-foreground-muted)]">
        لديك حساب بالفعل؟{" "}
        <a
          href="/admin/login"
          className="font-medium text-[color:var(--color-primary)] hover:underline"
        >
          تسجيل الدخول
        </a>
      </p>
    </form>
  );
}

