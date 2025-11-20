import { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and, lt } from "drizzle-orm";
import {
  rateLimitsTable,
  rateLimitLogsTable,
  RateLimit,
  RateLimitLog,
} from "../db/schema";

export type CreateRateLimitParams = {
  identifier: string;
  endpoint: string;
  requests: number;
  resetsAt: Date;
};

export type UpdateRateLimitParams = {
  requests?: number;
  resetsAt?: Date;
  isOverThreshold?: boolean;
  lastAlarmSentAt?: Date;
  alarmCount?: number;
  updatedAt: Date;
};

export type CreateRateLimitLogParams = {
  identifier: string;
  endpoint: string;
  action: "allowed" | "blocked_ip" | "blocked_global";
  globalCount?: number;
  ipCount?: number;
  userAgent?: string;
  country?: string;
};

export async function getRateLimit(
  db: DrizzleD1Database,
  identifier: string,
  endpoint: string,
): Promise<RateLimit | undefined> {
  const result = await db
    .select()
    .from(rateLimitsTable)
    .where(
      and(
        eq(rateLimitsTable.identifier, identifier),
        eq(rateLimitsTable.endpoint, endpoint),
      ),
    )
    .limit(1);

  return result[0];
}

export async function createRateLimit(
  db: DrizzleD1Database,
  params: CreateRateLimitParams,
): Promise<RateLimit> {
  const result = await db.insert(rateLimitsTable).values(params).returning();
  return result[0];
}

export async function updateRateLimit(
  db: DrizzleD1Database,
  identifier: string,
  endpoint: string,
  params: UpdateRateLimitParams,
): Promise<void> {
  await db
    .update(rateLimitsTable)
    .set(params)
    .where(
      and(
        eq(rateLimitsTable.identifier, identifier),
        eq(rateLimitsTable.endpoint, endpoint),
      ),
    );
}

export async function createRateLimitLog(
  db: DrizzleD1Database,
  params: CreateRateLimitLogParams,
): Promise<RateLimitLog> {
  const result = await db.insert(rateLimitLogsTable).values(params).returning();
  return result[0];
}

export async function deleteExpiredRateLimits(
  db: DrizzleD1Database,
  now: Date,
): Promise<void> {
  await db.delete(rateLimitsTable).where(lt(rateLimitsTable.resetsAt, now));
}
