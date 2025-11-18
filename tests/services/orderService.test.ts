import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dbConnect: vi.fn(),
  generateOrderCode: vi.fn(),
  orderModel: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
  bookModel: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
  deliveryPartnerModel: {
    findById: vi.fn(),
  },
}));

vi.mock("@/lib/dbConnect", () => ({
  dbConnect: mocks.dbConnect,
}));

vi.mock("@/lib/utils/generateOrderCode", () => ({
  generateOrderCode: mocks.generateOrderCode,
}));

vi.mock("@/lib/models/Order", () => ({
  OrderModel: mocks.orderModel,
}));

vi.mock("@/lib/models/Book", () => ({
  BookModel: mocks.bookModel,
}));

vi.mock("@/lib/models/DeliveryPartner", () => ({
  DeliveryPartnerModel: mocks.deliveryPartnerModel,
}));

import {
  createOrder,
  getAllOrders,
  getOrderByCode,
  updateOrderStatus,
  getCustomerOrders,
} from "@/lib/services/orderService";

const dbConnectMock = mocks.dbConnect;
const generateOrderCodeMock = mocks.generateOrderCode;
const orderModelMock = mocks.orderModel;
const bookModelMock = mocks.bookModel;
const deliveryPartnerModelMock = mocks.deliveryPartnerModel;

function createQueryChain(returnValue: any) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

function createUpdateChain(returnValue: any) {
  const chain = {
    populate: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.dbConnect.mockReset();
  mocks.generateOrderCode.mockReset();
  Object.values(mocks.orderModel).forEach((fn) => {
    if (typeof fn === "function") {
      fn.mockReset();
    }
  });
  Object.values(mocks.bookModel).forEach((fn) => {
    if (typeof fn === "function") {
      fn.mockReset();
    }
  });
  Object.values(mocks.deliveryPartnerModel).forEach((fn) => {
    if (typeof fn === "function") {
      fn.mockReset();
    }
  });
});

