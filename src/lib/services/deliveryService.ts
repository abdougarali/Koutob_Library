import { FilterQuery } from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import {
  DeliveryPartnerModel,
  type DeliveryPartnerDocument,
} from "@/lib/models/DeliveryPartner";
import {
  deliveryPartnerInputSchema,
  type DeliveryPartnerInput,
} from "@/lib/validators/deliveryPartnerValidator";

export async function listDeliveryPartners(
  filters: FilterQuery<DeliveryPartnerDocument> = {},
) {
  await dbConnect();
  const partners = await DeliveryPartnerModel.find(filters).sort({ name: 1 }).lean();
  
  return partners.map((partner: any) => {
    // Ensure deliveryFees is always a number, even if missing from old documents
    const deliveryFees = typeof partner.deliveryFees === 'number' 
      ? partner.deliveryFees 
      : (partner.deliveryFees ? Number(partner.deliveryFees) : 0);
    
    return {
      _id: partner._id?.toString(),
      name: partner.name,
      contactName: partner.contactName,
      contactPhone: partner.contactPhone,
      contactEmail: partner.contactEmail,
      coverageZones: partner.coverageZones || [],
      deliveryFees: deliveryFees, // Always return a number
      isActive: partner.isActive ?? true,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  });
}

export async function getAllDeliveryPartners() {
  await dbConnect();
  const partners = await DeliveryPartnerModel.find({})
    .sort({ name: 1 })
    .lean();

  return partners.map((partner) => ({
    ...partner,
    _id: partner._id?.toString(),
    createdAt: partner.createdAt?.toISOString(),
    updatedAt: partner.updatedAt?.toISOString(),
  }));
}

export async function createDeliveryPartner(payload: DeliveryPartnerInput) {
  const validated = deliveryPartnerInputSchema.parse(payload);
  await dbConnect();
  return DeliveryPartnerModel.create(validated);
}

export async function updateDeliveryPartner(
  id: string,
  payload: Partial<DeliveryPartnerInput>,
) {
  const merged = deliveryPartnerInputSchema.partial().parse(payload);
  await dbConnect();
  const updated = await DeliveryPartnerModel.findByIdAndUpdate(id, merged, { new: true }).lean();
  return updated;
}

export async function deleteDeliveryPartner(id: string) {
  await dbConnect();
  return DeliveryPartnerModel.findByIdAndDelete(id);
}




