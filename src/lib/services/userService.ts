import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { userInputSchema, userUpdateSchema, type UserInput, type UserUpdateInput } from "@/lib/validators/userValidator";
import { hashPassword } from "@/lib/utils/password";

export async function createUser(payload: UserInput) {
  const validated = userInputSchema.parse(payload);
  await dbConnect();

  const hashedPassword = await hashPassword(validated.password);

  // Ensure email is lowercased and role is explicitly set to "admin"
  // Handle phone: if empty string, set to undefined to avoid unique index issues
  const userData: any = {
    ...validated,
    email: validated.email.toLowerCase().trim(),
    password: hashedPassword,
    role: "admin", // Always set to admin for users created in admin panel
    isActive: validated.isActive ?? true, // Ensure isActive is set
  };
  
  // Only include phone if it has a value (not empty string)
  if (validated.phone && validated.phone.trim().length > 0) {
    userData.phone = validated.phone.trim();
  } else {
    // Don't include phone field if it's empty to avoid unique index conflicts
    delete userData.phone;
  }
  
  const user = await UserModel.create(userData);

  // Convert to plain object and remove password
  const userObj = user.toObject();
  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
}

export async function listAdmins() {
  await dbConnect();
  // Get ALL admins regardless of isActive status (including disabled ones)
  // This allows admins to see and manage disabled accounts
  // Explicitly don't filter by isActive - we want to see all admins
  const admins = await UserModel.find({ 
    role: "admin"
    // Note: We intentionally don't filter by isActive here
    // to allow admins to see and manage disabled accounts
  })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  // Ensure isActive is always a boolean (default to true if undefined)
  return admins.map((admin) => ({
    ...admin,
    _id: admin._id?.toString(),
    isActive: admin.isActive ?? true, // Default to true if undefined
    createdAt: admin.createdAt?.toISOString(),
    updatedAt: admin.updatedAt?.toISOString(),
  }));
}

/**
 * Get all users (both admin and customer roles)
 * Used in admin panel to manage all users
 */
export async function listAllUsers() {
  await dbConnect();
  // Get ALL users regardless of role or isActive status
  // This allows admins to see and manage all users (admins and customers)
  const users = await UserModel.find({})
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  // Ensure isActive is always a boolean (default to true if undefined)
  return users.map((user) => ({
    ...user,
    _id: user._id?.toString(),
    isActive: user.isActive ?? true, // Default to true if undefined
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  }));
}

export async function updateUser(userId: string, payload: UserUpdateInput) {
  const validated = userUpdateSchema.parse(payload);
  await dbConnect();

  const updateData: any = { ...validated };
  
  // Ensure role is explicitly set if provided, otherwise keep existing role
  // Don't allow changing admin users to customer in admin panel
  if (validated.role !== undefined) {
    updateData.role = validated.role;
  }

  // Lowercase email if it's being updated
  if (validated.email) {
    updateData.email = validated.email.toLowerCase().trim();
  }

  // Hash password if it's being updated
  if (validated.password) {
    updateData.password = await hashPassword(validated.password);
  }

  // Handle phone: if empty string, remove it to avoid unique index issues
  if (validated.phone !== undefined) {
    if (validated.phone && validated.phone.trim().length > 0) {
      updateData.phone = validated.phone.trim();
    } else {
      // Set to null to remove the phone field
      updateData.phone = null;
    }
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .select("-password")
    .lean();

  if (!user) {
    return null;
  }

  return {
    ...user,
    _id: user._id?.toString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

export async function deleteUser(userId: string) {
  await dbConnect();
  
  // Check if user exists
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    return null;
  }

  // Import models for cascade deletion
  const { WishlistModel } = await import("@/lib/models/Wishlist");
  const { SavedAddressModel } = await import("@/lib/models/SavedAddress");
  const { SearchLogModel } = await import("@/lib/models/SearchLog");
  const { ReviewModel } = await import("@/lib/models/Review");
  const { DiscountCodeModel } = await import("@/lib/models/DiscountCode");
  const { OrderModel } = await import("@/lib/models/Order");
  const { NewsletterSubscriberModel } = await import("@/lib/models/NewsletterSubscriber");

  // 1. Delete user's wishlist items
  await WishlistModel.deleteMany({ user: userId });

  // 2. Delete user's saved addresses
  await SavedAddressModel.deleteMany({ user: userId });

  // 3. Delete user's search logs (optional - you might want to keep for analytics)
  await SearchLogModel.deleteMany({ user: userId });

  // 4. Anonymize reviews (keep reviews but remove user reference)
  // Set user to null and keep the review for book ratings
  await ReviewModel.updateMany(
    { user: userId },
    { $set: { user: null } }
  );
  
  // Also nullify approvedBy if this user approved reviews
  await ReviewModel.updateMany(
    { approvedBy: userId },
    { $set: { approvedBy: null } }
  );

  // 5. Remove user from discount code usage tracking
  await DiscountCodeModel.updateMany(
    { "usageByCustomer.userId": userId },
    { $pull: { usageByCustomer: { userId: userId } } }
  );

  // 6. Nullify user reference in order status history (keep orders for records)
  await OrderModel.updateMany(
    { "statusHistory.updatedBy": userId },
    { $set: { "statusHistory.$[elem].updatedBy": null } },
    { arrayFilters: [{ "elem.updatedBy": userId }] }
  );

  // 7. Handle newsletter subscription (matched by email)
  // Mark as inactive instead of deleting to respect original subscription consent
  // User can still unsubscribe via email link if they want
  // The subscription record remains in the database but is marked as inactive
  if (user.email) {
    await NewsletterSubscriberModel.updateOne(
      { email: user.email.toLowerCase().trim() },
      { $set: { isActive: false } }
    );
  }

  // 8. Finally, delete the user
  await UserModel.findByIdAndDelete(userId);

  return user;
}


