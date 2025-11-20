import { Context, Next } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { Bindings } from "../../index";
import { GLOBAL_RATE_LIMIT } from "./config";
import {
  getRateLimit,
  createRateLimit,
  updateRateLimit,
  createRateLimitLog,
  deleteExpiredRateLimits,
} from "../../models/ratelimit";
import { sendRateLimitAlert } from "./alerts";

export async function rateLimitMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next,
): Promise<Response | void> {
  const db = drizzle(c.env.DB);
  const now = new Date();
  const identifier = "global:all";
  const endpoint = "global";

  await deleteExpiredRateLimits(db, now);

  let rateLimit = await getRateLimit(db, identifier, endpoint);

  if (!rateLimit) {
    const resetsAt = new Date(now.getTime() + GLOBAL_RATE_LIMIT.windowMs);
    rateLimit = await createRateLimit(db, {
      identifier,
      endpoint,
      requests: 0,
      resetsAt,
    });
  }

  if (now > rateLimit.resetsAt) {
    const resetsAt = new Date(now.getTime() + GLOBAL_RATE_LIMIT.windowMs);
    await updateRateLimit(db, identifier, endpoint, {
      requests: 0,
      resetsAt,
      isOverThreshold: false,
      updatedAt: now,
    });
    rateLimit.requests = 0;
    rateLimit.isOverThreshold = false;
  }

  const newCount = rateLimit.requests + 1;

  if (newCount > GLOBAL_RATE_LIMIT.limit) {
    await createRateLimitLog(db, {
      identifier,
      endpoint: c.req.path,
      action: "blocked_global",
      globalCount: newCount,
      userAgent: c.req.header("user-agent"),
      country: c.req.header("cf-ipcountry"),
    });

    return c.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(
          (rateLimit.resetsAt.getTime() - now.getTime()) / 1000,
        ),
      },
      429,
    );
  }

  const shouldAlert =
    newCount >= GLOBAL_RATE_LIMIT.alertThreshold && !rateLimit.isOverThreshold;

  const shouldResendAlert =
    rateLimit.isOverThreshold &&
    rateLimit.lastAlarmSentAt &&
    now.getTime() - rateLimit.lastAlarmSentAt.getTime() >
      GLOBAL_RATE_LIMIT.alertCooldownMs;

  if (shouldAlert || shouldResendAlert) {
    await sendRateLimitAlert(c, {
      currentCount: newCount,
      limit: GLOBAL_RATE_LIMIT.limit,
      threshold: GLOBAL_RATE_LIMIT.alertThreshold,
      identifier,
      endpoint,
    });

    await updateRateLimit(db, identifier, endpoint, {
      requests: newCount,
      isOverThreshold: true,
      lastAlarmSentAt: now,
      alarmCount: (rateLimit.alarmCount || 0) + 1,
      updatedAt: now,
    });
  } else {
    await updateRateLimit(db, identifier, endpoint, {
      requests: newCount,
      updatedAt: now,
    });
  }

  await createRateLimitLog(db, {
    identifier,
    endpoint: c.req.path,
    action: "allowed",
    globalCount: newCount,
    userAgent: c.req.header("user-agent"),
    country: c.req.header("cf-ipcountry"),
  });

  await next();
}
