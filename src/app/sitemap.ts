import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/dbConnect";
import { BookModel } from "@/lib/models/Book";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/books`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/cart`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/dashboard`, changeFrequency: "weekly", priority: 0.4 },
  ];

  try {
    await dbConnect();
    const books = await BookModel.find({ status: "published" })
      .select("slug updatedAt")
      .lean();
    const bookRoutes: MetadataRoute.Sitemap = books.map((b: any) => ({
      url: `${base}/books/${encodeURIComponent(b.slug)}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...bookRoutes];
  } catch {
    return staticRoutes;
  }
}










