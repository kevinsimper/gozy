import { type Context } from "hono";
import { Bindings } from "../..";
import {
  updateUser,
  updateUserPreferredLocation,
  updateUserDriverInfo,
  findUserById,
} from "../../models/user";
import { saveConversationFileAsUserDocument } from "../userDocument";
import { findUserDocumentsByUserId } from "../../models/userDocument";
import {
  createVehicleOffer,
  updateVehicleOffer,
  getOpenOffers,
  getMissingFields,
  getQuestionsAsked,
} from "../../models/vehicleOffer";
import { createCheckin } from "../../models/checkin";
import {
  findAllRttLocations,
  findRttLocationById,
} from "../../models/rttlocation";
import { createTaxiId, findTaxiIdsByUserId } from "../../models/taxiid";
import { type FunctionCall } from "@google/genai";
import { createFile } from "../../models/file";
import { copyFileToContext } from "../file-storage";
import { createWhatsAppBotClient } from "../../services/whatsapp-bot/client";

export async function handleFunctionCall(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  functionCall: FunctionCall,
): Promise<{
  name: string;
  response: Record<string, unknown>;
}> {
  if (functionCall.name === "update_user_name") {
    const args = functionCall.args as { name: string };
    await updateUser(c, userId, { name: args.name });
    console.log(`Updated user ${userId} name to: ${args.name}`);
    return {
      name: functionCall.name,
      response: { success: true },
    };
  } else if (functionCall.name === "update_driver_info") {
    const args = functionCall.args as {
      driverType?: "vehicle_owner" | "driver";
    };
    await updateUserDriverInfo(c, userId, args);
    console.log(
      `Updated user ${userId} driver info:`,
      args.driverType ? `type=${args.driverType}` : "",
    );
    return {
      name: functionCall.name,
      response: { success: true },
    };
  } else if (functionCall.name === "save_message_file_to_documents") {
    const args = functionCall.args as {
      messageFileId: number;
      documentType?: string;
    };
    try {
      await saveConversationFileAsUserDocument(
        c,
        userId,
        args.messageFileId,
        args.documentType,
      );
      console.log(
        `Saved file ${args.messageFileId} ${args.documentType ? `as ${args.documentType}` : "(AI will detect type)"} for user ${userId}`,
      );
      return {
        name: functionCall.name,
        response: { success: true },
      };
    } catch (error) {
      console.error("Error saving message file to documents:", error);
      return {
        name: functionCall.name,
        response: { success: false, error: String(error) },
      };
    }
  } else if (functionCall.name === "get_user_documents") {
    const documents = await findUserDocumentsByUserId(c, userId);
    const documentList = documents.map((doc) => ({
      publicId: doc.publicId,
      documentType: doc.documentType,
      filename: doc.file.originalFilename,
      uploadedAt: doc.createdAt,
    }));
    console.log(
      `Retrieved ${documentList.length} documents for user ${userId}`,
    );
    return {
      name: functionCall.name,
      response: { documents: documentList },
    };
  } else if (functionCall.name === "create_vehicle_offer") {
    const args = functionCall.args as {
      brand?: string;
      budget?: number;
      model?: string;
      financing?: "lease" | "loan" | "cash";
      timeframe?: string;
      notes?: string;
    };
    const offer = await createVehicleOffer(c, userId, args);
    console.log(`Created vehicle offer ${offer.id} for user ${userId}`);
    return {
      name: functionCall.name,
      response: {
        success: true,
        offerId: offer.id,
        missingFields: getMissingFields(offer),
        alreadyAsked: getQuestionsAsked(offer),
      },
    };
  } else if (functionCall.name === "update_vehicle_offer") {
    const args = functionCall.args as {
      offerId: number;
      updates?: {
        brand?: string;
        budget?: number;
        model?: string;
        financing?: "lease" | "loan" | "cash";
        timeframe?: string;
        notes?: string;
        status?: "collecting_info" | "submitted" | "responded";
      };
      questionsAsked?: string[];
    };
    const offer = await updateVehicleOffer(
      c,
      args.offerId,
      args.updates,
      args.questionsAsked,
    );
    console.log(`Updated vehicle offer ${offer.id}`);
    return {
      name: functionCall.name,
      response: {
        success: true,
        missingFields: getMissingFields(offer),
        alreadyAsked: getQuestionsAsked(offer),
      },
    };
  } else if (functionCall.name === "get_open_offers") {
    const offers = await getOpenOffers(c, userId);
    console.log(`Retrieved ${offers.length} open offers for user ${userId}`);
    return {
      name: functionCall.name,
      response: {
        success: true,
        offers: offers.map((offer) => ({
          id: offer.id,
          brand: offer.brand,
          budget: offer.budget,
          model: offer.model,
          financing: offer.financing,
          timeframe: offer.timeframe,
          notes: offer.notes,
          missingFields: getMissingFields(offer),
          alreadyAsked: getQuestionsAsked(offer),
          createdAt: offer.createdAt,
        })),
      },
    };
  } else if (functionCall.name === "ask_vehicle_offer_question") {
    const args = functionCall.args as {
      offerId: number;
      field: string;
      question: string;
    };
    const offer = await updateVehicleOffer(c, args.offerId, undefined, [
      args.field,
    ]);
    console.log(
      `Asked question about ${args.field} for vehicle offer ${offer.id}`,
    );
    return {
      name: functionCall.name,
      response: {
        success: true,
        messageToUser: args.question,
        updatedQuestionsAsked: getQuestionsAsked(offer),
      },
    };
  } else if (functionCall.name === "lookup_rtt_location_info") {
    const locations = await findAllRttLocations(c);
    console.log(`Retrieved ${locations.length} RTT locations`);
    return {
      name: functionCall.name,
      response: {
        success: true,
        locations: locations.map((loc) => ({
          id: loc.id,
          slug: loc.slug,
          name: loc.name,
          address: loc.address,
          postalCode: loc.postalCode,
          city: loc.city,
          phone: loc.phone,
          email: loc.email,
          openingHours: {
            monThu: loc.openingHoursMonThu,
            fri: loc.openingHoursFri,
            sat: loc.openingHoursSat,
          },
          emergencyHours: loc.emergencyHours,
        })),
      },
    };
  } else if (functionCall.name === "check_in_at_location") {
    const args = functionCall.args as {
      locationId: number;
      updatePreferred?: boolean;
    };
    const location = await findRttLocationById(c, args.locationId);
    if (!location) {
      return {
        name: functionCall.name,
        response: { success: false, error: "Location not found" },
      };
    }
    const checkin = await createCheckin(c, userId, args.locationId);
    if (args.updatePreferred) {
      await updateUserPreferredLocation(c, userId, args.locationId);
      console.log(
        `User ${userId} checked in at ${location.name} and set as preferred location`,
      );
    } else {
      console.log(`User ${userId} checked in at ${location.name}`);
    }

    // Send notification to WhatsApp group
    try {
      console.log(
        `[CHECK-IN NOTIFICATION] Starting WhatsApp group notification for user ${userId} at ${location.name}`,
      );

      // Get user details for the notification
      const user = await findUserById(c, userId);
      const taxiIds = await findTaxiIdsByUserId(c, userId);

      // Only proceed if user exists
      if (!user) {
        console.error(
          `[CHECK-IN NOTIFICATION] User not found for ID ${userId}`,
        );
        return {
          name: functionCall.name,
          response: {
            success: true,
            locationName: location.name,
            checkedInAt: checkin.checkedInAt,
            preferredUpdated: args.updatePreferred || false,
          },
        };
      }

      console.log(
        `[CHECK-IN NOTIFICATION] User found: ${user.name}, Taxi IDs: ${taxiIds.map((t) => t.taxiId).join(", ")}`,
      );

      // Format the check-in time (Danish timezone)
      const checkinTime = new Date(checkin.checkedInAt);
      const timeStr = checkinTime.toLocaleString("da-DK", {
        timeZone: "Europe/Copenhagen",
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = checkinTime.toLocaleString("da-DK", {
        timeZone: "Europe/Copenhagen",
        day: "numeric",
        month: "long",
      });

      // Build the notification message
      let message = `✅ Check-in registreret\n\n`;
      message += `👤 ${user.name}\n`;

      // Add taxi IDs if available
      if (taxiIds.length > 0) {
        const taxiIdList = taxiIds.map((t) => t.taxiId).join(", ");
        message += `🚕 Taxi ID: ${taxiIdList}\n`;
      }

      message += `📍 ${location.name}\n`;
      message += `🕐 ${timeStr} - ${dateStr}`;

      // Send to WhatsApp group
      const whatsappClient = createWhatsAppBotClient(c);
      const result = await whatsappClient.post("/api/send-group-message", {
        groupId: "120363404914114317@g.us",
        message: message,
      });

      if (!result.success) {
        console.error(
          `Failed to send WhatsApp notification for check-in: ${result.error}`,
        );
      } else {
        console.log(
          `WhatsApp notification sent for check-in at ${location.name}`,
        );
      }
    } catch (error) {
      // Don't fail the check-in if notification fails
      console.error("Error sending WhatsApp notification:", error);
    }
    return {
      name: functionCall.name,
      response: {
        success: true,
        locationName: location.name,
        checkedInAt: checkin.checkedInAt,
        preferredUpdated: args.updatePreferred || false,
      },
    };
  } else if (functionCall.name === "update_preferred_location") {
    const args = functionCall.args as {
      locationId: number;
    };
    const location = await findRttLocationById(c, args.locationId);
    if (!location) {
      return {
        name: functionCall.name,
        response: { success: false, error: "Location not found" },
      };
    }
    await updateUserPreferredLocation(c, userId, args.locationId);
    console.log(
      `User ${userId} updated preferred location to ${location.name}`,
    );
    return {
      name: functionCall.name,
      response: {
        success: true,
        locationName: location.name,
      },
    };
  } else if (functionCall.name === "send_document_link") {
    const args = functionCall.args as {
      documentPublicId: string;
      message?: string;
    };

    const baseUrl = "https://gozy.ks.workers.dev";
    const documentUrl = `${baseUrl}/dashboard/documents/${args.documentPublicId}/edit`;

    const defaultMessage = `Her er linket til dit dokument: ${documentUrl}`;
    const messageToUser = args.message
      ? `${args.message}\n\n${documentUrl}`
      : defaultMessage;

    console.log(
      `Sending document link for ${args.documentPublicId} to user ${userId}`,
    );

    return {
      name: functionCall.name,
      response: {
        success: true,
        messageToUser,
      },
    };
  } else if (functionCall.name === "add_taxi_id") {
    const args = functionCall.args as {
      taxiId: string;
    };
    await createTaxiId(c, userId, args.taxiId);
    console.log(`Added Taxi ID ${args.taxiId} for user ${userId}`);
    return {
      name: functionCall.name,
      response: { success: true },
    };
  } else if (functionCall.name === "get_taxi_ids") {
    const taxiIds = await findTaxiIdsByUserId(c, userId);
    console.log(`Retrieved ${taxiIds.length} Taxi IDs for user ${userId}`);
    return {
      name: functionCall.name,
      response: {
        success: true,
        taxiIds: taxiIds.map((item) => ({
          id: item.id,
          taxiId: item.taxiId,
          createdAt: item.createdAt,
        })),
      },
    };
  } else if (functionCall.name === "send_random_dog_image") {
    const args = functionCall.args as {
      message?: string;
    };

    try {
      // Fetch random dog image from Dog CEO API
      const dogApiResponse = await fetch(
        "https://dog.ceo/api/breeds/image/random",
      );
      const dogApiData = (await dogApiResponse.json()) as {
        message: string;
        status: string;
      };

      if (dogApiData.status !== "success") {
        throw new Error("Failed to fetch dog image from API");
      }

      const imageUrl = dogApiData.message;

      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      const imageArrayBuffer = await imageBlob.arrayBuffer();

      // Extract filename from URL
      const urlParts = imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1] || "dog.jpg";

      // Determine mime type
      const mimeType = imageBlob.type || "image/jpeg";

      // Upload to R2
      const timestamp = Date.now();
      const storageKey = `assistant-images/${timestamp}-${filename}`;

      await c.env.FILES.put(storageKey, imageArrayBuffer, {
        httpMetadata: {
          contentType: mimeType,
        },
      });

      // Create file record
      const fileRecord = await createFile(c, {
        storageKey,
        originalFilename: filename,
        mimeType,
        size: imageArrayBuffer.byteLength,
      });

      console.log(
        `Sent random dog image (file ID: ${fileRecord.id}) to user ${userId}`,
      );

      const defaultMessage = "Her er et sødt hundebillede til dig!";
      const messageToUser = args.message || defaultMessage;

      return {
        name: functionCall.name,
        response: {
          success: true,
          messageToUser,
          fileId: fileRecord.id,
        },
      };
    } catch (error) {
      console.error("Error sending random dog image:", error);
      return {
        name: functionCall.name,
        response: {
          success: false,
          error: String(error),
          messageToUser: "Beklager, jeg kunne ikke hente et hundebillede.",
        },
      };
    }
  } else if (functionCall.name === "send_driver_license_image") {
    const args = functionCall.args as { message?: string };

    // Find user's driver license document
    const documents = await findUserDocumentsByUserId(c, userId);
    const driverLicense = documents.find(
      (doc) => doc.documentType === "drivers_license",
    );

    if (!driverLicense) {
      return {
        name: functionCall.name,
        response: {
          success: false,
          messageToUser: "Du har ikke uploadet et kørekort endnu.",
        },
      };
    }

    try {
      // Use the new abstraction to copy file to assistant-images context
      const copiedFile = await copyFileToContext(
        c,
        driverLicense.fileId,
        "assistant-images",
        {
          filename: `drivers-license-${userId}.jpg`,
        },
      );

      const defaultMessage = "Her er dit kørekort:";
      const messageToUser = args.message || defaultMessage;

      console.log(
        `Sent driver's license (file ID: ${copiedFile.id}) to user ${userId}`,
      );

      return {
        name: functionCall.name,
        response: {
          success: true,
          messageToUser,
          fileId: copiedFile.id,
        },
      };
    } catch (error) {
      console.error("Error copying driver license:", error);
      return {
        name: functionCall.name,
        response: {
          success: false,
          messageToUser: "Kunne ikke hente dit kørekort.",
        },
      };
    }
  }

  throw new Error(`Unknown function call: ${functionCall.name}`);
}
