import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dbConnect: vi.fn(),
  hashPassword: vi.fn(),
  userModel: {
    create: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("@/lib/dbConnect", () => ({
  dbConnect: mocks.dbConnect,
}));

vi.mock("@/lib/utils/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("@/lib/models/User", () => ({
  UserModel: mocks.userModel,
}));

import {
  createUser,
  listAllUsers,
  updateUser,
} from "@/lib/services/userService";

const dbConnectMock = mocks.dbConnect;
const hashPasswordMock = mocks.hashPassword;
const userModelMock = mocks.userModel;

function createQueryChain(returnValue: any) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

function createUpdateChain(returnValue: any) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.dbConnect.mockReset();
  mocks.hashPassword.mockReset();
  Object.values(mocks.userModel).forEach((fn) => fn.mockReset());
});

describe("userService", () => {
  describe("createUser", () => {
    it("hashes password, enforces admin role, and trims phone", async () => {
      hashPasswordMock.mockResolvedValue("hashed-secret");
      const savedUser = {
        _id: { toString: () => "abc123" },
        name: "Test Admin",
        email: "admin@koutob.com",
        role: "admin",
        isActive: true,
        phone: "12345",
        password: "hashed-secret",
        toObject() {
          return this;
        },
      };
      userModelMock.create.mockResolvedValue(savedUser);

      const result = await createUser({
        name: "Test Admin",
        email: "ADMIN@KOUTOB.COM",
        password: "plainpw",
        phone: " 12345 ",
        isActive: false,
      } as any);

      expect(dbConnectMock).toHaveBeenCalled();
      expect(hashPasswordMock).toHaveBeenCalledWith("plainpw");
      expect(userModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "admin@koutob.com",
          password: "hashed-secret",
          role: "admin",
          isActive: false,
          phone: "12345",
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          email: "admin@koutob.com",
          role: "admin",
          isActive: true,
        }),
      );
      expect((result as any).password).toBeUndefined();
    });

    it("omits phone field when empty", async () => {
      hashPasswordMock.mockResolvedValue("hashed-secret");
      const savedUser = {
        _id: { toString: () => "abc123" },
        name: "Test Admin",
        email: "admin@koutob.com",
        role: "admin",
        isActive: true,
        password: "hashed-secret",
        toObject() {
          return this;
        },
      };
      userModelMock.create.mockResolvedValue(savedUser);

      await createUser({
        name: "No Phone",
        email: "example@test.com",
        password: "plainpw",
        phone: "   ",
      } as any);

      const args = userModelMock.create.mock.calls[0][0];
      expect("phone" in args).toBe(false);
    });
  });

  describe("listAllUsers", () => {
    it("normalizes ids and default isActive", async () => {
      const leanResult = [
        {
          _id: { toString: () => "id-1" },
          name: "Admin",
          email: "admin@test.com",
          role: "admin",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-02T00:00:00.000Z"),
        },
      ];
      userModelMock.find.mockReturnValue(createQueryChain(leanResult));

      const result = await listAllUsers();

      expect(userModelMock.find).toHaveBeenCalledWith({});
      expect(result).toEqual([
        expect.objectContaining({
          _id: "id-1",
          isActive: true,
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        }),
      ]);
    });
  });

  describe("updateUser", () => {
    it("hashes password and lowercases email when provided", async () => {
      hashPasswordMock.mockResolvedValue("new-hash");
      const leanResult = {
        _id: { toString: () => "user-1" },
        email: "updated@test.com",
        role: "admin",
        createdAt: new Date("2025-02-01T00:00:00.000Z"),
        updatedAt: new Date("2025-02-02T00:00:00.000Z"),
      };
      userModelMock.findByIdAndUpdate.mockReturnValue(createUpdateChain(leanResult));

      const payload = {
        email: "UPDATED@TEST.COM",
        password: "newpass",
        phone: " 5555 ",
      } as any;

      const result = await updateUser("user-1", payload);

      expect(hashPasswordMock).toHaveBeenCalledWith("newpass");
      expect(userModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          $set: expect.objectContaining({
            email: "updated@test.com",
            password: "new-hash",
            phone: "5555",
          }),
        }),
        { new: true, runValidators: true },
      );
      expect(result).toEqual(
        expect.objectContaining({
          _id: "user-1",
          email: "updated@test.com",
        }),
      );
    });
  });
});
