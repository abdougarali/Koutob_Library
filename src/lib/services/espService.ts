import * as brevo from "@getbrevo/brevo";

// Initialize Brevo client
let brevoClient: brevo.ContactsApi | null = null;

if (process.env.BREVO_API_KEY) {
  brevoClient = new brevo.ContactsApi();
  brevoClient.setApiKey(
    brevo.ContactsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY,
  );
}

export interface SyncResult {
  success: boolean;
  espContactId?: string;
  error?: string;
}

/**
 * Sync a subscriber to Brevo
 */
export async function syncSubscriberToESP(
  email: string,
  name?: string,
  source: string = "footer",
  tags: string[] = [],
): Promise<SyncResult> {
  try {
    // Check if API key is configured
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_LIST_ID) {
      console.warn("[ESP] Brevo not configured, skipping sync");
      return { success: false, error: "ESP not configured" };
    }

    if (!brevoClient) {
      return { success: false, error: "ESP client not initialized" };
    }

    // Prepare contact data
    const contactData = new brevo.CreateContact();
    contactData.email = email;
    contactData.listIds = [Number(process.env.BREVO_LIST_ID)];

    // Set attributes
    const attributes: any = {};
    if (name) {
      attributes.FIRSTNAME = name;
    }
    attributes.SOURCE = source;

    if (Object.keys(attributes).length > 0) {
      contactData.attributes = attributes;
    }

    // Add tags (e.g., ["footer", "ar", "new_books"])
    if (tags.length > 0) {
      contactData.tags = tags;
    }

    // Double opt-in: Set to false for immediate subscription
    contactData.emailBlacklisted = false;
    contactData.smsBlacklisted = false;

    // Call Brevo API
    const response = await brevoClient.createContact(contactData);

    return {
      success: true,
      espContactId: response.id?.toString(),
    };
  } catch (error: any) {
    // Handle specific errors
    if (
      error.statusCode === 400 &&
      (error.body?.message?.includes("already exists") ||
        error.body?.message?.includes("Contact already exist"))
    ) {
      // Contact already exists - try to update instead
      return await updateSubscriberInESP(email, name, source, tags);
    }

    console.error("[ESP] Failed to sync subscriber:", error);
    return {
      success: false,
      error: error.message || error.body?.message || "Unknown error",
    };
  }
}

/**
 * Update existing subscriber in Brevo
 */
async function updateSubscriberInESP(
  email: string,
  name?: string,
  source?: string,
  tags?: string[],
): Promise<SyncResult> {
  try {
    if (!brevoClient) {
      return { success: false, error: "ESP client not initialized" };
    }

    const updateContact = new brevo.UpdateContact();

    const attributes: any = {};
    if (name) {
      attributes.FIRSTNAME = name;
    }
    if (source) {
      attributes.SOURCE = source;
    }

    if (Object.keys(attributes).length > 0) {
      updateContact.attributes = attributes;
    }

    if (tags && tags.length > 0) {
      updateContact.tags = tags;
    }

    // Ensure contact is not blacklisted
    updateContact.emailBlacklisted = false;

    await brevoClient.updateContact(email, updateContact);

    return { success: true };
  } catch (error: any) {
    console.error("[ESP] Failed to update subscriber:", error);
    return {
      success: false,
      error: error.message || error.body?.message || "Unknown error",
    };
  }
}

/**
 * Unsubscribe from ESP
 */
export async function unsubscribeFromESP(
  email: string,
): Promise<SyncResult> {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { success: false, error: "ESP not configured" };
    }

    if (!brevoClient) {
      return { success: false, error: "ESP client not initialized" };
    }

    const updateContact = new brevo.UpdateContact();
    updateContact.emailBlacklisted = true; // Blacklist = unsubscribe

    await brevoClient.updateContact(email, updateContact);

    return { success: true };
  } catch (error: any) {
    console.error("[ESP] Failed to unsubscribe:", error);
    return {
      success: false,
      error: error.message || error.body?.message || "Unknown error",
    };
  }
}



