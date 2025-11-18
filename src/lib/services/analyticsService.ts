import { dbConnect } from "@/lib/dbConnect";
import { OrderModel } from "@/lib/models/Order";
import { BookModel } from "@/lib/models/Book";
import { UserModel } from "@/lib/models/User";
import { LOW_STOCK_THRESHOLD } from "@/lib/services/stockAlertService";

export interface SalesStats {
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  averageOrderValue: number;
}

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  thisWeekOrders: number;
  thisMonthOrders: number;
  ordersByStatus: {
    "قيد المعالجة": number;
    "تم الإرسال": number;
    "تم التسليم": number;
    "تم الإلغاء": number;
  };
  recentOrders: Array<{
    orderCode: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

export interface BookStats {
  totalBooks: number;
  publishedBooks: number;
  lowStockBooks: number;
  outOfStockBooks: number;
  topSellingBooks: Array<{
    title: string;
    slug: string;
    totalSold: number;
    revenue: number;
  }>;
  booksByCategory: Array<{
    category: string;
    count: number;
  }>;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number; // Customers who placed orders
}

export interface AnalyticsData {
  sales: SalesStats;
  orders: OrderStats;
  books: BookStats;
  customers: CustomerStats;
}

/**
 * Calculate sales statistics
 */
export async function getSalesStats(): Promise<SalesStats> {
  await dbConnect();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all delivered orders for total revenue
  const allDeliveredOrders = await OrderModel.find({
    status: "تم التسليم",
  }).lean();

  const totalRevenue = allDeliveredOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  // Today's revenue
  const todayOrders = await OrderModel.find({
    status: "تم التسليم",
    createdAt: { $gte: todayStart },
  }).lean();

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  // This week's revenue
  const weekOrders = await OrderModel.find({
    status: "تم التسليم",
    createdAt: { $gte: weekStart },
  }).lean();

  const thisWeekRevenue = weekOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  // This month's revenue
  const monthOrders = await OrderModel.find({
    status: "تم التسليم",
    createdAt: { $gte: monthStart },
  }).lean();

  const thisMonthRevenue = monthOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  // Average order value
  const averageOrderValue =
    allDeliveredOrders.length > 0
      ? totalRevenue / allDeliveredOrders.length
      : 0;

  return {
    totalRevenue,
    todayRevenue,
    thisWeekRevenue,
    thisMonthRevenue,
    averageOrderValue,
  };
}

/**
 * Calculate order statistics
 */
export async function getOrderStats(): Promise<OrderStats> {
  await dbConnect();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total orders
  const totalOrders = await OrderModel.countDocuments({});

  // Today's orders
  const todayOrders = await OrderModel.countDocuments({
    createdAt: { $gte: todayStart },
  });

  // This week's orders
  const thisWeekOrders = await OrderModel.countDocuments({
    createdAt: { $gte: weekStart },
  });

  // This month's orders
  const thisMonthOrders = await OrderModel.countDocuments({
    createdAt: { $gte: monthStart },
  });

  // Orders by status
  const ordersByStatus = {
    "قيد المعالجة": await OrderModel.countDocuments({
      status: "قيد المعالجة",
    }),
    "تم الإرسال": await OrderModel.countDocuments({ status: "تم الإرسال" }),
    "تم التسليم": await OrderModel.countDocuments({ status: "تم التسليم" }),
    "تم الإلغاء": await OrderModel.countDocuments({ status: "تم الإلغاء" }),
  };

  // Recent orders (last 10)
  const recentOrdersData = await OrderModel.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderCode customerName total status createdAt")
    .lean();

  const recentOrders = recentOrdersData.map((order) => ({
    orderCode: order.orderCode,
    customerName: order.customerName,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
  }));

  return {
    totalOrders,
    todayOrders,
    thisWeekOrders,
    thisMonthOrders,
    ordersByStatus,
    recentOrders,
  };
}

/**
 * Calculate book statistics
 */
export async function getBookStats(): Promise<BookStats> {
  await dbConnect();

  // Total books
  const totalBooks = await BookModel.countDocuments({});

  // Published books
  const publishedBooks = await BookModel.countDocuments({
    status: "published",
  });

  // Low stock books (stock <= threshold)
  const lowStockBooks = await BookModel.countDocuments({
    stock: { $lte: LOW_STOCK_THRESHOLD, $gt: 0 },
    status: "published",
  });

  // Out of stock books
  const outOfStockBooks = await BookModel.countDocuments({
    $or: [{ stock: { $lte: 0 } }, { stock: { $exists: false } }],
    status: "published",
  });

  // Top selling books (based on orders)
  // Use aggregation to count book sales
  const bookSalesAggregation = await OrderModel.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.book",
        totalSold: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  // Get book IDs
  const topSellingBookIds = bookSalesAggregation
    .map((item) => item._id)
    .filter((id) => id != null);

  // Get book details
  const topSellingBooksData = await BookModel.find({
    _id: { $in: topSellingBookIds },
  })
    .select("title slug")
    .lean();

  // Map sales data to books
  const topSellingBooks = bookSalesAggregation
    .map((salesData) => {
      const book = topSellingBooksData.find(
        (b) => b._id?.toString() === salesData._id?.toString()
      );
      if (book && salesData._id) {
        return {
          title: book.title,
          slug: book.slug,
          totalSold: salesData.totalSold || 0,
          revenue: salesData.revenue || 0,
        };
      }
      return null;
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  // Books by category
  const booksByCategoryData = await BookModel.aggregate([
    {
      $match: { status: "published" },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const booksByCategory = booksByCategoryData.map((item) => ({
    category: item._id || "غير مصنف",
    count: item.count,
  }));

  return {
    totalBooks,
    publishedBooks,
    lowStockBooks,
    outOfStockBooks,
    topSellingBooks,
    booksByCategory,
  };
}

/**
 * Calculate customer statistics
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  await dbConnect();

  // Total customers
  const totalCustomers = await UserModel.countDocuments({
    role: "customer",
  });

  // New customers this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const newCustomersThisMonth = await UserModel.countDocuments({
    role: "customer",
    createdAt: { $gte: monthStart },
  });

  // Active customers (customers who placed at least one order)
  const customersWithOrders = await OrderModel.distinct("email", {
    email: { $exists: true, $ne: "" },
  });

  const activeCustomers = customersWithOrders.length;

  return {
    totalCustomers,
    newCustomersThisMonth,
    activeCustomers,
  };
}

/**
 * Get all analytics data
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [sales, orders, books, customers] = await Promise.all([
    getSalesStats(),
    getOrderStats(),
    getBookStats(),
    getCustomerStats(),
  ]);

  return {
    sales,
    orders,
    books,
    customers,
  };
}