describe("orderService", () => {
  describe("createOrder", () => {
    it("creates order with correct subtotal and total", async () => {
      generateOrderCodeMock.mockReturnValue("ORD-12345");
      
      const mockBook = {
        _id: { toString: () => "book1" },
        title: "Test Book",
      };
      const findOneChain = {
        lean: vi.fn().mockResolvedValue(mockBook),
      };
      bookModelMock.findOne.mockReturnValue(findOneChain);
      
      const mockOrder = {
        _id: "order1",
        orderCode: "ORD-12345",
        total: 35,
      };
      orderModelMock.create.mockResolvedValue(mockOrder);

      const payload = {
        customerName: "Test Customer",
        phone: "12345678",
        city: "Test City",
        address: "Test Address",
        items: [
          { bookId: "book-slug", title: "Book 1", price: 10, quantity: 2 },
          { bookId: "book-slug-2", title: "Book 2", price: 5, quantity: 1 },
        ],
        deliveryFees: 0,
      };

      const result = await createOrder(payload);

      expect(dbConnectMock).toHaveBeenCalled();
      expect(orderModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderCode: "ORD-12345",
          subtotal: 25, // (10 * 2) + (5 * 1)
          deliveryFees: 0,
          total: 25,
          customerName: "Test Customer",
          phone: "12345678",
          city: "Test City",
          address: "Test Address",
        }),
      );
      expect(result).toEqual(mockOrder);
    });

    it("uses delivery fees from partner if provided", async () => {
      generateOrderCodeMock.mockReturnValue("ORD-12345");
      
      const mockBook = {
        _id: { toString: () => "book1" },
      };
      const findOneChain = {
        lean: vi.fn().mockResolvedValue(mockBook),
      };
      bookModelMock.findOne.mockReturnValue(findOneChain);
      
      const mockPartner = {
        _id: "partner1",
        deliveryFees: 15,
      };
      const findByIdChain = {
        lean: vi.fn().mockResolvedValue(mockPartner),
      };
      deliveryPartnerModelMock.findById.mockReturnValue(findByIdChain);
      
      const mockOrder = {
        _id: "order1",
        orderCode: "ORD-12345",
        total: 35,
      };
      orderModelMock.create.mockResolvedValue(mockOrder);

      const payload = {
        customerName: "Test Customer",
        phone: "12345678",
        city: "Test City",
        address: "Test Address",
        items: [{ bookId: "book-slug", title: "Book 1", price: 10, quantity: 2 }],
        deliveryPartner: "partner1",
        deliveryFees: 10, // This should be overridden by partner's fees
      };

      const result = await createOrder(payload);

      expect(deliveryPartnerModelMock.findById).toHaveBeenCalledWith("partner1");
      expect(orderModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryFees: 15, // From partner
          total: 35, // 20 + 15
          deliveryPartner: "partner1",
        }),
      );
      expect(result).toEqual(mockOrder);
    });

    it("throws error if book not found", async () => {
      const findByIdChain = {
        lean: vi.fn().mockResolvedValue(null),
      };
      bookModelMock.findById.mockReturnValue(findByIdChain);
      const findOneChain = {
        lean: vi.fn().mockResolvedValue(null),
      };
      bookModelMock.findOne.mockReturnValue(findOneChain);

      const payload = {
        customerName: "Test Customer",
        phone: "12345678",
        city: "Test City",
        address: "Test Address",
        items: [{ bookId: "non-existent", title: "Book 1", price: 10, quantity: 1 }],
        deliveryFees: 0,
      };

      await expect(createOrder(payload)).rejects.toThrow("الكتاب غير موجود: non-existent");
    });

    it("finds book by ObjectId if valid format", async () => {
      generateOrderCodeMock.mockReturnValue("ORD-12345");
      
      const mockBook = {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
      };
      const findByIdChain = {
        lean: vi.fn().mockResolvedValue(mockBook),
      };
      bookModelMock.findById.mockReturnValue(findByIdChain);
      
      const mockOrder = { _id: "order1" };
      orderModelMock.create.mockResolvedValue(mockOrder);

      const payload = {
        customerName: "Test Customer",
        phone: "12345678",
        city: "Test City",
        address: "Test Address",
        items: [{ bookId: "507f1f77bcf86cd799439011", title: "Book 1", price: 10, quantity: 1 }],
        deliveryFees: 0,
      };

      await createOrder(payload);

      expect(bookModelMock.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(bookModelMock.findOne).not.toHaveBeenCalled();
    });

    it("creates order with status history", async () => {
      generateOrderCodeMock.mockReturnValue("ORD-12345");
      
      const mockBook = {
        _id: { toString: () => "book1" },
      };
      const findOneChain = {
        lean: vi.fn().mockResolvedValue(mockBook),
      };
      bookModelMock.findOne.mockReturnValue(findOneChain);
      
      const mockOrder = { _id: "order1" };
      orderModelMock.create.mockResolvedValue(mockOrder);

      const payload = {
        customerName: "Test Customer",
        phone: "12345678",
        city: "Test City",
        address: "Test Address",
        items: [{ bookId: "book-slug", title: "Book 1", price: 10, quantity: 1 }],
        deliveryFees: 0,
      };

      await createOrder(payload);

      expect(orderModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          statusHistory: [
            expect.objectContaining({
              status: "قيد المعالجة",
            }),
          ],
        }),
      );
    });
  });

  describe("getAllOrders", () => {
    it("returns all orders with normalized data", async () => {
      const mockOrders = [
        {
          _id: { toString: () => "order1" },
          orderCode: "ORD-12345",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-02T00:00:00.000Z"),
          items: [{ book: { toString: () => "book1" } }],
          deliveryPartner: null,
          statusHistory: [
            {
              updatedAt: new Date("2025-01-01T00:00:00.000Z"),
              updatedBy: { toString: () => "user1" },
            },
          ],
        },
      ];
      const chain = createQueryChain(mockOrders);
      orderModelMock.find.mockReturnValue(chain);

      const result = await getAllOrders();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(orderModelMock.find).toHaveBeenCalledWith({});
      expect(result[0]).toEqual(
        expect.objectContaining({
          _id: "order1",
          orderCode: "ORD-12345",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        }),
      );
    });
  });

  describe("getOrderByCode", () => {
    it("returns order by code", async () => {
      const mockOrder = {
        _id: { toString: () => "order1" },
        orderCode: "ORD-12345",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        deliveryPartner: null,
        items: [],
        statusHistory: [],
      };
      const chain = createQueryChain(mockOrder);
      orderModelMock.findOne.mockReturnValue(chain);

      const result = await getOrderByCode("ORD-12345");

      expect(dbConnectMock).toHaveBeenCalled();
      expect(orderModelMock.findOne).toHaveBeenCalledWith({ orderCode: "ORD-12345" });
      expect(result).toEqual(
        expect.objectContaining({
          _id: "order1",
          orderCode: "ORD-12345",
        }),
      );
    });

    it("returns null if order not found", async () => {
      const chain = createQueryChain(null);
      orderModelMock.findOne.mockReturnValue(chain);

      const result = await getOrderByCode("NON-EXISTENT");

      expect(result).toBeNull();
    });
  });

  describe("updateOrderStatus", () => {
    it("updates order status and adds to history", async () => {
      const mockOrder = {
        _id: { toString: () => "order1" },
        orderCode: "ORD-12345",
        status: "تم الإرسال",
      };
      const chain = createUpdateChain(mockOrder);
      orderModelMock.findOneAndUpdate.mockReturnValue(chain);

      const result = await updateOrderStatus("ORD-12345", "تم الإرسال", {
        note: "Shipped",
        updatedBy: "admin1",
      });

      expect(dbConnectMock).toHaveBeenCalled();
      expect(orderModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { orderCode: "ORD-12345" },
        expect.objectContaining({
          status: "تم الإرسال",
          $push: {
            statusHistory: expect.objectContaining({
              status: "تم الإرسال",
              note: "Shipped",
              updatedBy: "admin1",
            }),
          },
        }),
        { new: true },
      );
      expect(result).toEqual(
        expect.objectContaining({
          _id: "order1",
          orderCode: "ORD-12345",
        }),
      );
    });

    it("sets deliveredAt when status is تم التسليم", async () => {
      const mockOrder = {
        _id: { toString: () => "order1" },
        orderCode: "ORD-12345",
        status: "تم التسليم",
      };
      const chain = createUpdateChain(mockOrder);
      orderModelMock.findOneAndUpdate.mockReturnValue(chain);

      await updateOrderStatus("ORD-12345", "تم التسليم");

      expect(orderModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { orderCode: "ORD-12345" },
        expect.objectContaining({
          deliveredAt: expect.any(Date),
        }),
        { new: true },
      );
    });

    it("returns null if order not found", async () => {
      const chain = createUpdateChain(null);
      orderModelMock.findOneAndUpdate.mockReturnValue(chain);

      const result = await updateOrderStatus("NON-EXISTENT", "قيد المعالجة");

      expect(result).toBeNull();
    });
  });

  describe("getCustomerOrders", () => {
    it("returns orders by email", async () => {
      const mockOrders = [
        {
          _id: { toString: () => "order1" },
          orderCode: "ORD-12345",
          email: "test@example.com",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          deliveryPartner: null,
          items: [],
          statusHistory: [],
        },
      ];
      const chain = createQueryChain(mockOrders);
      orderModelMock.find.mockReturnValue(chain);

      const result = await getCustomerOrders("TEST@EXAMPLE.COM", undefined);

      expect(orderModelMock.find).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          email: "test@example.com",
        }),
      );
    });

    it("returns orders by phone", async () => {
      const mockOrders = [
        {
          _id: { toString: () => "order1" },
          orderCode: "ORD-12345",
          phone: "12345678",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          deliveryPartner: null,
          items: [],
          statusHistory: [],
        },
      ];
      const chain = createQueryChain(mockOrders);
      orderModelMock.find.mockReturnValue(chain);

      const result = await getCustomerOrders(undefined, " 12345678 ");

      expect(orderModelMock.find).toHaveBeenCalledWith({
        phone: "12345678",
      });
      expect(result).toHaveLength(1);
    });

    it("returns orders by both email and phone", async () => {
      const mockOrders = [];
      const chain = createQueryChain(mockOrders);
      orderModelMock.find.mockReturnValue(chain);

      await getCustomerOrders("test@example.com", "12345678");

      expect(orderModelMock.find).toHaveBeenCalledWith({
        email: "test@example.com",
        phone: "12345678",
      });
    });

    it("returns empty array if neither email nor phone provided", async () => {
      const result = await getCustomerOrders(undefined, undefined);

      expect(orderModelMock.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

