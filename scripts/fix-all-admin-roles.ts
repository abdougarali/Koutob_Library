import dotenv from "dotenv";
import path from "path";
import { dbConnect } from "../src/lib/dbConnect";
import { UserModel } from "../src/lib/models/User";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function fixAllAdminRoles() {
  try {
    await dbConnect();
    console.log("Connected to database\n");

    // Find all users that should be admins (created in admin panel)
    // For now, we'll update all users with role "customer" to "admin"
    // You can modify this logic based on your needs
    
    const users = await UserModel.find({ role: "customer" });

    if (users.length === 0) {
      console.log("✅ No users with 'customer' role found");
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s) with 'customer' role:\n`);
    users.forEach((user) => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    // Update all to admin
    const result = await UserModel.updateMany(
      { role: "customer" },
      { $set: { role: "admin", isActive: true } }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} user(s) to 'admin' role`);
    console.log(`✅ All users are now active`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixAllAdminRoles();
























