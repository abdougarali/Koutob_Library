import { describe, it, expect, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dbConnect: vi.fn(),
  bookModel: {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    distinct: vi.fn(),
  },
}));

vi.mock("@/lib/dbConnect", () => ({
  dbConnect: mocks.dbConnect,
}));

vi.mock("@/lib/models/Book", () => ({
  BookModel: mocks.bookModel,
}));

import {
  getPublishedBooks,
  getPublishedBooksCount,
  getBookBySlug,
  getAllBooks,
  getBookCategories,
  createBook,
  updateBook,
  deleteBook,
} from "@/lib/services/bookService";

const dbConnectMock = mocks.dbConnect;
const bookModelMock = mocks.bookModel;

function createQueryChain(returnValue: any) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(returnValue),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.dbConnect.mockReset();
  Object.values(mocks.bookModel).forEach((fn) => {
    if (typeof fn === "function") {
      fn.mockReset();
    }
  });
});

describe("bookService", () => {
  describe("getPublishedBooks", () => {
    it("returns published books with default sorting", async () => {
      const mockBooks = [
        {
          _id: "book1",
          title: "Test Book",
          status: "published",
          createdAt: new Date("2025-01-01"),
        },
      ];
      bookModelMock.find.mockReturnValue(createQueryChain(mockBooks));

      const result = await getPublishedBooks();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.find).toHaveBeenCalledWith({
        status: "published",
      });
      expect(result).toEqual(mockBooks);
    });

    it("applies category filter", async () => {
      const mockBooks = [{ _id: "book1", title: "Fiction Book", category: "fiction" }];
      bookModelMock.find.mockReturnValue(createQueryChain(mockBooks));

      const result = await getPublishedBooks({ category: "fiction" });

      expect(bookModelMock.find).toHaveBeenCalledWith({
        status: "published",
        category: "fiction",
      });
      expect(result).toEqual(mockBooks);
    });

    it("applies search query with regex", async () => {
      const mockBooks = [{ _id: "book1", title: "Test Book" }];
      bookModelMock.find.mockReturnValue(createQueryChain(mockBooks));

      const result = await getPublishedBooks({}, "test");

      expect(bookModelMock.find).toHaveBeenCalledWith({
        status: "published",
        $or: [
          { title: { $regex: "test", $options: "i" } },
          { author: { $regex: "test", $options: "i" } },
          { keywords: { $regex: "test", $options: "i" } },
          { description: { $regex: "test", $options: "i" } },
        ],
      });
      expect(result).toEqual(mockBooks);
    });

    it("escapes special regex characters in search", async () => {
      const mockBooks = [];
      bookModelMock.find.mockReturnValue(createQueryChain(mockBooks));

      await getPublishedBooks({}, "test.*+?^${}()|[]\\");

      expect(bookModelMock.find).toHaveBeenCalledWith({
        status: "published",
        $or: [
          { title: { $regex: "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\", $options: "i" } },
          { author: { $regex: "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\", $options: "i" } },
          { keywords: { $regex: "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\", $options: "i" } },
          { description: { $regex: "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\", $options: "i" } },
        ],
      });
    });

    it("applies pagination with limit and skip", async () => {
      const mockBooks = [{ _id: "book1" }];
      const chain = createQueryChain(mockBooks);
      bookModelMock.find.mockReturnValue(chain);

      await getPublishedBooks({}, undefined, { limit: 10, skip: 20 });

      expect(chain.limit).toHaveBeenCalledWith(10);
      expect(chain.skip).toHaveBeenCalledWith(20);
    });

    it("ignores empty search query", async () => {
      const mockBooks = [];
      bookModelMock.find.mockReturnValue(createQueryChain(mockBooks));

      await getPublishedBooks({}, "   ");

      expect(bookModelMock.find).toHaveBeenCalledWith({
        status: "published",
      });
    });
  });

  describe("getPublishedBooksCount", () => {
    it("returns count of published books", async () => {
      bookModelMock.countDocuments.mockResolvedValue(42);

      const result = await getPublishedBooksCount();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.countDocuments).toHaveBeenCalledWith({
        status: "published",
      });
      expect(result).toBe(42);
    });

    it("applies category filter to count", async () => {
      bookModelMock.countDocuments.mockResolvedValue(10);

      const result = await getPublishedBooksCount({ category: "fiction" });

      expect(bookModelMock.countDocuments).toHaveBeenCalledWith({
        status: "published",
        category: "fiction",
      });
      expect(result).toBe(10);
    });

    it("applies search query to count", async () => {
      bookModelMock.countDocuments.mockResolvedValue(5);

      const result = await getPublishedBooksCount({}, "test");

      expect(bookModelMock.countDocuments).toHaveBeenCalledWith({
        status: "published",
        $or: [
          { title: { $regex: "test", $options: "i" } },
          { author: { $regex: "test", $options: "i" } },
          { keywords: { $regex: "test", $options: "i" } },
          { description: { $regex: "test", $options: "i" } },
        ],
      });
      expect(result).toBe(5);
    });
  });

  describe("getBookBySlug", () => {
    it("returns book by slug", async () => {
      const mockBook = {
        _id: "book1",
        slug: "test-book",
        title: "Test Book",
      };
      const chain = {
        lean: vi.fn().mockResolvedValue(mockBook),
      };
      bookModelMock.findOne.mockReturnValue(chain);

      const result = await getBookBySlug("test-book");

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.findOne).toHaveBeenCalledWith({ slug: "test-book" });
      expect(result).toEqual(mockBook);
    });

    it("returns null if book not found", async () => {
      const chain = {
        lean: vi.fn().mockResolvedValue(null),
      };
      bookModelMock.findOne.mockReturnValue(chain);

      const result = await getBookBySlug("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getAllBooks", () => {
    it("returns all books with normalized data", async () => {
      const mockBooks = [
        {
          _id: { toString: () => "book1" },
          title: "Book 1",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-02T00:00:00.000Z"),
        },
      ];
      const chain = createQueryChain(mockBooks);
      bookModelMock.find.mockReturnValue(chain);

      const result = await getAllBooks();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.find).toHaveBeenCalledWith({});
      expect(result).toEqual([
        {
          _id: "book1",
          title: "Book 1",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        },
      ]);
    });

    it("applies filters", async () => {
      const mockBooks = [];
      const chain = createQueryChain(mockBooks);
      bookModelMock.find.mockReturnValue(chain);

      await getAllBooks({ category: "fiction" });

      expect(bookModelMock.find).toHaveBeenCalledWith({ category: "fiction" });
    });
  });

  describe("getBookCategories", () => {
    it("returns distinct published book categories", async () => {
      bookModelMock.distinct.mockResolvedValue(["fiction", "non-fiction", null, ""]);

      const result = await getBookCategories();

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.distinct).toHaveBeenCalledWith("category", {
        status: "published",
      });
      expect(result).toEqual(["fiction", "non-fiction"]);
    });

    it("filters out null and empty categories", async () => {
      bookModelMock.distinct.mockResolvedValue([null, "", "category1"]);

      const result = await getBookCategories();

      expect(result).toEqual(["category1"]);
    });
  });

  describe("createBook", () => {
    it("creates a new book", async () => {
      const mockBook = {
        _id: "book1",
        title: "New Book",
        slug: "new-book",
      };
      bookModelMock.create.mockResolvedValue(mockBook);

      const payload = {
        title: "New Book",
        slug: "new-book",
        author: "Author",
        category: "fiction",
        price: 10,
        imageUrl: "https://example.com/image.jpg",
      };

      const result = await createBook(payload);

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.create).toHaveBeenCalled();
      expect(result).toEqual(mockBook);
    });
  });

  describe("updateBook", () => {
    it("updates book by slug", async () => {
      const mockBook = {
        _id: "book1",
        title: "Updated Book",
        slug: "test-book",
      };
      bookModelMock.findOneAndUpdate.mockResolvedValue(mockBook);

      const result = await updateBook("test-book", { title: "Updated Book" });

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: "test-book" },
        expect.any(Object),
        { new: true },
      );
      expect(result).toEqual(mockBook);
    });
  });

  describe("deleteBook", () => {
    it("deletes book by slug", async () => {
      const mockBook = {
        _id: "book1",
        title: "Deleted Book",
        slug: "test-book",
      };
      bookModelMock.findOneAndDelete.mockResolvedValue(mockBook);

      const result = await deleteBook("test-book");

      expect(dbConnectMock).toHaveBeenCalled();
      expect(bookModelMock.findOneAndDelete).toHaveBeenCalledWith({ slug: "test-book" });
      expect(result).toEqual(mockBook);
    });

    it("returns null if book not found", async () => {
      bookModelMock.findOneAndDelete.mockResolvedValue(null);

      const result = await deleteBook("non-existent");

      expect(result).toBeNull();
    });
  });
});

