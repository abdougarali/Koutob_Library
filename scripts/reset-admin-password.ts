import { config } from "dotenv";
import { resolve } from "path";
import { dbConnect } from "../src/lib/dbConnect";
import { UserModel } from "../src/lib/models/User";
import { hashPassword } from "../src/lib/utils/password";

config({ path: resolve(process.cwd(), ".env.local") });

async function resetPassword() {
  try {
    await dbConnect();
    console.log("✅ Connected to database");

    const adminEmail = "admin@koutob.com";
    const adminPassword = "admin123";

    const admin = await UserModel.findOne({ email: adminEmail });
    if (!admin) {
      console.log("❌ Admin user not found. Run 'npm run seed' first.");
      process.exit(1);
    }

    const hashedPassword = await hashPassword(adminPassword);
    await UserModel.updateOne(
      { email: adminEmail },
      {
        password: hashedPassword,
        isActive: true,
      }
    );

    console.log("✅ Admin password reset successfully!");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  }
}

resetPassword();

