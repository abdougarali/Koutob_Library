"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { SavedAddresses } from "./SavedAddresses";

type CustomerProfileClientProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ProfileData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function CustomerProfileClient({ user: initialUser }: CustomerProfileClientProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    phone: "",
    address: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);

  // Password change form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch user profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/auth/profile");
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
          });
        } else {
          toast.error("فشل في جلب بيانات الملف الشخصي");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الملف الشخصي");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "تم تحديث الملف الشخصي بنجاح");
        setProfileData(data.user);
        setIsEditing(false);
      } else {
        toast.error(data.error || "حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "تم تغيير كلمة المرور بنجاح");
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        toast.error(data.error || "حدث خطأ أثناء تغيير كلمة المرور");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[color:var(--color-foreground-muted)]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
          ملفي الشخصي
        </h1>
        <p className="mt-2 text-[color:var(--color-foreground-muted)]">
          إدارة معلومات حسابك الشخصية
        </p>
      </div>

      {/* Profile Information Form */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
            المعلومات الشخصية
          </h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              تعديل المعلومات
            </button>
          )}
        </div>

        {!isEditing && (
          <p className="mb-4 text-sm text-[color:var(--color-foreground-muted)]">
            انقر على زر "تعديل المعلومات" أعلاه لتعديل بياناتك الشخصية
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
              الاسم
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              required
              minLength={3}
              maxLength={140}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-[color:var(--color-foreground-muted)]"
            />
            <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
              لا يمكن تغيير البريد الإلكتروني
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
              رقم الهاتف
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                setFormData({ ...formData, phone: value });
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || (window as any).clipboardData).getData("text");
                const numbersOnly = pastedText.replace(/[^0-9]/g, "").slice(0, 8);
                setFormData({ ...formData, phone: numbersOnly });
              }}
              disabled={!isEditing}
              placeholder="12345678"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
              العنوان
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              maxLength={240}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
              المدينة
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!isEditing}
              maxLength={90}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (profileData) {
                    setFormData({
                      name: profileData.name,
                      email: profileData.email,
                      phone: profileData.phone || "",
                      address: profileData.address || "",
                      city: profileData.city || "",
                    });
                  }
                }}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
            تغيير كلمة المرور
          </h2>
          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
            >
              تغيير كلمة المرور
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                كلمة المرور الحالية
              </label>
              <input
                type="password"
                value={passwordFormData.currentPassword}
                onChange={(e) =>
                  setPasswordFormData({
                    ...passwordFormData,
                    currentPassword: e.target.value,
                  })
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </div>

            <div>
              <PasswordInput
                label="كلمة المرور الجديدة"
                value={passwordFormData.newPassword}
                onChange={(e) =>
                  setPasswordFormData({
                    ...passwordFormData,
                    newPassword: e.target.value,
                  })
                }
                required
                name="newPassword"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
              <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
                يجب أن تكون 6 أحرف على الأقل
              </p>
            </div>

            <div>
              <PasswordInput
                label="تأكيد كلمة المرور الجديدة"
                value={passwordFormData.confirmPassword}
                onChange={(e) =>
                  setPasswordFormData({
                    ...passwordFormData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                name="confirmPassword"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {changingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <SavedAddresses />
      </div>
    </div>
  );
}







