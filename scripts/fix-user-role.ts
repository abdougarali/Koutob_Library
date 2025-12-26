import dotenv from "dotenv";
import path from "path";
import { dbConnect } from "../src/lib/dbConnect";
import { UserModel } from "../src/lib/models/User";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function fixUserRole() {
  try {
    await dbConnect();
    console.log("Connected to database\n");

    const email = process.argv[2];
    if (!email) {
      console.log("Usage: npm run fix-user-role <email>");
      console.log("Example: npm run fix-user-role mh@gmail.com");
      process.exit(1);
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);
    console.log(`Current isActive: ${user.isActive}\n`);

    if (user.role === "admin") {
      console.log("✅ User is already an admin");
      process.exit(0);
    }

    // Update role to admin
    user.role = "admin";
    user.isActive = true;
    await user.save();

    console.log("✅ Successfully updated user role to 'admin'");
    console.log(`✅ User is now active`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixUserRole();



































