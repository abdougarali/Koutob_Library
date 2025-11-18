"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@headlessui/react";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/shared/CustomSelect";

type AdminUser = {
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  phone?: string;
  address?: string;
  city?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type UsersTableProps = {
  initialUsers: AdminUser[];
};

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<Partial<AdminUser & { password: string; confirmPassword: string }>>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin", // Default to admin for admin panel
    phone: "",
    address: "",
    city: "",
    isActive: true,
  });

  const handleOpen = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "admin",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        isActive: user.isActive ?? true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin", // Always default to admin when creating new user
        phone: "",
        address: "",
        city: "",
        isActive: true,
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const name = formData.name?.trim() || "";
    const email = formData.email?.trim() || "";
    const password = formData.password?.trim() || "";
    const confirmPassword = formData.confirmPassword?.trim() || "";

    if (name.length < 3) {
      toast.error("الاسم يجب أن يكون 3 أحرف على الأقل");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    // Password validation (only for new users or if password is being changed)
    const passwordTrimmed = password?.trim() || "";
    const confirmPasswordTrimmed = confirmPassword?.trim() || "";
    
    if (!editingUser) {
      // For new users, password is required
      if (passwordTrimmed.length < 6) {
        toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }
      if (passwordTrimmed !== confirmPasswordTrimmed) {
        toast.error("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
        return;
      }
    } else {
      // For editing, password is optional but if provided, must be valid
      if (passwordTrimmed.length > 0) {
        if (passwordTrimmed.length < 6) {
          toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return;
        }
        if (passwordTrimmed !== confirmPasswordTrimmed) {
          toast.error("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        // Prepare data for submission
        // IMPORTANT: When creating users in admin panel, always set role to "admin"
        const cleanedData: any = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role: editingUser ? (formData.role || "admin") : "admin", // New users are always admin
          isActive: formData.isActive ?? true,
        };

        // Add optional fields only if they have values
        if (formData.phone?.trim()) {
          cleanedData.phone = formData.phone.trim();
        }
        if (formData.address?.trim()) {
          cleanedData.address = formData.address.trim();
        }
        if (formData.city?.trim()) {
          cleanedData.city = formData.city.trim();
        }

        // Add password - required for new users, optional for editing
        if (!editingUser) {
          // For new users, password is required
          if (!passwordTrimmed || passwordTrimmed.length < 6) {
            toast.error("كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل");
            return;
          }
          cleanedData.password = passwordTrimmed;
        } else if (passwordTrimmed && passwordTrimmed.length > 0) {
          // For editing, only include password if it's provided and not empty
          cleanedData.password = passwordTrimmed;
        }

        const url = editingUser
          ? `/api/users/${editingUser._id}`
          : "/api/users";
        const method = editingUser ? "PATCH" : "POST";

        console.log("Submitting user data:", {
          method,
          url,
          data: { 
            ...cleanedData, 
            password: cleanedData.password ? `***${cleanedData.password.length} chars` : "MISSING",
            hasPassword: !!cleanedData.password,
            passwordLength: cleanedData.password?.length || 0
          }
        });

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedData),
        });

        if (!response.ok) {
          let error: any = {};
          const contentType = response.headers.get("content-type");
          
          try {
            if (contentType?.includes("application/json")) {
              error = await response.json();
            } else {
              const text = await response.text();
              console.error("Error response (not JSON):", text);
              error = { error: `خطأ ${response.status}: ${text || response.statusText}` };
            }
          } catch (e) {
            console.error("Error parsing response:", e);
            error = { error: `حدث خطأ أثناء الحفظ: ${response.status} ${response.statusText}` };
          }
          
          console.error("=== ERROR DETAILS ===");
          console.error("Response status:", response.status);
          console.error("Response statusText:", response.statusText);
          console.error("Full error object:", JSON.stringify(error, null, 2));
          console.error("Error keys:", Object.keys(error));
          console.error("Error.details:", error.details);
          console.error("Error.error:", error.error);
          console.error("=====================");
          
          // Handle validation errors with details
          if (error.details && Array.isArray(error.details) && error.details.length > 0) {
            const details = error.details
              .map((d: any) => {
                const fieldPath = Array.isArray(d.path) ? d.path.join(".") : (d.path || "حقل غير معروف");
                const fieldName = fieldPath === "password" ? "كلمة المرور" : 
                                 fieldPath === "email" ? "البريد الإلكتروني" :
                                 fieldPath === "name" ? "الاسم" :
                                 fieldPath === "role" ? "الدور" : fieldPath;
                return `• ${fieldName}: ${d.message || "قيمة غير صحيحة"}`;
              })
              .join("\n");
            toast.error(`بيانات غير صحيحة:\n\n${details}\n\nيرجى التحقق من الحقول المطلوبة وملء جميع البيانات بشكل صحيح.`, {
              duration: 6000,
            });
          } else if (error.error) {
            // Show the error message
            toast.error(error.error);
          } else {
            // Fallback error message with more info
            console.error("Unknown error structure:", error);
            toast.error(`حدث خطأ أثناء الحفظ (${response.status}). يرجى التحقق من جميع الحقول المطلوبة.`, {
              duration: 6000,
            });
          }
          return;
        }

        const updatedUser = await response.json();
        if (editingUser) {
          setUsers(
            users.map((u) =>
              u._id === editingUser._id ? { ...updatedUser, _id: updatedUser._id?.toString() } : u,
            ),
          );
          toast.success("تم تحديث المستخدم بنجاح");
        } else {
          setUsers([{ ...updatedUser, _id: updatedUser._id?.toString() }, ...users]);
          toast.success("تم إضافة المستخدم بنجاح");
        }
        handleClose();
      } catch (error) {
        console.error("Error saving user:", error);
        toast.error("حدث خطأ أثناء الحفظ");
      }
    });
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          toast.error("حدث خطأ أثناء الحذف");
          return;
        }

        setUsers(users.filter((u) => u._id !== userId));
        toast.success("تم حذف المستخدم بنجاح");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("حدث خطأ أثناء الحذف");
      }
    });
  };

  const handleToggleActive = async (user: AdminUser) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        });

        if (!response.ok) {
          toast.error("حدث خطأ أثناء تحديث الحالة");
          return;
        }

        const updatedUser = await response.json();
        setUsers(
          users.map((u) =>
            u._id === user._id ? { ...updatedUser, _id: updatedUser._id?.toString() } : u,
          ),
        );
        toast.success(`تم ${updatedUser.isActive ? "تفعيل" : "تعطيل"} المستخدم بنجاح`);
      } catch (error) {
        console.error("Error toggling user status:", error);
        toast.error("حدث خطأ أثناء تحديث الحالة");
      }
    });
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">
          إدارة المستخدمين
        </h2>
        <button
          onClick={() => handleOpen()}
          className="rounded-xl bg-[color:var(--color-primary)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="grid gap-3 sm:hidden">
        {users.map((user) => (
          <div
            key={user._id}
            className={`rounded-xl border border-gray-200 bg-white p-3 shadow-sm ${
              !user.isActive ? "bg-red-50/30 opacity-75" : ""
            }`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الاسم
                </span>
                <div className="text-left">
                  <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {user.name}
                  </span>
                  {!user.isActive && (
                    <span className="mr-2 text-[10px] text-red-600">(معطل)</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  البريد الإلكتروني
                </span>
                <span className="text-xs text-[color:var(--color-foreground-muted)] break-all">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الدور
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  {user.role === "admin" ? "مشرف" : "عميل"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الهاتف
                </span>
                <span className="text-xs text-[color:var(--color-foreground-muted)]">
                  {user.phone || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الحالة
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700 font-bold"
                  }`}
                >
                  {user.isActive ? "نشط" : "معطل"}
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الإجراءات
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleOpen(user)}
                    className="min-h-[32px] rounded-lg bg-blue-50 px-2 py-1.5 text-[10px] font-medium text-blue-600 transition active:bg-blue-100"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`min-h-[32px] rounded-lg px-2 py-1.5 text-[10px] font-medium transition active:opacity-80 ${
                      user.isActive
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {user.isActive ? "تعطيل" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id!)}
                    className="min-h-[32px] rounded-lg bg-red-50 px-2 py-1.5 text-[10px] font-medium text-red-600 transition active:bg-red-100"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الاسم
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                البريد الإلكتروني
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الدور
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الهاتف
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الحالة
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user._id} 
                className={`border-b border-gray-100 ${
                  !user.isActive ? "bg-red-50/30 opacity-75" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {user.name}
                  {!user.isActive && (
                    <span className="mr-2 text-xs text-red-600">(معطل)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {user.role === "admin" ? "مشرف" : "عميل"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {user.phone || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700 font-bold"
                    }`}
                  >
                    {user.isActive ? "نشط" : "معطل"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpen(user)}
                      className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        user.isActive
                          ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {user.isActive ? "تعطيل" : "تفعيل"}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id!)}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl" dir="rtl" style={{ maxHeight: '85vh', overflowY: 'auto', direction: 'ltr' }}>
            <div style={{ direction: 'rtl' }}>
              <Dialog.Title className="mb-4 text-2xl font-bold text-[color:var(--color-foreground)]">
                {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <PasswordInput
                      label={editingUser ? "كلمة المرور الجديدة (اتركها فارغة للاحتفاظ بالحالية)" : "كلمة المرور *"}
                      value={formData.password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  {(!editingUser || formData.password) && (
                    <div>
                      <PasswordInput
                        label="تأكيد كلمة المرور *"
                        value={formData.confirmPassword || ""}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required={!editingUser || !!formData.password}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                      />
                    </div>
                  )}
                  <CustomSelect
                    label="الدور *"
                    value={formData.role || "admin"}
                    onChange={(value) => setFormData({ ...formData, role: value as "admin" | "customer" })}
                    options={[
                      { value: "admin", label: "مشرف" },
                      { value: "customer", label: "عميل" },
                    ]}
                    placeholder="اختر الدور"
                    className="[&>button]:rounded-xl [&>button]:border-gray-300 [&>button]:px-4 [&>button]:py-2"
                  />
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      الهاتف
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      value={formData.phone || ""}
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
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      العنوان
                    </label>
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      المدينة
                    </label>
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-[color:var(--color-foreground)]">
                      نشط
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending && <LoadingSpinner size="sm" />}
                    {isPending ? "جاري الحفظ..." : editingUser ? "تحديث" : "إضافة"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

