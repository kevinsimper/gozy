import { findDocumentsDueForReminder } from "../models/userDocument";
import { createReminder } from "../models/reminder";
import { sendTextMessage } from "../services/whatsapp";

type Bindings = {
  DB: D1Database;
  WHATSAPP_API_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
};

export async function handleDocumentReminders(
  event: ScheduledEvent,
  env: Bindings,
  ctx: ExecutionContext,
): Promise<void> {
  console.log("Running document reminder job at", new Date().toISOString());

  const c = { env };

  try {
    const documentsDue = await findDocumentsDueForReminder(c);
    console.log(`Found ${documentsDue.length} documents due for reminder`);

    for (const doc of documentsDue) {
      try {
        const expiryDate = doc.expiryDate
          ? new Date(doc.expiryDate).toLocaleDateString("da-DK")
          : "ukendt";
        const documentTypeDanish = doc.documentType.replace(/_/g, " ");

        const message = `Hej ${doc.user.name}!

Din ${documentTypeDanish} udløber snart: ${expiryDate}

${doc.description ? `Note: ${doc.description}\n\n` : ""}Husk at forny dokumentet i tide for at undgå problemer.

Du kan se og opdatere dine dokumenter på https://gozy.dk/dashboard/documents`;

        // TODO: Implement WhatsApp message sending
        console.log(`Would send reminder to ${doc.user.phoneNumber}:`, message);
        // await sendTextMessage(
        //   c.env.WHATSAPP_API_TOKEN,
        //   c.env.WHATSAPP_PHONE_NUMBER_ID,
        //   doc.user.phoneNumber,
        //   message,
        // );

        await createReminder(c, {
          userId: doc.userId,
          documentId: doc.id,
        });

        console.log(
          `Sent reminder for document ${doc.id} to user ${doc.userId}`,
        );
      } catch (error) {
        console.error(`Failed to send reminder for document ${doc.id}:`, error);
      }
    }

    console.log("Document reminder job completed successfully");
  } catch (error) {
    console.error("Error in document reminder job:", error);
    throw error;
  }
}
