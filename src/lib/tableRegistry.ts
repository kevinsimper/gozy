import {
  usersTable,
  filesTable,
  userDocumentsTable,
  remindersTable,
  messagesTable,
  vehicleOffersTable,
  pageviewsTable,
  eventLogsTable,
  rttLocationsTable,
  rttBookingsTable,
  checkinsTable,
} from "../db/schema";

export const tableRegistry = {
  users: usersTable,
  files: filesTable,
  user_documents: userDocumentsTable,
  reminders: remindersTable,
  messages: messagesTable,
  vehicle_offers: vehicleOffersTable,
  pageviews: pageviewsTable,
  event_logs: eventLogsTable,
  rtt_locations: rttLocationsTable,
  rtt_bookings: rttBookingsTable,
  checkins: checkinsTable,
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
