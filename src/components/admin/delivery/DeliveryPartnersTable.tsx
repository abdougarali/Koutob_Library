"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@headlessui/react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";

type AdminDeliveryPartner = {
  _id?: string;
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  deliveryFees?: number;
  isActive: boolean;
};

type DeliveryPartnersTableProps = {
  initialPartners: AdminDeliveryPartner[];
};

export function DeliveryPartnersTable({
  initialPartners,
}: DeliveryPartnersTableProps) {
  const [partners, setPartners] = useState(initialPartners);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPartner, setEditingPartner] =
    useState<AdminDeliveryPartner | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<Partial<AdminDeliveryPartner>>({
    name: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    deliveryFees: 0,
    isActive: true,
  });

  const handleOpen = (partner?: AdminDeliveryPartner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || "",
        contactName: partner.contactName || "",
        contactPhone: partner.contactPhone || "",
        contactEmail: partner.contactEmail || "",
        deliveryFees: partner.deliveryFees ?? 0,
        isActive: partner.isActive !== undefined ? partner.isActive : true,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        deliveryFees: 0,
        isActive: true,
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingPartner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const url = editingPartner
          ? `/api/delivery/${editingPartner._id}`
          : "/api/delivery";
        const method = editingPartner ? "PATCH" : "POST";

        // Prepare data: preserve email even if empty, but trim whitespace
        const submitData = {
          ...formData,
          contactEmail: formData.contactEmail?.trim() || "",
          contactName: formData.contactName?.trim() || "",
          contactPhone: formData.contactPhone?.trim() || "",
        };

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || "حدث خطأ");
          return;
        }

        const updatedPartner = await response.json();
        if (editingPartner) {
          setPartners(
            partners.map((p) =>
              p._id === editingPartner._id
                ? { 
                    ...updatedPartner, 
                    _id: updatedPartner._id?.toString(),
                    contactEmail: updatedPartner.contactEmail || "",
                  }
                : p,
            ),
          );
          toast.success("تم تحديث شريك التوصيل بنجاح");
        } else {
          setPartners([
            { 
              ...updatedPartner, 
              _id: updatedPartner._id?.toString(),
              contactEmail: updatedPartner.contactEmail || "",
            },
            ...partners,
          ]);
          toast.success("تم إضافة شريك التوصيل بنجاح");
        }
        handleClose();
      } catch (error) {
        console.error("Error saving partner:", error);
        toast.error("حدث خطأ أثناء الحفظ");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف شريك التوصيل هذا؟")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/delivery/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          toast.error("حدث خطأ أثناء الحذف");
          return;
        }

        setPartners(partners.filter((p) => p._id !== id));
        toast.success("تم حذف شريك التوصيل بنجاح");
      } catch (error) {
        console.error("Error deleting partner:", error);
        toast.error("حدث خطأ أثناء الحذف");
      }
    });
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">
          إدارة شركاء التوصيل
        </h2>
        <button
          onClick={() => handleOpen()}
          className="rounded-xl bg-[color:var(--color-primary)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          إضافة شريك جديد
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="grid gap-3 sm:hidden">
        {partners.map((partner) => (
          <div
            key={partner._id}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الاسم
                </span>
                <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {partner.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  جهة الاتصال
                </span>
                <span className="text-xs text-[color:var(--color-foreground-muted)]">
                  {partner.contactName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الهاتف
                </span>
                <span className="text-xs text-[color:var(--color-foreground-muted)]">
                  {partner.contactPhone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  البريد الإلكتروني
                </span>
                <span className="text-xs text-[color:var(--color-foreground-muted)] break-all">
                  {partner.contactEmail || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  سعر التوصيل
                </span>
                <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {partner.deliveryFees ?? 0} د.ت
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الحالة
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    partner.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {partner.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الإجراءات
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpen(partner)}
                    className="min-h-[36px] rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-medium text-blue-600 transition active:bg-blue-100"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(partner._id!)}
                    className="min-h-[36px] rounded-lg bg-red-50 px-3 py-2 text-[10px] font-medium text-red-600 transition active:bg-red-100"
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
                جهة الاتصال
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الهاتف
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                البريد الإلكتروني
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                سعر التوصيل
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
            {partners.map((partner) => (
              <tr
                key={partner._id}
                className="border-b border-gray-100"
              >
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {partner.name}
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {partner.contactName}
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {partner.contactPhone}
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {partner.contactEmail || "-"}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {partner.deliveryFees ?? 0} د.ت
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      partner.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {partner.isActive ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpen(partner)}
                      className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id!)}
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
          <Dialog.Panel className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl" dir="rtl">
            <Dialog.Title className="mb-4 text-2xl font-bold text-[color:var(--color-foreground)]">
              {editingPartner ? "تعديل شريك التوصيل" : "إضافة شريك جديد"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                  اسم الشركة *
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
                  اسم جهة الاتصال *
                </label>
                <input
                  type="text"
                  value={formData.contactName || ""}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={8}
                  value={formData.contactPhone || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                    setFormData({ ...formData, contactPhone: value });
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
                    setFormData({ ...formData, contactPhone: numbersOnly });
                  }}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                  سعر التوصيل (د.ت) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.deliveryFees !== undefined && formData.deliveryFees !== null 
                    ? formData.deliveryFees.toString() 
                    : "0"}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow numbers, decimal point, and comma (for decimal separator)
                    const cleaned = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
                    // Only allow one decimal point
                    const parts = cleaned.split(".");
                    const formatted = parts.length > 1 
                      ? parts[0] + "." + parts.slice(1).join("")
                      : parts[0];
                    const numValue = formatted === "" ? 0 : parseFloat(formatted) || 0;
                    if (numValue >= 0) {
                      setFormData({ ...formData, deliveryFees: numValue });
                    }
                  }}
                  onKeyPress={(e) => {
                    // Allow numbers, decimal point, comma, and control keys
                    if (!/[0-9.,]/.test(e.key) && 
                        e.key !== "Backspace" && 
                        e.key !== "Delete" && 
                        e.key !== "Tab" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight") {
                      e.preventDefault();
                    }
                  }}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                  placeholder="0.000"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-[color:var(--color-foreground)]"
                >
                  نشط
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending && <LoadingSpinner size="sm" />}
                  {isPending ? "جاري الحفظ..." : editingPartner ? "تحديث" : "إضافة"}
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
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

