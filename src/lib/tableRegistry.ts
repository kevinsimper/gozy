import {
  usersTable,
  filesTable,
  userDocumentsTable,
  remindersTable,
  messagesTable,
  vehicleOffersTable,
  driverTaxiIdsTable,
  pageviewsTable,
  eventLogsTable,
  rttLocationsTable,
  rttBookingsTable,
  documentTestEvalsTable,
  checkinsTable,
  whatsappMessagesTable,
  rateLimitsTable,
  rateLimitLogsTable,
  qrCodesTable,
  qrCodeScansTable,
  helpdeskArticlesTable,
  helpdeskQuestionsTable,
  newsTable,
} from "../db/schema";

export const tableRegistry = {
  users: usersTable,
  files: filesTable,
  user_documents: userDocumentsTable,
  reminders: remindersTable,
  messages: messagesTable,
  vehicle_offers: vehicleOffersTable,
  driver_taxi_ids: driverTaxiIdsTable,
  pageviews: pageviewsTable,
  event_logs: eventLogsTable,
  rtt_locations: rttLocationsTable,
  rtt_bookings: rttBookingsTable,
  document_test_evals: documentTestEvalsTable,
  checkins: checkinsTable,
  whatsapp_messages: whatsappMessagesTable,
  rate_limits: rateLimitsTable,
  rate_limit_logs: rateLimitLogsTable,
  qr_codes: qrCodesTable,
  qr_code_scans: qrCodeScansTable,
  helpdesk_articles: helpdeskArticlesTable,
  helpdesk_questions: helpdeskQuestionsTable,
  news: newsTable,
} as const;

export type TableName = keyof typeof tableRegistry;

export function getTableByName(tableName: string) {
  if (tableName in tableRegistry) {
    return tableRegistry[tableName as TableName];
  }
  return null;
}

export function getAllTableNames(): TableName[] {
  return Object.keys(tableRegistry) as TableName[];
}

export function formatTableName(tableName: string): string {
  return tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
