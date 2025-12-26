"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";

type DiscountCode = {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderTotal: number;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type DiscountCodesManagerProps = {
  initialDiscounts: DiscountCode[];
};

const defaultFormState = {
  code: "",
  description: "",
  type: "percentage" as "percentage" | "fixed",
  value: 10,
  minOrderTotal: 0,
  maxDiscountAmount: "",
  usageLimit: "",
  perUserLimit: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

export function DiscountCodesManager({
  initialDiscounts,
}: DiscountCodesManagerProps) {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDiscounts = useMemo(() => {
    if (!searchTerm.trim()) return discounts;
    return discounts.filter((discount) =>
      discount.code.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }, [discounts, searchTerm]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = discounts.filter(
      (discount) =>
        discount.isActive &&
        (!discount.startDate || new Date(discount.startDate) <= now) &&
        (!discount.endDate || new Date(discount.endDate) >= now),
    ).length;
    const upcoming = discounts.filter(
      (discount) =>
        discount.startDate && new Date(discount.startDate) > now && discount.isActive,
    ).length;
    const expired = discounts.filter(
      (discount) =>
        (discount.endDate && new Date(discount.endDate) < now) || !discount.isActive,
    ).length;
    const totalSavings = discounts.reduce(
      (acc, discount) => acc + discount.usageCount * discount.value,
      0,
    );

    return { active, upcoming, expired, totalSavings };
  }, [discounts]);

  const openModal = (discount?: DiscountCode) => {
    if (discount) {
      setFormState({
        code: discount.code,
        description: discount.description ?? "",
        type: discount.type,
        value: discount.value,
        minOrderTotal: discount.minOrderTotal,
        maxDiscountAmount: discount.maxDiscountAmount?.toString() ?? "",
        usageLimit: discount.usageLimit?.toString() ?? "",
        perUserLimit: discount.perUserLimit?.toString() ?? "",
        startDate: discount.startDate
          ? new Date(discount.startDate).toISOString().slice(0, 16)
          : "",
        endDate: discount.endDate
          ? new Date(discount.endDate).toISOString().slice(0, 16)
          : "",
        isActive: discount.isActive,
      });
      setEditingId(discount._id);
    } else {
      setFormState(defaultFormState);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormState(defaultFormState);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      code: formState.code.trim(),
      description: formState.description.trim() || undefined,
      type: formState.type,
      value: Number(formState.value),
      minOrderTotal: Number(formState.minOrderTotal || 0),
      maxDiscountAmount: formState.maxDiscountAmount
        ? Number(formState.maxDiscountAmount)
        : undefined,
      usageLimit: formState.usageLimit ? Number(formState.usageLimit) : undefined,
      perUserLimit: formState.perUserLimit ? Number(formState.perUserLimit) : undefined,
      startDate: formState.startDate ? new Date(formState.startDate).toISOString() : undefined,
      endDate: formState.endDate ? new Date(formState.endDate).toISOString() : undefined,
      isActive: formState.isActive,
    };

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/discount-codes/${editingId}`
          : "/api/admin/discount-codes",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء الحفظ");
      }

      if (editingId) {
        setDiscounts((prev) =>
            prev.map((discount) =>
              discount._id === editingId ? data.discount : discount,
            ),
        );
        toast.success("تم تحديث رمز الخصم بنجاح");
      } else {
        setDiscounts((prev) => [data.discount, ...prev]);
        toast.success("تم إنشاء رمز الخصم بنجاح");
      }

      closeModal();
    } catch (error: any) {
      console.error("Error saving discount code:", error);
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (discount: DiscountCode) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${discount._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !discount.isActive }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل في تحديث الحالة");
      }
      setDiscounts((prev) =>
        prev.map((item) => (item._id === discount._id ? data.discount : item)),
      );
      toast.success("تم تحديث حالة الرمز");
    } catch (error: any) {
      console.error("Error toggling discount:", error);
      toast.error(error.message || "حدث خطأ أثناء تحديث الحالة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف رمز الخصم هذا؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل في حذف الرمز");
      }
      setDiscounts((prev) => prev.filter((discount) => discount._id !== id));
      toast.success("تم حذف رمز الخصم");
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      toast.error(error.message || "حدث خطأ أثناء حذف الرمز");
    }
  };

  const getStatusBadge = (discount: DiscountCode) => {
    const now = new Date();
    const startDate = discount.startDate ? new Date(discount.startDate) : null;
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    if (!discount.isActive) {
      return (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
          موقوف
        </span>
      );
    }

    if (startDate && startDate > now) {
      return (
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
          قادم
        </span>
      );
    }

    if (endDate && endDate < now) {
      return (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
          منتهٍ
        </span>
      );
    }

    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
        نشط
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
            رموز الخصم
          </h1>
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            إدارة رموز الخصم والعروض الترويجية
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          إنشاء رمز جديد
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[rgba(10,110,92,0.15)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[color:var(--color-foreground-muted)]">رموز نشطة</p>
          <p className="mt-2 text-2xl font-bold text-[color:var(--color-primary)]">
            {stats.active}
          </p>
        </div>
        <div className="rounded-2xl border border-[rgba(10,110,92,0.15)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[color:var(--color-foreground-muted)]">قيد البدء</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.upcoming}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(10,110,92,0.15)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[color:var(--color-foreground-muted)]">منتهية</p>
          <p className="mt-2 text-2xl font-bold text-red-500">{stats.expired}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(10,110,92,0.15)] bg-white p-4 shadow-sm">
          <p className="text-xs text-[color:var(--color-foreground-muted)]">إجمالي الخصومات</p>
          <p className="mt-2 text-2xl font-bold text-[color:var(--color-foreground)]">
            {stats.totalSavings.toFixed(0)} د.ت
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.5 16.5z"
              />
            </svg>
            <input
              type="text"
              placeholder="البحث عن رمز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 bg-transparent text-sm text-[color:var(--color-foreground)] focus:outline-none"
            />
          </div>
          <p className="text-xs text-[color:var(--color-foreground-muted)]">
            {filteredDiscounts.length} رمز
          </p>
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-right text-xs text-[color:var(--color-foreground-muted)]">
                <th className="px-3 py-2 font-semibold">الرمز</th>
                <th className="px-3 py-2 font-semibold">الخصم</th>
                <th className="px-3 py-2 font-semibold">الفترة</th>
                <th className="px-3 py-2 font-semibold">الاستخدام</th>
                <th className="px-3 py-2 font-semibold">الحالة</th>
                <th className="px-3 py-2 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((discount) => (
                <tr key={discount._id} className="border-b border-gray-100 text-sm">
                  <td className="px-3 py-3 font-semibold text-[color:var(--color-foreground)]">
                    <div className="flex flex-col">
                      <span>{discount.code}</span>
                      {discount.description && (
                        <span className="text-xs text-[color:var(--color-foreground-muted)]">
                          {discount.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[color:var(--color-foreground)]">
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : `${discount.value} د.ت`}
                    {discount.minOrderTotal > 0 && (
                      <span className="block text-xs text-[color:var(--color-foreground-muted)]">
                        حد أدنى {discount.minOrderTotal} د.ت
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[color:var(--color-foreground-muted)]">
                    {discount.startDate ? (
                      <>
                        <span>{new Date(discount.startDate).toLocaleDateString("ar-TN")}</span>
                        <span className="mx-1 text-[color:var(--color-foreground-muted)]">-</span>
                        {discount.endDate ? (
                          <span>{new Date(discount.endDate).toLocaleDateString("ar-TN")}</span>
                        ) : (
                          <span>مفتوح</span>
                        )}
                      </>
                    ) : (
                      <span>بدون تواريخ</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[color:var(--color-foreground)]">
                    {discount.usageCount}
                    {discount.usageLimit && (
                      <span className="text-xs text-[color:var(--color-foreground-muted)]">
                        {" "}
                        / {discount.usageLimit}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">{getStatusBadge(discount)}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(discount)}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleToggleActive(discount)}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                      >
                        {discount.isActive ? "إيقاف" : "تفعيل"}
                      </button>
                      <button
                        onClick={() => handleDelete(discount._id)}
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

        {/* Mobile cards */}
        <div className="mt-4 grid gap-3 lg:hidden">
          {filteredDiscounts.map((discount) => (
            <div key={discount._id} className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-[color:var(--color-foreground)]">
                    {discount.code}
                  </p>
                  {discount.description && (
                    <p className="text-xs text-[color:var(--color-foreground-muted)]">
                      {discount.description}
                    </p>
                  )}
                </div>
                {getStatusBadge(discount)}
              </div>
              <div className="mt-3 grid gap-2 text-xs text-[color:var(--color-foreground-muted)]">
                <div className="flex items-center justify-between">
                  <span>قيمة الخصم</span>
                  <span className="font-semibold text-[color:var(--color-foreground)]">
                    {discount.type === "percentage"
                      ? `${discount.value}%`
                      : `${discount.value} د.ت`}
                  </span>
                </div>
                {discount.minOrderTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span>الحد الأدنى</span>
                    <span className="font-semibold text-[color:var(--color-foreground)]">
                      {discount.minOrderTotal} د.ت
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>الفترة</span>
                  <span className="font-semibold text-[color:var(--color-foreground)]">
                    {discount.startDate
                      ? new Date(discount.startDate).toLocaleDateString("ar-TN")
                      : "بدون"}
                    {" - "}
                    {discount.endDate
                      ? new Date(discount.endDate).toLocaleDateString("ar-TN")
                      : "مفتوح"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الاستخدام</span>
                  <span className="font-semibold text-[color:var(--color-foreground)]">
                    {discount.usageCount}
                    {discount.usageLimit ? ` / ${discount.usageLimit}` : ""}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => openModal(discount)}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleToggleActive(discount)}
                  className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                >
                  {discount.isActive ? "إيقاف" : "تفعيل"}
                </button>
                <button
                  onClick={() => handleDelete(discount._id)}
                  className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
            <Dialog.Title className="text-xl font-bold text-[color:var(--color-foreground)]">
              {editingId ? "تعديل رمز الخصم" : "إنشاء رمز خصم جديد"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    الرمز *
                  </label>
                  <input
                    type="text"
                    value={formState.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    required
                    maxLength={32}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                    placeholder="SUMMER25"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={formState.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    maxLength={200}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                    placeholder="خصم صيفي على كل الكتب"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    نوع الخصم *
                  </label>
                  <select
                    value={formState.type}
                    onChange={(e) => handleChange("type", e.target.value as "percentage" | "fixed")}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    قيمة الخصم *
                  </label>
                  <input
                    type="number"
                    min={formState.type === "percentage" ? 1 : 0.5}
                    max={formState.type === "percentage" ? 100 : undefined}
                    value={formState.value}
                    onChange={(e) => handleChange("value", Number(e.target.value))}
                    required
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    الحد الأدنى لقيمة الطلب
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.minOrderTotal}
                    onChange={(e) => handleChange("minOrderTotal", Number(e.target.value))}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    الحد الأقصى للخصم (للنسبة المئوية)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.maxDiscountAmount}
                    onChange={(e) => handleChange("maxDiscountAmount", e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    الحد الأقصى لاستخدام الرمز
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.usageLimit}
                    onChange={(e) => handleChange("usageLimit", e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                    placeholder="مثال: 100"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    الحد لكل عميل
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.perUserLimit}
                    onChange={(e) => handleChange("perUserLimit", e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                    placeholder="مثال: 1"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    بداية الحملة
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-[color:var(--color-foreground)]">
                    نهاية الحملة
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formState.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[color:var(--color-primary)]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-[color:var(--color-foreground)]">
                  تفعيل الرمز مباشرة
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : editingId ? "تحديث الرمز" : "إنشاء الرمز"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
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



















