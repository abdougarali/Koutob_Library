/**
 * Script to update delivery partners that don't have deliveryFees field
 * Run with: npx tsx scripts/update-delivery-fees.ts
 */

import { dbConnect } from "../src/lib/dbConnect";
import { DeliveryPartnerModel } from "../src/lib/models/DeliveryPartner";

async function updateDeliveryFees() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Find all partners that don't have deliveryFees or have it as undefined/null
    const partners = await DeliveryPartnerModel.find({
      $or: [
        { deliveryFees: { $exists: false } },
        { deliveryFees: null },
        { deliveryFees: undefined },
      ],
    });

    console.log(`Found ${partners.length} partners without deliveryFees`);

    if (partners.length === 0) {
      console.log("All partners already have deliveryFees. Exiting.");
      process.exit(0);
    }

    // Update each partner with default deliveryFees of 25
    let updated = 0;
    for (const partner of partners) {
      partner.deliveryFees = 25; // Default value
      await partner.save();
      updated++;
      console.log(`Updated partner: ${partner.name} (ID: ${partner._id}) with deliveryFees: 25`);
    }

    console.log(`\n✅ Successfully updated ${updated} partners with deliveryFees`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating delivery fees:", error);
    process.exit(1);
  }
}

updateDeliveryFees();

































