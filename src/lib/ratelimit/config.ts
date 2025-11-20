export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  alertThreshold: number;
  alertCooldownMs: number;
};

export const GLOBAL_RATE_LIMIT: RateLimitConfig = {
  limit: 1000,
  windowMs: 60 * 60 * 1000,
  alertThreshold: 500,
  alertCooldownMs: 60 * 60 * 1000,
};
