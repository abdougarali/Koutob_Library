import dotenv from "dotenv";
import path from "path";
import { dbConnect } from "../src/lib/dbConnect";
import { UserModel } from "../src/lib/models/User";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkUser() {
  try {
    await dbConnect();
    console.log("Connected to database\n");

    const email = process.argv[2];
    if (!email) {
      console.log("Usage: npm run check-user <email>");
      console.log("Example: npm run check-user admin@example.com");
      process.exit(1);
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log("✅ User found:");
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Has Password: ${user.password ? "Yes" : "No"}`);
    console.log(`   Password Length: ${user.password?.length || 0} characters`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Updated: ${user.updatedAt}`);

    // Check if user can login
    if (user.role !== "admin") {
      console.log("\n⚠️  WARNING: User role is not 'admin'");
    }
    if (!user.isActive) {
      console.log("\n⚠️  WARNING: User is not active");
    }
    if (!user.password || user.password.length < 20) {
      console.log("\n⚠️  WARNING: Password might not be hashed correctly");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUser();



































