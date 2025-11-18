"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";

type SavedAddress = {
  _id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export function SavedAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/customer/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      } else {
        toast.error("فشل في جلب العناوين");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("حدث خطأ أثناء جلب العناوين");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (address?: SavedAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: "",
        name: "",
        phone: "",
        address: "",
        city: "",
        isDefault: false,
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingAddress(null);
    setFormData({
      label: "",
      name: "",
      phone: "",
      address: "",
      city: "",
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAddress
        ? `/api/customer/addresses/${editingAddress._id}`
        : "/api/customer/addresses";
      const method = editingAddress ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingAddress ? "تم تحديث العنوان بنجاح" : "تم إضافة العنوان بنجاح");
        fetchAddresses();
        handleClose();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;

    try {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("تم حذف العنوان بنجاح");
        fetchAddresses();
      } else {
        toast.error("فشل في حذف العنوان");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        toast.success("تم تعيين العنوان كافتراضي");
        fetchAddresses();
      } else {
        toast.error("فشل في تعيين العنوان كافتراضي");
      }
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("حدث خطأ");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-[color:var(--color-foreground-muted)]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
          العناوين المحفوظة
        </h2>
        <button
          onClick={() => handleOpen()}
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-6 sm:text-sm"
        >
          إضافة عنوان
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            لا توجد عناوين محفوظة
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`rounded-xl border p-4 shadow-sm ${
                address.isDefault ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      {address.label}
                    </h3>
                    {address.isDefault && (
                      <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[10px] font-medium text-white">
                        افتراضي
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
                    {address.name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
                    {address.phone}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
                    {address.address}, {address.city}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-700 transition hover:bg-gray-100 sm:text-xs"
                  >
                    تعيين كافتراضي
                  </button>
                )}
                <button
                  onClick={() => handleOpen(address)}
                  className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600 transition hover:bg-blue-100 sm:text-xs"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 transition hover:bg-red-100 sm:text-xs"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-3xl bg-white p-4 shadow-xl sm:p-6" dir="rtl">
            <Dialog.Title className="mb-4 text-xl font-bold text-[color:var(--color-foreground)] sm:text-2xl">
              {editingAddress ? "تعديل العنوان" : "إضافة عنوان جديد"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                  التسمية (مثل: المنزل، العمل) *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                  maxLength={50}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                  placeholder="المنزل"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                  الاسم *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  minLength={3}
                  maxLength={140}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                  رقم الهاتف *
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
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                  العنوان *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  maxLength={240}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                  المدينة *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  maxLength={90}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[color:var(--color-primary)]"
                />
                <label htmlFor="isDefault" className="text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                  تعيين كعنوان افتراضي
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 sm:text-sm"
                >
                  {saving ? "جاري الحفظ..." : editingAddress ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50 sm:text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}








