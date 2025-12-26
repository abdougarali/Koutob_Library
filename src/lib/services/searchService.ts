import { dbConnect } from "@/lib/dbConnect";
import { SearchLogModel } from "@/lib/models/SearchLog";

/**
 * Log a search query
 */
export async function logSearch(
  query: string,
  userId?: string,
  sessionId?: string,
  clickedBookId?: string,
) {
  await dbConnect();
  
  if (!query || query.trim().length < 2) {
    return;
  }
  
  try {
    await SearchLogModel.create({
      user: userId || undefined,
      query: query.trim(),
      sessionId: sessionId || undefined,
      clickedBook: clickedBookId || undefined,
    });
  } catch (error) {
    // Silently fail - logging shouldn't break the app
    console.error("Failed to log search:", error);
  }
}

/**
 * Get recent searches for a user (or session)
 */
export async function getRecentSearches(
  userId?: string,
  sessionId?: string,
  limit: number = 10,
) {
  await dbConnect();
  
  const query: any = {};
  
  if (userId) {
    query.user = userId;
  } else if (sessionId) {
    query.sessionId = sessionId;
  } else {
    return [];
  }
  
  const searches = await SearchLogModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("query createdAt")
    .lean();
  
  // Remove duplicates, keeping the most recent
  const uniqueQueries = new Map<string, string>();
  for (const search of searches) {
    const normalizedQuery = search.query.trim().toLowerCase();
    if (!uniqueQueries.has(normalizedQuery)) {
      uniqueQueries.set(normalizedQuery, search.query);
    }
  }
  
  return Array.from(uniqueQueries.values());
}

/**
 * Get popular searches (aggregated from search logs)
 */
export async function getPopularSearches(limit: number = 10, days: number = 30) {
  await dbConnect();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const popularSearches = await SearchLogModel.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate },
        query: { $exists: true, $ne: "" },
      },
    },
    {
      $group: {
        _id: { $toLower: "$query" },
        query: { $first: "$query" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        query: 1,
        count: 1,
      },
    },
  ]);
  
  return popularSearches.map((item) => item.query);
}



















