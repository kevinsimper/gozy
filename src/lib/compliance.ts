import { DOCUMENT_TYPES } from "./documentTypes";
import type { UserDocument } from "../db/schema";

export type ComplianceLevel =
  | "getting_started"
  | "good_progress"
  | "almost_there"
  | "complete";

export type ComplianceData = {
  percentage: number;
  uploadedCount: number;
  totalCount: number;
  level: ComplianceLevel;
  message: string;
  uploadedTypes: Set<string>;
  missingTypes: Array<{ value: string; text: string }>;
};

export function calculateCompliance(documents: UserDocument[]): ComplianceData {
  const totalCount = DOCUMENT_TYPES.length;
  const uploadedTypes = new Set(documents.map((doc) => doc.documentType));
  const uploadedCount = uploadedTypes.size;
  const percentage = Math.round((uploadedCount / totalCount) * 100);

  const level: ComplianceLevel =
    percentage === 100
      ? "complete"
      : percentage >= 60
        ? "almost_there"
        : percentage >= 20
          ? "good_progress"
          : "getting_started";

  const message = getComplianceMessage(percentage);

  const missingTypes = DOCUMENT_TYPES.filter(
    (docType) => !uploadedTypes.has(docType.value),
  ).map((docType) => ({ value: docType.value, text: docType.text }));

  return {
    percentage,
    uploadedCount,
    totalCount,
    level,
    message,
    uploadedTypes,
    missingTypes,
  };
}

function getComplianceMessage(percentage: number): string {
  if (percentage === 0) {
    return "Start din digitale dokumentmappe i dag";
  }
  if (percentage <= 20) {
    return "God start! Upload flere for at få det fulde overblik";
  }
  if (percentage <= 40) {
    return "Du er godt på vej! Fortsæt med at uploade";
  }
  if (percentage <= 60) {
    return "Fremragende fremskridt! Fortsæt sådan";
  }
  if (percentage <= 80) {
    return "Fantastisk! Næsten færdig";
  }
  if (percentage < 100) {
    return "Så tæt på! Kun få dokumenter tilbage";
  }
  return "Perfekt! Din dokumentmappe er komplet";
}

export function getProgressColor(level: ComplianceLevel): string {
  switch (level) {
    case "getting_started":
      return "text-blue-600";
    case "good_progress":
      return "text-blue-600";
    case "almost_there":
      return "text-green-600";
    case "complete":
      return "text-green-600";
  }
}

export function getProgressGradient(level: ComplianceLevel): string {
  switch (level) {
    case "getting_started":
      return "from-blue-500 to-cyan-500";
    case "good_progress":
      return "from-blue-500 to-green-500";
    case "almost_there":
      return "from-green-500 to-emerald-500";
    case "complete":
      return "from-green-500 to-emerald-600";
  }
}
