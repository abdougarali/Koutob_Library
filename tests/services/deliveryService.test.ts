import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dbConnect: vi.fn(),
  deliveryPartnerModel: {
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/dbConnect", () => ({
  dbConnect: mocks.dbConnect,
}));

vi.mock("@/lib/models/DeliveryPartner", () => ({
  DeliveryPartnerModel: mocks.deliveryPartnerModel,
}));

import {
  listDeliveryPartners,
  getAllDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
} from "@/lib/services/deliveryService";

const dbConnectMock = mocks.dbConnect;
const deliveryPartnerModelMock = mocks.deliveryPartnerModel;

function createQueryChain(returnValue: any) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.dbConnect.mockReset();
  Object.values(mocks.deliveryPartnerModel).forEach((fn) => {
    if (typeof fn === "function") {
      fn.mockReset();
    }
  });
});

describe("deliveryService", () => {
  describe("listDeliveryPartners", () => {
    it("returns delivery partners with normalized data", async () => {
      const mockPartners = [
        {
          _id: { toString: () => "partner1" },
          name: "Test Partner",
          contactName: "John Doe",
          contactPhone: "12345678",
          contactEmail: "test@example.com",
          coverageZones: ["Zone 1"],
          deliveryFees: 15,
          isActive: true,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-02"),
        },
      ];
      const chain = createQueryChain(mockPartners);
      deliveryPartnerModelMock.find.mockReturnValue(chain);

      const result = await listDeliveryPartners();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(deliveryPartnerModelMock.find).toHaveBeenCalledWith({});
      expect(result).toEqual([
        {
          _id: "partner1",
          name: "Test Partner",
          contactName: "John Doe",
          contactPhone: "12345678",
          contactEmail: "test@example.com",
          coverageZones: ["Zone 1"],
          deliveryFees: 15,
          isActive: true,
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date("2025-01-02"),
        },
      ]);
    });

    it("converts deliveryFees to number if missing", async () => {
      const mockPartners = [
        {
          _id: { toString: () => "partner1" },
          name: "Test Partner",
          deliveryFees: undefined,
          isActive: true,
        },
      ];
      const chain = createQueryChain(mockPartners);
      deliveryPartnerModelMock.find.mockReturnValue(chain);

      const result = await listDeliveryPartners();

      expect(result[0].deliveryFees).toBe(0);
    });

    it("handles string deliveryFees", async () => {
      const mockPartners = [
        {
          _id: { toString: () => "partner1" },
          name: "Test Partner",
          deliveryFees: "25",
          isActive: true,
        },
      ];
      const chain = createQueryChain(mockPartners);
      deliveryPartnerModelMock.find.mockReturnValue(chain);

      const result = await listDeliveryPartners();

      expect(result[0].deliveryFees).toBe(25);
    });

    it("applies filters", async () => {
      const mockPartners = [];
      const chain = createQueryChain(mockPartners);
      deliveryPartnerModelMock.find.mockReturnValue(chain);

      await listDeliveryPartners({ isActive: true });

      expect(deliveryPartnerModelMock.find).toHaveBeenCalledWith({ isActive: true });
    });

    it("defaults isActive to true if missing", async () => {
      const mockPartners = [
        {
          _id: { toString: () => "partner1" },
          name: "Test Partner",
          isActive: undefined,
        },
      ];
      const chain = createQueryChain(mockPartners);
      deliveryPartnerModelMock.find.mockReturnValue(chain);

      const result = await listDeliveryPartners();

      expect(result[0].isActive).toBe(true);
    });
  });

  describe("getAllDeliveryPartners", () => {
    it("returns all partners with ISO date strings", async () => {
      const mockPartners = [
        {
          _id: { toString: () => "partner1" },
          name: "Test Partner",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-02T00:00:00.000Z"),
        },
      ];
      const chain = createQueryChain(mockPartners);
      deliveryPartnerModelMock.find.mockReturnValue(chain);

      const result = await getAllDeliveryPartners();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(deliveryPartnerModelMock.find).toHaveBeenCalledWith({});
      expect(result).toEqual([
        {
          _id: "partner1",
          name: "Test Partner",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        },
      ]);
    });
  });

  describe("createDeliveryPartner", () => {
    it("creates a new delivery partner", async () => {
      const mockPartner = {
        _id: "partner1",
        name: "New Partner",
        deliveryFees: 20,
      };
      deliveryPartnerModelMock.create.mockResolvedValue(mockPartner);

      const payload = {
        name: "New Partner",
        contactName: "John Doe",
        contactPhone: "12345678",
        deliveryFees: 20,
        isActive: true,
      };

      const result = await createDeliveryPartner(payload);

      expect(dbConnectMock).toHaveBeenCalled();
      expect(deliveryPartnerModelMock.create).toHaveBeenCalled();
      expect(result).toEqual(mockPartner);
    });
  });

  describe("updateDeliveryPartner", () => {
    it("updates delivery partner by id", async () => {
      const mockPartner = {
        _id: "partner1",
        name: "Updated Partner",
        deliveryFees: 25,
      };
      const chain = {
        lean: vi.fn().mockResolvedValue(mockPartner),
      };
      deliveryPartnerModelMock.findByIdAndUpdate.mockReturnValue(chain);

      const payload = {
        name: "Updated Partner",
        deliveryFees: 25,
      };

      const result = await updateDeliveryPartner("partner1", payload);

      expect(dbConnectMock).toHaveBeenCalled();
      expect(deliveryPartnerModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        "partner1",
        expect.any(Object),
        { new: true },
      );
      expect(result).toEqual(mockPartner);
    });

    it("returns null if partner not found", async () => {
      const chain = {
        lean: vi.fn().mockResolvedValue(null),
      };
      deliveryPartnerModelMock.findByIdAndUpdate.mockReturnValue(chain);

      const result = await updateDeliveryPartner("non-existent", { name: "Test" });

      expect(result).toBeNull();
    });
  });

  describe("deleteDeliveryPartner", () => {
    it("deletes delivery partner by id", async () => {
      const mockPartner = {
        _id: "partner1",
        name: "Deleted Partner",
      };
      deliveryPartnerModelMock.findByIdAndDelete.mockResolvedValue(mockPartner);

      const result = await deleteDeliveryPartner("partner1");

      expect(dbConnectMock).toHaveBeenCalled();
      expect(deliveryPartnerModelMock.findByIdAndDelete).toHaveBeenCalledWith("partner1");
      expect(result).toEqual(mockPartner);
    });

    it("returns null if partner not found", async () => {
      deliveryPartnerModelMock.findByIdAndDelete.mockResolvedValue(null);

      const result = await deleteDeliveryPartner("non-existent");

      expect(result).toBeNull();
    });
  });
});

