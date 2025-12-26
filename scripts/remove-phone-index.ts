import dotenv from "dotenv";
import path from "path";
import { dbConnect } from "../src/lib/dbConnect";
import { UserModel } from "../src/lib/models/User";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function removePhoneIndex() {
  try {
    await dbConnect();
    console.log("Connected to database\n");

    // Drop the phone unique index
    try {
      await UserModel.collection.dropIndex("phone_1");
      console.log("✅ Successfully removed phone unique index");
    } catch (error: any) {
      if (error.code === 27) {
        console.log("ℹ️  Phone index doesn't exist (already removed)");
      } else {
        console.error("❌ Error removing phone index:", error.message);
      }
    }

    // List all indexes to verify
    const indexes = await UserModel.collection.indexes();
    console.log("\n📋 Current indexes:");
    indexes.forEach((index: any) => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

removePhoneIndex();



































