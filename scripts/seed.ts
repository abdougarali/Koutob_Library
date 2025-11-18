import { config } from "dotenv";
import { resolve } from "path";
import { dbConnect } from "../src/lib/dbConnect";
import { UserModel } from "../src/lib/models/User";
import { BookModel } from "../src/lib/models/Book";
import { DeliveryPartnerModel } from "../src/lib/models/DeliveryPartner";
import { hashPassword } from "../src/lib/utils/password";

config({ path: resolve(process.cwd(), ".env.local") });

async function seed() {
  try {
    await dbConnect();
    console.log("✅ Connected to database");

    // Create admin user
    const adminEmail = "admin@koutob.com";
    const adminPassword = "admin123";

    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword);
      await UserModel.create({
        name: "المشرف الرئيسي",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
      console.log("✅ Created admin user");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create sample delivery partners
    const partners = [
      {
        name: "شركة التوصيل السريع",
        contactName: "أحمد محمد",
        contactPhone: "+216 12 345 678",
        isActive: true,
      },
      {
        name: "خدمات التوصيل المحلية",
        contactName: "فاطمة علي",
        contactPhone: "+216 98 765 432",
        isActive: true,
      },
    ];

    for (const partner of partners) {
      const existing = await DeliveryPartnerModel.findOne({ name: partner.name });
      if (!existing) {
        await DeliveryPartnerModel.create(partner);
        console.log(`✅ Created delivery partner: ${partner.name}`);
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

