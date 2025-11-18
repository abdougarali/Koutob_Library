"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

type GalleryImage = {
  url: string;
  isPrimary?: boolean;
};

type BookImageGalleryProps = {
  title: string;
  images?: GalleryImage[];
  fallbackImageUrl: string;
};

function transformCloudinaryUrl(url: string, transformation: string) {
  if (!url.includes("res.cloudinary.com")) return url;
  // Insert transformation after /upload/
  return url.replace("/upload/", `/upload/${transformation}/`);
}

export function BookImageGallery({
  title,
  images = [],
  fallbackImageUrl,
}: BookImageGalleryProps) {
  const ordered = useMemo(() => {
    if (!images || images.length === 0) return [];
    const primary = images.find((i) => i.isPrimary && i.url);
    const rest = images.filter((i) => !i.isPrimary && i.url);
    return primary ? [primary, ...rest] : rest;
  }, [images]);

  const [activeIdx, setActiveIdx] = useState(0);

  const mainUrl =
    ordered[activeIdx]?.url ||
    ordered[0]?.url ||
    fallbackImageUrl;

  const mainTransformed = transformCloudinaryUrl(
    mainUrl,
    "c_fill,f_auto,q_auto:good,w_900,h_900"
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[420px] w-full overflow-hidden rounded-3xl bg-[color:var(--color-surface-muted)] shadow-lg">
        <Image
          src={mainTransformed}
          alt={title}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {ordered.map((img, idx) => {
            const thumbUrl = transformCloudinaryUrl(
              img.url,
              "c_fill,f_auto,q_auto:eco,w_180,h_180"
            );
            const isActive = idx === activeIdx;
            return (
              <button
                type="button"
                key={img.url + idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-20 w-full overflow-hidden rounded-xl border transition ${
                  isActive ? "border-[color:var(--color-primary)]" : "border-gray-200"
                }`}
                aria-label={`عرض الصورة ${idx + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt={`${title} - ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}










