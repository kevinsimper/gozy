export function toWhatsAppId(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/^\+/, "");
  return `${cleaned}@c.us`;
}

export function fromWhatsAppId(whatsappId: string): string {
  const phoneNumber = whatsappId.replace(/@c\.us$/, "");
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}
