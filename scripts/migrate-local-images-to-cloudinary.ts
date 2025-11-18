import { resolve, join } from "path";
import { promises as fs } from "fs";
import { config } from "dotenv";
import { dbConnect } from "../src/lib/dbConnect";
import { BookModel } from "../src/lib/models/Book";
import { cloudinary } from "../src/lib/cloudinary";

config({ path: resolve(process.cwd(), ".env.local") });

async function migrateImages() {
  await dbConnect();
  console.log("✅ Connected to database\n");

  const books = await BookModel.find({
    $or: [
      { imageUrl: { $regex: "^/" } },
      { imageUrl: { $exists: false } },
      { imageUrl: { $eq: "" } },
    ],
  })
    .select("_id slug title imageUrl")
    .lean();

  if (books.length === 0) {
    console.log("No books with local images found. Nothing to migrate.");
    return;
  }

  const uploadsDir = resolve(process.cwd(), "public");
  let migrated = 0;
  let skipped = 0;

  for (const book of books) {
    const relativePath = book.imageUrl || "";

    if (!relativePath.startsWith("/")) {
      console.log(`⚠️  Skipping ${book.slug}: imageUrl is not a local path (${relativePath})`);
      skipped += 1;
      continue;
    }

    const absolutePath = join(uploadsDir, relativePath.replace(/^\//, ""));

    try {
      await fs.access(absolutePath);
    } catch {
      console.log(`⚠️  File not found for ${book.slug}: ${absolutePath}`);
      skipped += 1;
      continue;
    }

    console.log(`⬆️  Uploading ${book.slug} (${relativePath}) to Cloudinary...`);

    try {
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: "bookshop/books",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        public_id: book.slug || undefined,
      });

      await BookModel.updateOne(
        { _id: book._id },
        { imageUrl: result.secure_url },
      );

      console.log(`   ✅ Updated imageUrl -> ${result.secure_url}`);
      migrated += 1;
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${book.slug}:`, error);
      skipped += 1;
    }
  }

  console.log("\nMigration finished:");
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${books.length}`);
}

migrateImages()
  .then(() => {
    console.log("\n✅ Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
