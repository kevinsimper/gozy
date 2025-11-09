export async function sendLoginPin(
  phoneNumber: string,
  pin: string,
): Promise<void> {
  const message = `Din Gozy login kode er: ${pin}\n\nKoden udløber om 10 minutter.`;
  console.log(`[WhatsApp Mock] Would send to ${phoneNumber}: ${message}`);
}

export async function sendTextMessage(
  token: string,
  phoneNumberId: string,
  recipientPhoneNumber: string,
  message: string,
): Promise<void> {
  console.log(
    `[WhatsApp Mock] Would send to ${recipientPhoneNumber}: ${message}`,
  );
}
