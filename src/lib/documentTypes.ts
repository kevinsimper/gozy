export const DOCUMENT_TYPES = [
  { value: "taximeter_certificate", text: "Taximeterattest" },
  { value: "vehicle_inspection", text: "Synsrapport" },
  { value: "taxi_id", text: "Taxi ID" },
  { value: "winter_tires", text: "Vinterdæk" },
  { value: "drivers_license", text: "Kørekort" },
  { value: "vehicle_registration", text: "Registreringsattest" },
  { value: "insurance", text: "Forsikring" },
  { value: "tax_card", text: "Skattekort" },
  { value: "criminal_record", text: "Straffeattest" },
  { value: "leasing_agreement", text: "Leasingaftale" },
  { value: "other", text: "Andet" },
] as const;

export function getDocumentTypeLabel(value: string): string {
  const docType = DOCUMENT_TYPES.find((dt) => dt.value === value);
  return docType ? docType.text : value.replace(/_/g, " ");
}

export function getDocumentTypeIcon(value: string): string {
  const iconMap: Record<string, string> = {
    taximeter_certificate: "📊",
    vehicle_inspection: "🔍",
    taxi_id: "🪪",
    winter_tires: "❄️",
    drivers_license: "🚗",
    vehicle_registration: "📋",
    insurance: "🛡️",
    tax_card: "💳",
    criminal_record: "📄",
    leasing_agreement: "📝",
    other: "📎",
  };
  return iconMap[value] || "📄";
}
