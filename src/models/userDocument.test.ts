import { expect, test, vi, beforeEach } from "vitest";
import { findDocumentsDueForReminder } from "./userDocument";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  all: vi.fn().mockResolvedValue([]),
};

vi.mock("drizzle-orm/d1", () => ({
  drizzle: vi.fn(() => mockDb),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper to collect SQL strings from drizzle query objects
function collectSqlStrings(obj: unknown, seen = new WeakSet()): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj === "string") return [obj];
  if (typeof obj !== "object") return [];
  if (seen.has(obj as object)) return [];
  seen.add(obj as object);

  const strings: string[] = [];
  if (Array.isArray(obj)) {
    for (const item of obj) {
      strings.push(...collectSqlStrings(item, seen));
    }
  } else {
    const record = obj as Record<string, unknown>;
    if (record.queryChunks) {
      strings.push(...collectSqlStrings(record.queryChunks, seen));
    }
    for (const key of Object.keys(record)) {
      if (key === "table" || key === "decoder" || key === "usedTables")
        continue;
      strings.push(...collectSqlStrings(record[key], seen));
    }
  }
  return strings;
}

test("reminder query uses correct date calculation", async () => {
  await findDocumentsDueForReminder({ env: { DB: {} as D1Database } });

  expect(mockDb.where).toHaveBeenCalled();

  const whereClause = mockDb.where.mock.calls[0][0];
  const sqlStrings = collectSqlStrings(whereClause);
  const fullSql = sqlStrings.join(" ");

  console.log(JSON.stringify(sqlStrings, null, 2));

  // Verify the SQL uses the correct date pattern:
  // date(expiry_date, 'unixepoch', '-' || reminder_days_before || ' days')
  expect(fullSql).toContain("date(");
  expect(fullSql).toContain("unixepoch");
  expect(fullSql).toContain("days");
  expect(fullSql).toContain("date('now')");
});
