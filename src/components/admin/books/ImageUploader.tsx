"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

type UploadedImage = {
  publicId?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  isPrimary?: boolean;
};

type ImageUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
};

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestSignature = useCallback(async () => {
    const res = await fetch("/api/admin/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "فشل إنشاء التوقيع");
    }
    return res.json() as Promise<{
      cloudName: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      folder: string;
      eager?: string;
    }>;
  }, []);

  const uploadToCloudinary = useCallback(
    async (file: File) => {
      const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("نوع الملف غير مدعوم. يرجى اختيار صورة (PNG, JPEG, WebP, GIF)");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("حجم الملف كبير جداً. الحد الأقصى 5MB");
      }
      const { cloudName, apiKey, timestamp, signature, folder, eager } = await requestSignature();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      if (eager) formData.append("eager", eager);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "فشل رفع الصورة");
      }
      const uploaded: UploadedImage = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
        format: data.format,
        isPrimary: false,
      };
      return uploaded;
    },
    [requestSignature],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsUploading(true);
      try {
        const uploadedList: UploadedImage[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i]!;
          const img = await uploadToCloudinary(file);
          uploadedList.push(img);
        }
        const next = [...images, ...uploadedList];
        // Ensure primary exists
        if (!next.some((img) => img.isPrimary) && next.length > 0) {
          next[0].isPrimary = true;
        }
        onChange(next);
        toast.success("تم رفع الصور بنجاح");
      } catch (err: any) {
        toast.error(err.message || "حدث خطأ أثناء رفع الصور");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [images, onChange, uploadToCloudinary],
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const setPrimary = (idx: number) => {
    const next = images.map((img, i) => ({ ...img, isPrimary: i === idx }));
    onChange(next);
  };
  const removeAt = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    if (next.length > 0 && !next.some((img) => img.isPrimary)) {
      next[0].isPrimary = true;
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-4 transition hover:border-[color:var(--color-primary)] hover:bg-gray-100 sm:gap-3 sm:px-4 sm:py-6"
      >
        {isUploading ? (
          <span className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">جاري رفع الصور...</span>
        ) : (
          <>
            <span className="text-center text-xs font-medium text-[color:var(--color-foreground)] sm:text-sm">
              اسحب الصور هنا أو انقر للاختيار
            </span>
            <span className="text-[10px] text-[color:var(--color-foreground-muted)] sm:text-xs">
              PNG, JPEG, WebP, GIF (≤ 5MB)
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={onFileInputChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {images
            .filter((img) => img.url) // Only show images with a URL
            .map((img, idx) => (
            <div key={img.publicId || img.url || idx} className="relative rounded-xl border p-1.5 sm:p-2">
              <div className="relative h-24 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url!} alt={`صورة ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
              <div className="mt-1.5 flex flex-col gap-1.5 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  className={`min-h-[36px] rounded px-2 py-1.5 text-[10px] transition sm:min-h-0 sm:py-1 sm:text-xs ${
                    img.isPrimary
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 active:bg-gray-200"
                  }`}
                >
                  {img.isPrimary ? "الأساسية" : "تعيين كصورة أساسية"}
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="min-h-[36px] rounded bg-red-100 px-2 py-1.5 text-[10px] text-red-700 transition active:bg-red-200 sm:min-h-0 sm:py-1 sm:text-xs"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



