import { FilterQuery } from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import { OrderModel, type OrderDocument } from "@/lib/models/Order";
import { orderInputSchema, type OrderInput } from "@/lib/validators/orderValidator";
import { generateOrderCode } from "@/lib/utils/generateOrderCode";
import { BookModel } from "@/lib/models/Book";
import { DeliveryPartnerModel } from "@/lib/models/DeliveryPartner";

export async function createOrder(payload: OrderInput) {
  const validated = orderInputSchema.parse(payload);

  const subtotal = validated.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  
  await dbConnect();
  
  // Get delivery fees from partner if provided, otherwise use provided value or default
  let deliveryFees = validated.deliveryFees ?? 0;
  let deliveryPartnerId = validated.deliveryPartner;
  
  if (deliveryPartnerId) {
    const partner = await DeliveryPartnerModel.findById(deliveryPartnerId).lean();
    if (partner && partner.deliveryFees !== undefined) {
      deliveryFees = partner.deliveryFees;
    }
  }
  
  const discountCode = validated.discountCode?.trim();
  const rawDiscountAmount = validated.discountAmount ?? 0;
  const normalizedDiscountAmount =
    discountCode && rawDiscountAmount > 0
      ? Math.min(rawDiscountAmount, subtotal)
      : 0;

  const total = Math.max(0, subtotal - normalizedDiscountAmount) + deliveryFees;

  // البحث عن الكتب باستخدام bookId (slug) والحصول على _id
  // والتحقق من توفر المخزون
  const bookItems = await Promise.all(
    validated.items.map(async (item) => {
      // bookId قد يكون slug أو ObjectId
      let book;
      
      // محاولة البحث كـ ObjectId أولاً
      if (item.bookId.match(/^[0-9a-fA-F]{24}$/)) {
        book = await BookModel.findById(item.bookId);
      }
      
      // إذا لم يُعثر عليه، البحث كـ slug
      if (!book) {
        book = await BookModel.findOne({ slug: item.bookId });
      }
      
      if (!book) {
        throw new Error(`الكتاب غير موجود: ${item.bookId}`);
      }

      // التحقق من توفر المخزون
      const currentStock = book.stock ?? 0;
      if (currentStock < item.quantity) {
        throw new Error(
          `الكمية المطلوبة (${item.quantity}) غير متوفرة للكتاب "${item.title}". الكمية المتاحة: ${currentStock}`
        );
      }

      return {
        book: book._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        bookDocument: book, // Save book document for stock update
      };
    })
  );

  // Create order
  const order = await OrderModel.create({
    orderCode: generateOrderCode(),
    customerName: validated.customerName,
    phone: validated.phone,
    email: validated.email,
    city: validated.city,
    address: validated.address,
    notes: validated.notes,
    items: bookItems.map(({ bookDocument, ...item }) => item), // Remove bookDocument from items
    subtotal,
    deliveryFees,
    discountCode: discountCode || undefined,
    discountAmount: normalizedDiscountAmount,
    total,
    deliveryPartner: deliveryPartnerId || undefined,
    statusHistory: [
      {
        status: "قيد المعالجة",
        updatedAt: new Date(),
      },
    ],
  });

  // Reduce stock for each book
  await Promise.all(
    bookItems.map(async ({ bookDocument, quantity }) => {
      if (bookDocument) {
        const newStock = Math.max(0, (bookDocument.stock ?? 0) - quantity);
        await BookModel.findByIdAndUpdate(bookDocument._id, {
          stock: newStock,
        });
      }
    })
  );

  return order;
}

export async function listOrders(
  filters: FilterQuery<OrderDocument> = {},
  limit = 50,
) {
  await dbConnect();
  return OrderModel.find(filters)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getAllOrders() {
  await dbConnect();
  const orders = await OrderModel.find({})
    .populate("deliveryPartner", "name contactName contactPhone")
    .sort({ createdAt: -1 })
    .lean();

  return orders.map((order) => ({
    ...order,
    _id: order._id?.toString(),
    email: order.email ?? undefined, // Convert null to undefined
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    items: order.items?.map((item) => ({
      ...item,
      book: item.book?.toString() || null,
    })),
    deliveryPartner: order.deliveryPartner
      ? {
          _id:
            typeof order.deliveryPartner === "object" &&
            "_id" in order.deliveryPartner
              ? order.deliveryPartner._id?.toString() ?? undefined
              : undefined,
          name:
            typeof order.deliveryPartner === "object" &&
            "name" in order.deliveryPartner &&
            typeof order.deliveryPartner.name === "string"
              ? order.deliveryPartner.name
              : undefined,
        }
      : null,
    statusHistory: order.statusHistory?.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt?.toISOString(),
      updatedBy: entry.updatedBy?.toString(),
    })),
  }));
}

export async function getOrderByCode(orderCode: string) {
  await dbConnect();
  const order = await OrderModel.findOne({ orderCode })
    .populate("deliveryPartner", "name contactName contactPhone")
    .lean();

  if (!order) return null;

  return {
    ...order,
    _id: order._id?.toString(),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    items: order.items?.map((item) => ({
      ...item,
      book: item.book?.toString() || null,
    })),
    deliveryPartner: order.deliveryPartner
      ? {
          _id:
            typeof order.deliveryPartner === "object" &&
            "_id" in order.deliveryPartner
              ? order.deliveryPartner._id?.toString()
              : null,
          name:
            typeof order.deliveryPartner === "object" &&
            "name" in order.deliveryPartner
              ? order.deliveryPartner.name
              : null,
          contactName:
            typeof order.deliveryPartner === "object" &&
            "contactName" in order.deliveryPartner
              ? order.deliveryPartner.contactName
              : null,
          contactPhone:
            typeof order.deliveryPartner === "object" &&
            "contactPhone" in order.deliveryPartner
              ? order.deliveryPartner.contactPhone
              : null,
        }
      : null,
    statusHistory: order.statusHistory?.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt?.toISOString(),
      updatedBy: entry.updatedBy?.toString(),
    })),
  };
}

