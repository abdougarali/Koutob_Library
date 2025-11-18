"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import { ImageUploader } from "./ImageUploader";
import { CustomSelect } from "@/components/shared/CustomSelect";

type AdminBook = {
  _id?: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  imageUrl: string;
  status: string;
  description?: string;
  publisher?: string;
  publishedYear?: number;
  format?: string;
  isFeatured?: boolean;
  images?: {
    publicId?: string;
    url?: string;
    width?: number;
    height?: number;
    format?: string;
    isPrimary?: boolean;
  }[];
};

type BooksTableProps = {
  initialBooks: AdminBook[];
};

export function BooksTable({ initialBooks }: BooksTableProps) {
  const [books, setBooks] = useState(initialBooks);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<Partial<AdminBook>>({
    title: "",
    slug: "",
    author: "",
    category: "",
    price: undefined,
    salePrice: undefined,
    stock: 0,
    imageUrl: "",
    description: "",
    status: "published",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("");
  const [salePriceInput, setSalePriceInput] = useState<string>("");
  const [images, setImages] = useState<NonNullable<AdminBook["images"]>>([]);

  const handleOpen = (book?: AdminBook) => {
    if (book) {
      setEditingBook(book);
      const existingSalePrice =
        typeof book.salePrice === "number" && book.salePrice > 0
          ? book.salePrice
          : undefined;
      setFormData({
        title: book.title || "",
        slug: book.slug || "",
        author: book.author || "",
        category: book.category || "",
        price: typeof book.price === "number" ? book.price : undefined,
        salePrice: existingSalePrice,
        stock: book.stock || 0,
        imageUrl: book.imageUrl || "",
        description: book.description || "",
        status: book.status || "published",
        publisher: book.publisher || "",
        publishedYear: book.publishedYear || undefined,
        format: book.format || "paperback",
        isFeatured: book.isFeatured || false,
      });
      setImagePreview(book.imageUrl || null);
      setImages(book.images ?? []);
      setPriceInput(
        typeof book.price === "number" && !Number.isNaN(book.price)
          ? String(book.price)
          : "",
      );
      setSalePriceInput(
        existingSalePrice !== undefined ? String(existingSalePrice) : "",
      );
    } else {
      setEditingBook(null);
      setFormData({
        title: "",
        slug: "",
        author: "",
        category: "",
        price: undefined,
        salePrice: undefined,
        stock: 0,
        imageUrl: "",
        description: "",
        status: "published",
        publisher: "",
        publishedYear: undefined,
        format: "paperback",
        isFeatured: false,
      });
      setImagePreview(null);
      setImages([]);
      setPriceInput("");
      setSalePriceInput("");
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingBook(null);
    setImagePreview(null);
    setPriceInput("");
    setSalePriceInput("");
  };

  const decimalPattern = /^\d*(?:[.,]\d{0,3})?$/;

  const normalizeDecimal = (value: string) => value.replace(",", ".");

  const handlePriceInputChange = (value: string) => {
    if (value === "" || decimalPattern.test(value)) {
      const normalized = normalizeDecimal(value);
      if (normalized === "" || normalized === ".") {
        setPriceInput("");
        setFormData((prev) => ({ ...prev, price: undefined }));
        return;
      }

      const parsed = Number(normalized);
      if (Number.isNaN(parsed)) {
        return;
      }
      setPriceInput(value);
      setFormData((prev) => ({
        ...prev,
        price: parsed,
      }));
    }
  };

  const handleSalePriceInputChange = (value: string) => {
    if (value === "" || decimalPattern.test(value)) {
      const normalized = normalizeDecimal(value);
      if (normalized === "" || normalized === ".") {
        setSalePriceInput("");
        setFormData((prev) => ({ ...prev, salePrice: undefined }));
        return;
      }

      const parsed = Number(normalized);
      if (Number.isNaN(parsed) || parsed <= 0) {
        setSalePriceInput(value);
        setFormData((prev) => ({ ...prev, salePrice: undefined }));
        return;
      }

      setSalePriceInput(value);
      setFormData((prev) => ({
        ...prev,
        salePrice: parsed,
      }));
    }
  };

  const effectiveDisplayPrice =
    formData.salePrice !== undefined && formData.salePrice > 0
      ? formData.salePrice
      : formData.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق الأساسي قبل الإرسال
    const title = formData.title?.trim() || "";
    const slug = formData.slug?.trim() || "";
    const author = formData.author?.trim() || "";
    const category = formData.category?.trim() || "";
    const imageUrl = formData.imageUrl?.trim() || "";
    const price = formData.price;

    if (title.length < 3) {
      toast.error("العنوان يجب أن يكون 3 أحرف على الأقل");
      return;
    }
    if (slug.length < 3) {
      toast.error("الرابط (Slug) يجب أن يكون 3 أحرف على الأقل");
      return;
    }
    if (author.length < 3) {
      toast.error("المؤلف يجب أن يكون 3 أحرف على الأقل");
      return;
    }
    if (category.length < 2) {
      toast.error("التصنيف يجب أن يكون حرفين على الأقل");
      return;
    }
    // If images array has a primary, prefer it as imageUrl
    const primaryImage = images.find((img) => img?.isPrimary && img?.url);
    const finalImageUrl = primaryImage?.url || imageUrl;
    if (!finalImageUrl) {
      toast.error("يرجى رفع صورة واحدة على الأقل أو إدخال رابط صورة صالح");
      return;
    }
    if (price === undefined || Number.isNaN(price) || price <= 0) {
      toast.error("السعر يجب أن يكون أكبر من صفر");
      return;
    }
    const salePriceValue =
      formData.salePrice !== undefined && !Number.isNaN(formData.salePrice)
        ? formData.salePrice
        : undefined;

    if (salePriceValue !== undefined && salePriceValue <= 0) {
      toast.error("سعر التخفيض يجب أن يكون أكبر من صفر");
      return;
    }

    if (
      salePriceValue !== undefined &&
      salePriceValue > 0 &&
      salePriceValue >= price
    ) {
      toast.error("سعر التخفيض يجب أن يكون أقل من السعر الأصلي");
      return;
    }

    startTransition(async () => {
      try {
        // تنظيف البيانات قبل الإرسال
        const cleanedData: any = {
          title,
          slug,
          author,
          category,
          price: Number(price.toFixed(3)),
          stock: Number(formData.stock) || 0,
          imageUrl: finalImageUrl,
          description: formData.description?.trim() || "",
          status: formData.status || "published",
          format: formData.format || "paperback",
          language: "arabic",
        };

        // إضافة الحقول الاختيارية فقط إذا كانت موجودة
        if (salePriceValue !== undefined && salePriceValue > 0) {
          cleanedData.salePrice = Number(salePriceValue.toFixed(3));
        }
        if (formData.publisher?.trim()) {
          cleanedData.publisher = formData.publisher.trim();
        }
        if (formData.publishedYear) {
          cleanedData.publishedYear = Number(formData.publishedYear);
        }
        if (formData.isFeatured !== undefined) {
          cleanedData.isFeatured = formData.isFeatured;
        }
        if (images && images.length > 0) {
          cleanedData.images = images.map((img) => ({
            publicId: img.publicId,
            url: img.url,
            width: img.width,
            height: img.height,
            format: img.format,
            isPrimary: !!img.isPrimary,
          }));
        }

        const url = editingBook
          ? `/api/books/${encodeURIComponent(editingBook.slug)}`
          : "/api/books";
        const method = editingBook ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedData),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Validation error:", error);
          if (error.details && Array.isArray(error.details)) {
            const details = error.details
              .map((d: any) => {
                const field = d.path?.join(".") || "حقل غير معروف";
                return `• ${field}: ${d.message || "قيمة غير صحيحة"}`;
              })
              .join("\n");
            toast.error(`بيانات غير صحيحة:\n\n${details}\n\nيرجى التحقق من الحقول المطلوبة وملء جميع البيانات بشكل صحيح.`, {
              duration: 6000,
            });
          } else {
            toast.error(error.error || "حدث خطأ أثناء الحفظ");
          }
          return;
        }

        const updatedBook = await response.json();
        if (editingBook) {
          setBooks(
            books.map((b) =>
              b.slug === editingBook.slug ? { ...updatedBook, _id: updatedBook._id?.toString() } : b,
            ),
          );
          toast.success("تم تحديث الكتاب بنجاح");
        } else {
          setBooks([{ ...updatedBook, _id: updatedBook._id?.toString() }, ...books]);
          toast.success("تم إضافة الكتاب بنجاح");
        }
        handleClose();
      } catch (error) {
        console.error("Error saving book:", error);
        toast.error("حدث خطأ أثناء الحفظ");
      }
    });
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكتاب؟")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/books/${encodeURIComponent(slug)}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          toast.error("حدث خطأ أثناء الحذف");
          return;
        }

        setBooks(books.filter((b) => b.slug !== slug));
        toast.success("تم حذف الكتاب بنجاح");
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("حدث خطأ أثناء الحذف");
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("نوع الملف غير مدعوم. يرجى اختيار صورة (PNG, JPEG, WebP, GIF)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "فشل رفع الصورة");
        setImagePreview(null);
        return;
      }

      const { url } = await response.json();
      setFormData({ ...formData, imageUrl: url });
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("حدث خطأ أثناء رفع الصورة");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    setImagePreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">
          إدارة الكتب
        </h2>
        <button
          onClick={() => handleOpen()}
          className="rounded-xl bg-[color:var(--color-primary)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          إضافة كتاب جديد
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="grid gap-3 sm:hidden">
        {books.map((book) => (
          <div
            key={book._id || book.slug}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex gap-3">
              {/* Image */}
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={book.imageUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
              {/* Content */}
              <div className="flex flex-1 flex-col gap-1.5">
                <h3 className="line-clamp-2 text-sm font-semibold text-[color:var(--color-foreground)]">
                  {book.title}
                </h3>
                <p className="text-xs text-[color:var(--color-foreground-muted)]">{book.author}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                    {book.salePrice || book.price} د.ت
                  </span>
                  <span className="text-xs text-[color:var(--color-foreground-muted)]">
                    المخزون: {book.stock}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      book.status === "published"
                        ? "bg-green-100 text-green-700"
                        : book.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {book.status === "published"
                      ? "منشور"
                      : book.status === "draft"
                        ? "مسودة"
                        : "مؤرشف"}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpen(book)}
                      className="min-h-[32px] rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-600 transition active:bg-blue-100"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(book.slug)}
                      className="min-h-[32px] rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-medium text-red-600 transition active:bg-red-100"
                    >
                      حذف
                    </button>
                  </div>
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
                الصورة
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                العنوان
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                المؤلف
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                السعر
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                المخزون
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
            {books.map((book) => (
              <tr key={book._id || book.slug} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <div className="relative h-16 w-12 overflow-hidden rounded-lg">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {book.title}
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {book.author}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {book.salePrice || book.price} د.ت
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {book.stock}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      book.status === "published"
                        ? "bg-green-100 text-green-700"
                        : book.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {book.status === "published"
                      ? "منشور"
                      : book.status === "draft"
                        ? "مسودة"
                        : "مؤرشف"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpen(book)}
                      className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(book.slug)}
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
                {editingBook ? "تعديل الكتاب" : "إضافة كتاب جديد"}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      الرابط (Slug) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug || ""}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      المؤلف *
                    </label>
                    <input
                      type="text"
                      value={formData.author || ""}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      التصنيف *
                    </label>
                    <input
                      type="text"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      السعر (د.ت) *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={priceInput}
                      onChange={(e) => handlePriceInputChange(e.target.value)}
                      required
                      placeholder="مثال: 19.900"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      سعر التخفيض (د.ت)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salePriceInput}
                      onChange={(e) => handleSalePriceInputChange(e.target.value)}
                      placeholder="مثال: 14.500"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 rounded-xl bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                    <span>
                      السعر الذي سيظهر للعميل:{" "}
                      {effectiveDisplayPrice !== undefined
                        ? effectiveDisplayPrice.toLocaleString("ar-TN", {
                            style: "currency",
                            currency: "TND",
                            maximumFractionDigits: 3,
                          })
                        : "—"}
                    </span>
                    {formData.salePrice !== undefined && formData.salePrice > 0 && (
                      <span className="mr-2 text-xs text-[color:var(--color-primary)]">
                        تم تفعيل سعر التخفيض بدلاً من السعر الأصلي.
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                      المخزون
                    </label>
                    <input
                      type="number"
                      value={formData.stock || 0}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
                      min="0"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <CustomSelect
                    label="الحالة"
                    value={formData.status || "published"}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                    options={[
                      { value: "draft", label: "مسودة" },
                      { value: "published", label: "منشور" },
                      { value: "archived", label: "مؤرشف" },
                    ]}
                    placeholder="اختر الحالة"
                    className="[&>button]:rounded-xl [&>button]:border-gray-300 [&>button]:px-3 [&>button]:py-2.5 [&>button]:text-sm sm:[&>button]:px-4 sm:[&>button]:py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
                    صورة الكتاب *
                  </label>
                  
                  <div className="flex flex-col gap-2">
                    <ImageUploader images={images} onChange={setImages as any} />
                    <div className="text-[10px] text-[color:var(--color-foreground-muted)] sm:text-xs">
                      تلميح: سيتم استخدام الصورة الأساسية كـ imageUrl الأساسي أيضاً.
                    </div>
                    <input
                      type="text"
                      value={formData.imageUrl || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setImagePreview(e.target.value || null);
                      }}
                      placeholder="(اختياري) أدخل رابط صورة بديل"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending && <LoadingSpinner size="sm" />}
                    {isPending ? "جاري الحفظ..." : editingBook ? "تحديث" : "إضافة"}
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