export async function updateOrderStatus(
  orderCode: string,
  status: OrderDocument["status"],
  options?: { note?: string; updatedBy?: string },
) {
  await dbConnect();
  const order = await OrderModel.findOneAndUpdate(
    { orderCode },
    {
      status,
      $push: {
        statusHistory: {
          status,
          note: options?.note,
          updatedBy: options?.updatedBy,
          updatedAt: new Date(),
        },
      },
      ...(status === "تم التسليم"
        ? { deliveredAt: new Date() }
        : status === "قيد المعالجة"
          ? { confirmedAt: new Date() }
          : {}),
    },
    { new: true },
  )
    .populate("deliveryPartner", "name contactName contactPhone")
    .lean();

  if (!order) return null;

  return {
    ...order,
    _id: order._id?.toString(),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    items: order.items?.map((item) => ({
      ...item,
      book: item.book?.toString() || null,
    })),
    deliveryPartner: order.deliveryPartner
      ? {
          _id:
            typeof order.deliveryPartner === "object" &&
            "_id" in order.deliveryPartner
              ? order.deliveryPartner._id?.toString()
              : null,
          name:
            typeof order.deliveryPartner === "object" &&
            "name" in order.deliveryPartner
              ? order.deliveryPartner.name
              : null,
          contactName:
            typeof order.deliveryPartner === "object" &&
            "contactName" in order.deliveryPartner
              ? order.deliveryPartner.contactName
              : null,
          contactPhone:
            typeof order.deliveryPartner === "object" &&
            "contactPhone" in order.deliveryPartner
              ? order.deliveryPartner.contactPhone
              : null,
        }
      : null,
    statusHistory: order.statusHistory?.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt?.toISOString(),
      updatedBy: entry.updatedBy?.toString(),
    })),
  };
}

export async function assignDeliveryPartner(
  orderCode: string,
  deliveryPartnerId: string | null,
) {
  await dbConnect();
  const order = await OrderModel.findOneAndUpdate(
    { orderCode },
    { deliveryPartner: deliveryPartnerId || null },
    { new: true },
  )
    .populate("deliveryPartner", "name contactName contactPhone")
    .lean();

  if (!order) return null;

  return {
    ...order,
    _id: order._id?.toString(),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    items: order.items?.map((item) => ({
      ...item,
      book: item.book?.toString() || null,
    })),
    deliveryPartner: order.deliveryPartner
      ? {
          _id:
            typeof order.deliveryPartner === "object" &&
            "_id" in order.deliveryPartner
              ? order.deliveryPartner._id?.toString()
              : null,
          name:
            typeof order.deliveryPartner === "object" &&
            "name" in order.deliveryPartner
              ? order.deliveryPartner.name
              : null,
          contactName:
            typeof order.deliveryPartner === "object" &&
            "contactName" in order.deliveryPartner
              ? order.deliveryPartner.contactName
              : null,
          contactPhone:
            typeof order.deliveryPartner === "object" &&
            "contactPhone" in order.deliveryPartner
              ? order.deliveryPartner.contactPhone
              : null,
        }
      : null,
    statusHistory: order.statusHistory?.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt?.toISOString(),
      updatedBy: entry.updatedBy?.toString(),
    })),
  };
}

/**
 * Get orders for a customer by email or phone
 */
export async function getCustomerOrders(email?: string, phone?: string) {
  await dbConnect();
  
  const filters: FilterQuery<OrderDocument> = {};
  if (email) {
    filters.email = email.toLowerCase().trim();
  }
  if (phone) {
    filters.phone = phone.trim();
  }
  
  // If neither email nor phone provided, return empty array
  if (!email && !phone) {
    return [];
  }

  const orders = await OrderModel.find(filters)
    .populate("deliveryPartner", "name contactName contactPhone")
    .sort({ createdAt: -1 })
    .lean();

  return orders.map((order) => ({
    ...order,
    _id: order._id?.toString(),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    items: order.items?.map((item) => ({
      ...item,
      book: item.book?.toString() || null,
    })),
    deliveryPartner: order.deliveryPartner
      ? {
          _id:
            typeof order.deliveryPartner === "object" &&
            "_id" in order.deliveryPartner
              ? order.deliveryPartner._id?.toString()
              : null,
          name:
            typeof order.deliveryPartner === "object" &&
            "name" in order.deliveryPartner
              ? order.deliveryPartner.name
              : null,
          contactName:
            typeof order.deliveryPartner === "object" &&
            "contactName" in order.deliveryPartner
              ? order.deliveryPartner.contactName
              : null,
          contactPhone:
            typeof order.deliveryPartner === "object" &&
            "contactPhone" in order.deliveryPartner
              ? order.deliveryPartner.contactPhone
              : null,
        }
      : null,
    statusHistory: order.statusHistory?.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt?.toISOString(),
      updatedBy: entry.updatedBy?.toString(),
    })),
  }));
}

